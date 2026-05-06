import json
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sqlmodel.ext.asyncio.session import AsyncSession

from .deps import get_current_user, get_session
from ..models.user import User
from ..core.config import get_settings
from ..core.logging import logger
from ..services.billing import (
    create_checkout_url,
    get_portal_url,
    verify_webhook_signature,
    handle_webhook,
)

settings = get_settings()

router = APIRouter(prefix="/billing", tags=["Billing"])


# ── Request schemas ──────────────────────────────────────────────────────────

class CheckoutRequest(BaseModel):
    product_id: str


# ── Checkout ─────────────────────────────────────────────────────────────────

@router.post("/checkout")
async def checkout(
    body: CheckoutRequest,
    current_user: User = Depends(get_current_user),
):
    """
    Creates a Dodo checkout session for the given product.
    Returns the URL to redirect the user to — payment happens on Dodo's page.

    The actual plan upgrade does NOT happen here.
    It happens when Dodo fires the subscription.active webhook.
    """
    try:
        url = await create_checkout_url(
            user=current_user,
            product_id=body.product_id,
        )
        return {"checkout_url": url}
    except Exception as e:
        logger.error(f"[BILLING] Checkout creation failed: {e}")
        raise HTTPException(status_code=502, detail="Failed to create checkout session.")


# ── Customer Portal ──────────────────────────────────────────────────────────

@router.get("/portal")
async def portal(
    current_user: User = Depends(get_current_user),
):
    """
    Returns a Dodo customer portal URL where the user can self-serve:
    cancel, update card, download invoices — without you building any of that.
    """
    try:
        url = await get_portal_url(user=current_user)
        return {"portal_url": url}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"[BILLING] Portal URL failed: {e}")
        raise HTTPException(status_code=502, detail="Failed to get portal URL.")


# ── Webhook ──────────────────────────────────────────────────────────────────

@router.post("/webhooks/dodo", include_in_schema=False)
async def dodo_webhook(
    request: Request,
    db: AsyncSession = Depends(get_session),
    webhook_id: str = Header(..., alias="webhook-id"),
    webhook_timestamp: str = Header(..., alias="webhook-timestamp"),
    webhook_signature: str = Header(..., alias="webhook-signature"),
):
    """
    Receives all events from Dodo (subscription, payment, refund, dispute, etc.)

    Security — we do three things before trusting the payload:
      1. Read the RAW bytes (before JSON parsing — bytes must match the signature)
      2. Verify HMAC-SHA256 signature using our webhook secret
      3. Check idempotency — skip if event_id already processed

    We always return HTTP 200 once we've received and logged the event.
    Returning 4xx would cause Dodo to retry — only do that for signature failures.
    """
    # 1. Read raw body BEFORE parsing — signature is computed on exact bytes
    raw_body = await request.body()

    # 2. Verify signature — reject anything that didn't come from Dodo
    if not verify_webhook_signature(
        raw_body=raw_body,
        webhook_id=webhook_id,
        webhook_timestamp=webhook_timestamp,
        webhook_signature=webhook_signature,
    ):
        logger.warning(f"[WEBHOOK] Signature verification failed — id={webhook_id}")
        raise HTTPException(status_code=401, detail="Invalid webhook signature.")

    # 3. Parse JSON after verification
    try:
        payload = json.loads(raw_body)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON body.")

    event_id = payload.get("event_id") or webhook_id
    event_type = payload.get("event_type", "unknown")

    try:
        await handle_webhook(
            event_id=event_id,
            event_type=event_type,
            payload=payload,
            raw_body=raw_body.decode("utf-8"),
            db=db,
        )
    except Exception as e:
        # Log but return 200 — we already stored the event with processed=False
        # Returning 500 would make Dodo retry and we'd get the duplicate protection hit,
        # but cleaner to return 200 and replay manually from webhook_events table.
        logger.error(f"[WEBHOOK] Handler error for {event_type}: {e}")

    return JSONResponse({"received": True})
