import hmac
import hashlib
import base64
from datetime import datetime, timezone
from typing import Optional

import httpx
from dodopayments import AsyncDodoPayments
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy import select

from ..core.config import get_settings
from ..core.logging import logger
from ..models.user import User, UserTier
from ..models.subscription import Subscription, SubscriptionStatus
from ..models.invoice import Invoice, PaymentStatus
from ..models.webhook_event import WebhookEvent

settings = get_settings()

# ── Dodo SDK client ──────────────────────────────────────────────────────────

def _dodo_client() -> AsyncDodoPayments:
    """
    Returns an async Dodo SDK client.
    Environment is controlled by DODO_ENVIRONMENT in .env:
      "test_mode"  → test cards, no real money
      "live_mode"  → real payments
    """
    return AsyncDodoPayments(
        bearer_token=settings.DODO_API_KEY,
        environment=settings.DODO_ENVIRONMENT,
    )


# ── Product → plan mapping ───────────────────────────────────────────────────

def _build_product_map() -> dict[str, tuple[str, str]]:
    s = get_settings()
    return {
        s.DODO_PRODUCT_BASIC_MONTHLY: ("basic", "monthly"),
        s.DODO_PRODUCT_BASIC_YEARLY:  ("basic", "yearly"),
        s.DODO_PRODUCT_PRO_MONTHLY:   ("pro",   "monthly"),
        s.DODO_PRODUCT_PRO_YEARLY:    ("pro",   "yearly"),
        s.DODO_PRODUCT_MAX_MONTHLY:   ("max",   "monthly"),
        s.DODO_PRODUCT_MAX_YEARLY:    ("max",   "yearly"),
    }


PRODUCT_MAP = _build_product_map()

PLAN_TO_TIER = {
    "basic": UserTier.BASIC,
    "pro":   UserTier.PRO,
    "max":   UserTier.MAX,
}


# ── Checkout ─────────────────────────────────────────────────────────────────

async def create_checkout_url(user: User, product_id: str) -> str:
    """
    Creates a Dodo checkout session and returns the payment URL.
    The user is redirected here — they pay on Dodo's page, not yours.

    The actual plan upgrade happens later via the subscription.active webhook,
    NOT here. Never trust the success redirect for access control.
    """
    async with _dodo_client() as client:
        response = await client.checkout_sessions.create(
            product_cart=[{"product_id": product_id, "quantity": 1}],
            return_url=f"{settings.FRONTEND_URL}/billing/success",
            customer_email=user.email,
            metadata={"user_id": str(user.id)},
        )
        return response.url


# ── Customer Portal ──────────────────────────────────────────────────────────

DODO_API_BASE = {
    "test_mode": "https://test.dodopayments.com",
    "live_mode":  "https://api.dodopayments.com",
}


async def get_portal_url(user: User) -> str:
    """
    Returns the Dodo customer self-service portal URL.
    User can cancel, update card, download invoices — without you building any UI.

    The SDK doesn't cover this endpoint yet so we use httpx directly.
    """
    if not user.dodo_customer_id:
        raise ValueError("User has no Dodo customer ID — they have never subscribed.")

    base_url = DODO_API_BASE.get(settings.DODO_ENVIRONMENT, DODO_API_BASE["test_mode"])

    async with httpx.AsyncClient(
        base_url=base_url,
        headers={
            "Authorization": f"Bearer {settings.DODO_API_KEY}",
            "Content-Type": "application/json",
        },
        timeout=30.0,
    ) as client:
        response = await client.post(
            f"/customers/{user.dodo_customer_id}/customer-portal",
            json={"return_url": f"{settings.FRONTEND_URL}/billing"},
        )
        response.raise_for_status()
        return response.json()["url"]


# ── Webhook Signature Verification ──────────────────────────────────────────

def verify_webhook_signature(
    raw_body: bytes,
    webhook_id: str,
    webhook_timestamp: str,
    webhook_signature: str,
) -> bool:
    """
    Verifies the webhook came from Dodo using HMAC-SHA256 (Svix standard).

    Dodo uses Svix for webhook delivery. The signed content is:
      "{webhook_id}.{webhook_timestamp}.{raw_body}"

    The secret starts with "whsec_" — that prefix is stripped before use.
    Returns False if secret is missing or signature doesn't match.
    """
    secret = settings.DODO_WEBHOOK_SECRET
    if not secret:
        logger.warning("DODO_WEBHOOK_SECRET not set — rejecting all webhooks")
        return False

    signed_content = f"{webhook_id}.{webhook_timestamp}.{raw_body.decode('utf-8')}"
    secret_bytes = base64.b64decode(secret.removeprefix("whsec_"))

    computed = hmac.new(
        secret_bytes,
        signed_content.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    computed_b64 = base64.b64encode(computed).decode()

    # Header may contain multiple space-separated signatures (key rotation)
    for sig in webhook_signature.split(" "):
        if sig.startswith("v1,") and hmac.compare_digest(sig[3:], computed_b64):
            return True

    return False


# ── Webhook Dispatcher ───────────────────────────────────────────────────────

async def handle_webhook(
    event_id: str,
    event_type: str,
    payload: dict,
    raw_body: str,
    db: AsyncSession,
) -> None:
    """
    Routes each Dodo webhook event to the correct handler.

    Idempotency: we insert the event log row first (unique on dodo_event_id).
    If Dodo retries the same event, the select check returns early.
    All DB writes happen in one transaction — no split-brain possible.
    """
    # Idempotency check — skip if already processed
    result = await db.exec(
        select(WebhookEvent).where(WebhookEvent.dodo_event_id == event_id)
    )
    if result.first():
        logger.info(f"[WEBHOOK] Duplicate event skipped: {event_id}")
        return

    # Insert event log immediately as the idempotency lock
    event_log = WebhookEvent(
        dodo_event_id=event_id,
        event_type=event_type,
        payload=raw_body,
        processed=False,
    )
    db.add(event_log)
    await db.flush()

    try:
        data = payload.get("data", {})
        logger.info(f"[WEBHOOK] Processing {event_type} id={event_id}")

        if event_type == "subscription.active":
            await _on_subscription_active(data, db, event_log)
        elif event_type == "subscription.renewed":
            await _on_subscription_renewed(data, db, event_log)
        elif event_type == "subscription.cancelled":
            await _on_subscription_cancelled(data, db, event_log)
        elif event_type == "subscription.on_hold":
            await _on_subscription_on_hold(data, db, event_log)
        elif event_type == "subscription.expired":
            await _on_subscription_expired(data, db, event_log)
        elif event_type == "subscription.plan_changed":
            await _on_subscription_plan_changed(data, db, event_log)
        elif event_type == "payment.succeeded":
            await _on_payment_succeeded(data, db, event_log)
        elif event_type == "payment.failed":
            await _on_payment_failed(data, db, event_log)
        elif event_type == "refund.succeeded":
            await _on_refund_succeeded(data, db, event_log)
        elif event_type == "dispute.opened":
            logger.warning(f"[WEBHOOK] Dispute opened — manual review needed: {data}")
        else:
            logger.info(f"[WEBHOOK] Unhandled event type: {event_type}")

        event_log.processed = True
        db.add(event_log)
        await db.commit()

    except Exception as e:
        # Rollback any partial writes (e.g. flushed subscription rows that didn't fully commit).
        # Then open a clean transaction to persist the error record.
        await db.rollback()
        event_log.processing_error = str(e)
        event_log.processed = False
        db.add(event_log)
        try:
            await db.commit()
        except Exception:
            logger.error(f"[WEBHOOK] Could not persist error record for event {event_id}")
        logger.error(f"[WEBHOOK] Handler failed for {event_type}: {e}")
        raise


# ── Helpers ──────────────────────────────────────────────────────────────────

async def _get_user_from_data(data: dict, db: AsyncSession) -> Optional[User]:
    """
    Finds the user from webhook data.
    Priority: metadata.user_id → dodo_customer_id → email
    """
    user_id = data.get("metadata", {}).get("user_id")
    if user_id:
        user = await db.get(User, user_id)
        if user:
            return user

    customer = data.get("customer", {})
    dodo_customer_id = customer.get("customer_id")
    if dodo_customer_id:
        result = await db.exec(
            select(User).where(User.dodo_customer_id == dodo_customer_id)
        )
        user = result.first()
        if user:
            return user

    email = customer.get("email")
    if email:
        result = await db.exec(select(User).where(User.email == email))
        return result.first()

    return None


async def _get_subscription(dodo_subscription_id: str, db: AsyncSession) -> Optional[Subscription]:
    result = await db.exec(
        select(Subscription).where(
            Subscription.dodo_subscription_id == dodo_subscription_id
        )
    )
    return result.first()


def _parse_dt(value: str | None) -> Optional[datetime]:
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


# ── Subscription Handlers ────────────────────────────────────────────────────

async def _on_subscription_active(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    """
    First payment succeeded — create subscription row and upgrade user tier.
    Both updates happen in the same transaction. No split-brain possible.
    """
    user = await _get_user_from_data(data, db)
    if not user:
        raise ValueError(f"User not found for subscription.active: {data}")

    product_id = data.get("product_id", "")
    mapping = PRODUCT_MAP.get(product_id)
    if not mapping:
        raise ValueError(f"Unknown product_id '{product_id}' — add it to PRODUCT_MAP or .env")
    plan, billing_period = mapping
    dodo_customer_id = data.get("customer", {}).get("customer_id", "")

    if not user.dodo_customer_id:
        user.dodo_customer_id = dodo_customer_id

    user.tier = PLAN_TO_TIER[plan]

    sub = Subscription(
        user_id=user.id,
        dodo_subscription_id=data.get("subscription_id", ""),
        dodo_customer_id=dodo_customer_id,
        dodo_product_id=product_id,
        plan=plan,
        billing_period=billing_period,
        status=SubscriptionStatus.ACTIVE,
        cancel_at_period_end=False,
        current_period_start=_parse_dt(data.get("current_billing_period_start")),
        current_period_end=_parse_dt(data.get("current_billing_period_end")),
        started_at=_parse_dt(data.get("created_at")),
    )

    db.add(user)
    db.add(sub)
    await db.flush()

    event_log.user_id = user.id
    event_log.subscription_id = sub.id
    event_log.dodo_subscription_id = sub.dodo_subscription_id

    logger.success(f"[WEBHOOK] {user.email} upgraded to {plan} ({billing_period})")


async def _on_subscription_renewed(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    """Renewal succeeded — extend the billing period dates."""
    sub = await _get_subscription(data.get("subscription_id", ""), db)
    if not sub:
        raise ValueError(f"Subscription not found: {data.get('subscription_id')}")

    sub.status = SubscriptionStatus.ACTIVE
    sub.cancel_at_period_end = False
    sub.current_period_start = _parse_dt(data.get("current_billing_period_start"))
    sub.current_period_end = _parse_dt(data.get("current_billing_period_end"))
    sub.updated_at = datetime.now(timezone.utc)

    db.add(sub)
    event_log.subscription_id = sub.id
    event_log.user_id = sub.user_id

    logger.info(f"[WEBHOOK] Subscription {sub.id} renewed until {sub.current_period_end}")


async def _on_subscription_cancelled(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    """
    User cancelled — flag it but keep access until current_period_end.
    Downgrade happens at subscription.expired, not here.
    """
    sub = await _get_subscription(data.get("subscription_id", ""), db)
    if not sub:
        raise ValueError(f"Subscription not found: {data.get('subscription_id')}")

    sub.status = SubscriptionStatus.CANCELLED
    sub.cancel_at_period_end = True
    sub.canceled_at = datetime.now(timezone.utc)
    sub.updated_at = datetime.now(timezone.utc)

    db.add(sub)
    event_log.subscription_id = sub.id
    event_log.user_id = sub.user_id

    logger.info(f"[WEBHOOK] Subscription {sub.id} cancelled — access until {sub.current_period_end}")


async def _on_subscription_on_hold(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    """Payment failed — dunning started. Flag it but don't cut access yet."""
    sub = await _get_subscription(data.get("subscription_id", ""), db)
    if not sub:
        raise ValueError(f"Subscription not found: {data.get('subscription_id')}")

    sub.status = SubscriptionStatus.ON_HOLD
    sub.updated_at = datetime.now(timezone.utc)

    db.add(sub)
    event_log.subscription_id = sub.id
    event_log.user_id = sub.user_id

    logger.warning(f"[WEBHOOK] Subscription {sub.id} on hold — dunning started")


async def _on_subscription_expired(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    """
    Period ended — downgrade user to free.
    Both subscription status and user tier update atomically.
    """
    sub = await _get_subscription(data.get("subscription_id", ""), db)
    if not sub:
        raise ValueError(f"Subscription not found: {data.get('subscription_id')}")

    user = await db.get(User, sub.user_id)
    if not user:
        raise ValueError(f"User {sub.user_id} not found during expiry")

    user.tier = UserTier.FREE
    sub.status = SubscriptionStatus.EXPIRED
    sub.ended_at = datetime.now(timezone.utc)
    sub.updated_at = datetime.now(timezone.utc)

    db.add(user)
    db.add(sub)
    event_log.subscription_id = sub.id
    event_log.user_id = sub.user_id

    logger.info(f"[WEBHOOK] {user.email} downgraded to free — subscription expired")


async def _on_subscription_plan_changed(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    """Upgrade or downgrade — update plan, billing period, and user tier atomically."""
    sub = await _get_subscription(data.get("subscription_id", ""), db)
    if not sub:
        raise ValueError(f"Subscription not found: {data.get('subscription_id')}")

    user = await db.get(User, sub.user_id)
    if not user:
        raise ValueError(f"User {sub.user_id} not found during plan change")

    new_product_id = data.get("product_id", "")
    plan, billing_period = PRODUCT_MAP.get(new_product_id) or (sub.plan, sub.billing_period)
    if not PRODUCT_MAP.get(new_product_id):
        logger.warning(f"[WEBHOOK] Unknown product_id '{new_product_id}' on plan change — keeping existing plan")

    sub.plan = plan
    sub.billing_period = billing_period
    sub.dodo_product_id = new_product_id
    sub.status = SubscriptionStatus.ACTIVE
    sub.current_period_start = _parse_dt(data.get("current_billing_period_start"))
    sub.current_period_end = _parse_dt(data.get("current_billing_period_end"))
    sub.updated_at = datetime.now(timezone.utc)

    user.tier = PLAN_TO_TIER.get(plan, UserTier.FREE)

    db.add(sub)
    db.add(user)
    event_log.subscription_id = sub.id
    event_log.user_id = sub.user_id

    logger.info(f"[WEBHOOK] {user.email} plan changed to {plan} ({billing_period})")


# ── Payment Handlers ─────────────────────────────────────────────────────────

async def _on_payment_succeeded(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    await _upsert_invoice(data, PaymentStatus.SUCCEEDED, db, event_log)


async def _on_payment_failed(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    await _upsert_invoice(data, PaymentStatus.FAILED, db, event_log)


async def _on_refund_succeeded(data: dict, db: AsyncSession, event_log: WebhookEvent) -> None:
    """Mark an existing invoice as refunded."""
    payment_id = data.get("payment_id") or data.get("id", "")
    result = await db.exec(
        select(Invoice).where(Invoice.dodo_payment_id == payment_id)
    )
    invoice = result.first()
    if invoice:
        invoice.status = PaymentStatus.REFUNDED
        db.add(invoice)
        event_log.user_id = invoice.user_id
        event_log.subscription_id = invoice.subscription_id
        logger.info(f"[WEBHOOK] Invoice {invoice.id} marked as refunded")


async def _upsert_invoice(
    data: dict,
    status: PaymentStatus,
    db: AsyncSession,
    event_log: WebhookEvent,
) -> None:
    """Creates an invoice row from a payment event. Skips duplicates."""
    payment_id = data.get("payment_id") or data.get("id", "")

    existing = await db.exec(
        select(Invoice).where(Invoice.dodo_payment_id == payment_id)
    )
    if existing.first():
        return

    sub_id = data.get("subscription_id", "")
    sub = await _get_subscription(sub_id, db) if sub_id else None
    user = await db.get(User, sub.user_id) if sub else None

    if not sub or not user:
        logger.warning(f"[WEBHOOK] Could not link invoice — payment_id={payment_id}")
        return

    invoice = Invoice(
        user_id=user.id,
        subscription_id=sub.id,
        dodo_payment_id=payment_id,
        amount=data["amount"] if data.get("amount") is not None else data.get("total_amount", 0),
        currency=data.get("currency", "USD").upper(),
        status=status,
        plan=sub.plan,
        billing_period=sub.billing_period,
        period_start=_parse_dt(data.get("current_billing_period_start")),
        period_end=_parse_dt(data.get("current_billing_period_end")),
    )

    db.add(invoice)
    event_log.user_id = user.id
    event_log.subscription_id = sub.id

    logger.info(f"[WEBHOOK] Invoice created — {invoice.amount} {invoice.currency} {status.value} for {user.email}")
