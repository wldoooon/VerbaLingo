# Polar.sh: The Ultimate Indie Hacker Payment & MoR Guide (2026)

This document serves as a comprehensive, deep-dive integration guide and strategic overview for using **Polar.sh** as the primary payment processor and Merchant of Record (MoR) for SaaS and digital products. It is written specifically with the indie developer and student founder in mind, prioritizing low fees, developer experience, and automated compliance.

---

## 1. The Core Problem: Why Not Stripe or Gumroad?

As a solo developer, setting up payments isn't just about taking credit cards; it's about navigating global tax laws, subscription logic, and entitlement delivery.

- **Stripe (Direct):** Incredible API, but **you** are the Merchant of Record. This means you are legally responsible for calculating, collecting, and remitting VAT/GST/Sales Tax globally. For a student, this is an administrative nightmare. Stripe also requires strict upfront KYC before you can even accept real money.
- **Gumroad:** Handles taxes (MoR) and is easy to start. **The Flaw:** Extremely high fees (10% + $0.50 flat rate per transaction). For a $5 subscription, Gumroad takes $1.00 immediately. It's also designed for creators (PDFs, videos), not complex SaaS apps.
- **Lemon Squeezy & Paddle:** Great MoR platforms, but they enforce strict store reviews and business verification *before* you can accept your first sale. They can take days or weeks to approve your account.

### Why Polar.sh Wins:
1. **Low Fees:** At **4% + $0.40**, it is the cheapest MoR on the market (it absorbs the underlying Stripe processing fee into this 4%).
2. **Instant Selling:** You can sign up and start accepting payments *immediately*. KYC (Identity Verification) is only required before your *first payout withdrawal*, not your first sale.
3. **Developer-First:** 100% open source on GitHub. Official Python, TypeScript, and Go SDKs.
4. **Automated Entitlements (Benefits):** It natively handles license keys, GitHub repo access, Discord roles, and file downloads.
5. **Full MoR:** They handle all global taxes, fraud, and compliance.

---

## 2. Platform Architecture & Primitives

Before writing a single line of code, you must map your business model to Polar's architecture.

### A. Organizations
Your top-level entity. You log in with your personal GitHub/Email, but you create an Organization (e.g., "PokiSpokey") that owns the products and customers.

### B. Products & Pricing
Polar avoids complex matrices of "variants". A **Product** is a distinct offering that a user buys.
- **Types:** One-time purchase, Subscription (monthly/yearly), Pay-what-you-want, Usage-based (metered).
- **Mapping PokiSpokey Tiers:**
  - Product 1: "Basic Learner" ($4.99 / month) -> `prod_basic123`
  - Product 2: "Pro Student" ($8.99 / month) -> `prod_pro456`
  - Product 3: "Scholar Max" ($14.99 / month) -> `prod_scholar789`
  - Product 4: "VIP Unlimited" ($18.99 / month) -> `prod_vip000`

### C. Benefits (The "Aha!" Feature)
Benefits are automated perks attached to Products. When a user buys the Product, Polar *automatically* grants the Benefit. When they cancel, Polar revokes it.
- **License Keys:** Perfect for desktop apps.
- **Private GitHub Access:** Auto-invites users to your repository.
- **Discord Roles:** Bot auto-assigns VIP roles.
- **Custom / Webhook Benefits:** You define a custom string (e.g., `premium_features=true`). When the webhook fires, your backend reads this benefit and updates the database.

---

## 3. The Money Flow: Fees, Payouts, & KYC Reality

### The Exact Math
- **Base Fee:** 4% + 40¢ per transaction.
- **Add-ons:**
  - +0.5% for recurring subscriptions.
  - +1.5% if the buyer uses a non-US (international) credit card.
- **Example Calculation ($4.99 SaaS Subscription, US Buyer):**
  - Fee: (4.99 * 0.045) + 0.40 = $0.22 + $0.40 = $0.62.
  - You keep: $4.37.
  - *(On Gumroad, the fee would be $0.50 + $0.50 = $1.00. You save 38% on fees).*

### The KYC (Know Your Customer) Reality
**No payment processor allows you to withdraw money anonymously.** It is a global Anti-Money Laundering (AML) law.
- **The Polar Advantage:** You don't need a registered LLC or business docs. You can verify as an *Individual*.
- **The Process:** You must provide a Government ID (Passport, National ID) and take a selfie via Stripe Identity.
- **The Timeline:** You can accumulate thousands of dollars in your Polar balance *before* verifying. You only trigger the review when you want to transfer the money to your bank account via Stripe Connect.

---

## 4. The Integration Playbook (SaaS Workflow)

A professional SaaS integration relies on **Webhooks**. You do not poll the API; you wait for Polar to tell you what happened.

### The Lifecycle of a Customer:
1. **Checkout:** User clicks a Polar checkout link on your pricing page. You pass `customer_email` or `external_id` (your database user ID) in the URL to link the purchase.
2. **Payment:** User enters card details. Polar processes it via Stripe, handles taxes, and generates an `order.paid` event.
3. **Activation:** Polar sends a `subscription.active` POST webhook to your FastAPI server.
4. **Backend Logic:** Your server verifies the HMAC signature, reads the `product_id`, finds the user in PostgreSQL, and sets `tier="pro"`.
5. **Cancellation:** User goes to their Polar Customer Portal and clicks "Cancel". Polar sends `subscription.canceled`. Your server sets `tier="free"`.

---

## 5. Python (FastAPI) Backend Implementation

This is production-grade code for handling Polar webhooks securely.

### Step 1: Install the SDK
```bash
pip install polar-sdk
```

### Step 2: Set Environment Variables
```env
POLAR_WEBHOOK_SECRET=whsec_your_secret_from_polar_dashboard
POLAR_ACCESS_TOKEN=polar_pat_your_api_token
```

### Step 3: The Webhook Router (`app/api/webhooks.py`)

```python
from fastapi import APIRouter, Request, HTTPException
from polar_sdk.webhooks import validate_event, WebhookVerificationError
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

POLAR_WEBHOOK_SECRET = os.getenv("POLAR_WEBHOOK_SECRET")

# Map Polar Product IDs to your internal tiers
PRODUCT_MAP = {
    "YOUR_PROD_ID_BASIC": "basic",
    "YOUR_PROD_ID_PRO": "pro",
    "YOUR_PROD_ID_SCHOLAR": "scholar",
    "YOUR_PROD_ID_VIP": "vip",
}

@router.post("/webhooks/polar")
async def polar_webhook(request: Request):
    # 1. Read raw body for HMAC verification
    body = await request.body()
    
    # 2. Verify Signature via SDK (Crucial against forged requests)
    try:
        event = validate_event(body, request.headers, POLAR_WEBHOOK_SECRET)
    except WebhookVerificationError:
        logger.error("🚨 Invalid Polar webhook signature!")
        raise HTTPException(status_code=403, detail="Invalid signature")
    
    event_type = event.type
    data = event.data
    
    # 3. Handle Subscription Activated/Created
    # 'subscription.active' means the first payment cleared
    if event_type == "subscription.active":
        email = data.customer.email.lower()
        product_id = data.product_id
        polar_sub_id = data.id
        
        tier = PRODUCT_MAP.get(product_id, "free")
        
        # TODO: Database Operation
        # await db.users.update_one(
        #     {"email": email},
        #     {"$set": {
        #         "tier": tier,
        #         "subscription_status": "active",
        #         "polar_subscription_id": polar_sub_id
        #     }}
        # )
        logger.info(f"✅ Activated {tier} tier for {email}")

    # 4. Handle Subscription Cancellation
    # Happens at the end of the billing period, or immediately if revoked
    elif event_type in ["subscription.canceled", "subscription.revoked"]:
        email = data.customer.email.lower()
        
        # TODO: Database Operation
        # await db.users.update_one(
        #     {"email": email},
        #     {"$set": {
        #         "tier": "free",
        #         "subscription_status": "canceled"
        #     }}
        # )
        logger.info(f"❌ Canceled subscription for {email}")

    # 5. Handle Payment Failure
    elif event_type == "subscription.past_due":
        email = data.customer.email.lower()
        logger.warning(f"⚠️ Payment failed for {email}. Provide grace period or lock account.")
        # TODO: Notify user to update payment method in portal

    # 6. Idempotency & Logging
    # Always log the exact event ID processed so you don't double-process if Polar retries
    # logger.info(f"Processed Polar event {event.id} of type {event_type}")

    # 7. Acknowledge Receipt Quickly
    return {"status": "success", "message": "Webhook processed"}
```

---

## 6. The Customer Portal (Zero Frontend Work)

SaaS apps need a way for users to download receipts, update credit cards, and cancel plans. Building this from scratch takes weeks.

Polar provides a **Customer Portal** out of the box.
- URL: `https://polar.sh/PokiSpokey/portal`
- Users authenticate with an email magic link.

### The Pro Move: Customer Sessions
Instead of making users log in twice, use your API token to generate a **Customer Session ID** from your backend, and redirect the user directly into their authenticated portal.
```python
from polar_sdk import Polar
import os

polar = Polar(access_token=os.getenv("POLAR_ACCESS_TOKEN"))

# Inside a protected endpoint
async def get_billing_portal_url(user_id: str, polar_customer_id: str):
    session = await polar.customer_sessions.create(
        customer_id=polar_customer_id
    )
    return session.url # Redirect user here
```

---

## 7. Testing in the Sandbox Environment

Never develop against production. Polar has a fully separated Sandbox.

1. **Dashboard:** Switch toggle to Sandbox or go to `sandbox.polar.sh`.
2. **API Base URL:** All SDKs must be pointed to `https://sandbox-api.polar.sh`.
3. **Local Testing (The Polar CLI):**
   Instead of struggling with `ngrok`, install the Polar CLI:
   ```bash
   npm install -g @polar-sh/cli
   polar login
   polar listen http://localhost:8000/webhooks/polar
   ```
   This securely tunnels all sandbox webhooks directly to your local FastAPI server running on port 8000.
4. **Test Credit Cards:** Use Stripe's test numbers.
   - Success: `4242 4242 4242 4242` (Any future expiry date, any CVC).

---

## 8. Migration Checklist for PokiSpokey

To transition from Gumroad to Polar.sh:
1. [ ] Create Organization on Polar.sh (Sandbox).
2. [ ] Recreate all 4 pricing tiers as Subscriptions.
3. [ ] Note the Product IDs.
4. [ ] Install `polar-sdk` in the Python backend.
5. [ ] Create the `/api/webhooks/polar` route using the template above.
6. [ ] Update the Next.js Frontend Pricing Page CTAs to link to Polar Checkout URLs.
   - *Tip: Append `?customer_email=user@example.com` to the checkout URL to pre-fill their data.*
7. [ ] Add a "Manage Billing" button in the app settings that routes to the Polar Customer Portal.
8. [ ] Test the full loop (Buy -> Webhook -> DB Update -> Cancel) locally using Polar CLI.
9. [ ] Switch to Production Polar, swap API Keys, and push to live.

---
*End of Document. Prepared for continuous integration into the PokiSpokey architecture.*
