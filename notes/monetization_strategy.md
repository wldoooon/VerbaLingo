# MiniYouGlish: The AI Cost & Monetization Strategy Journey

This document captures the entire strategic journey, mental models, and exact mathematical calculations we went through to design a highly profitable, infinitely scalable AI Credit System for a student founder.

## 1. The Core Problem

Initially, the app used a hardcoded "X chats per day" limit (e.g., Free = 10 chats, Pro = 50 chats).
**The Flaw:** All chats are not equal. If a user asks "What is 'do'?", that costs 50 tokens. If a user asks "Compare 'do' and 'make' using tables with the last 3 messages as history", that costs 1,500 tokens.
**The Solution:** A strictly quantified **Credit-Based System**, tracking exact Input/Output tokens, visually represented to the user as "Sparks" or an "Energy Bar" to hide the technical jargon.

## 2. The Input & Output Control Strategy

To guarantee our costs remain predictable and low, we built restrictions on both ends of the AI interaction:

- **Input (Frontend limitation):** Added a strict `maxLength=250` character limit to the chat bar to prevent users from dumping essays into the prompt.
- **Input (Context Sliding Window):** Initially pushing 3 historical messages, but identified this as a major cost driver. Injecting past responses (especially those formatted with Markdown tables) drastically inflates prompt tokens.
- **Output (System Prompting):** Engineered the system prompt to explicitly limit generation: _"Max 2-3 paragraphs or 1 table. Be direct and highly educational."_
- **Output (Hardware Cutoff):** Enforced a strict `max_tokens=400` limit on the API request so the AI physically cannot ramble and drain funds.

## 3. The "Ghost Calculator" (Testing for $0.00)

As a student founder, paying to test pricing strategies is risky. We needed to know exactly how many tokens our specific use-case consumes before buying credits.

- **The Solution:** We turned the backend into a "Ghost Calculator".
- **The Code (`app/services/groq_service.py`):** We stayed on the _free_ Groq API but injected `extra_body={"stream_options": {"include_usage": True}}` into the OpenAI-compatible stream.
- **The Interceptor:** We caught the final streaming chunk (the receipt) and printed it directly to the terminal.
- **The Real-World Result:** We successfully captured a heavy interaction:
  `Input=1017 | Output=492 | Total=1509 tokens`.

## 4. The Exact DeepSeek-V3 Math

We selected DeepSeek-V3 (Non-thinking Mode) over OpenRouter as our target engine due to its industry-shattering price-to-performance ratio.

**Raw API Costs:**

- $0.14 per 1,000,000 Input Tokens (Assuming Cache Miss, though Cache Hits are 90% cheaper at $0.014).
- $0.28 per 1,000,000 Output Tokens.

**Calculating Our Benchmark (The 1509 Token Query):**

- Input Cost: (1017 / 1,000,000) \* $0.14 = $0.00014238
- Output Cost: (492 / 1,000,000) \* $0.28 = $0.00013776
- **Total Cost per Heavy Query:** $0.00028014 (About 0.028 cents).

**The Blended Economy:**
Based on our 2/3 Input and 1/3 Output ratio, the ultimate blended cost is roughly **$0.186 USD per 1,000,000 combined tokens**.

## 5. The "Sparks" Currency Translation

To make the UI friendly, we translate technical "Tokens" into "Credits", and "Credits" into visual "Sparks".

- **1 Credit** = 1 Backend Token.
- **1 Spark** = 1,000 Credits (Tokens).
- **Exact Cost per Spark:** $0.000186 USD.

_Note: Since an average heavy query costs ~1,500 tokens, 1 query drains exactly 1.5 Sparks._

## 6. The Final Monetization Tiers (The Genius Strategy)

Our previous jump from 50 Sparks (Free) to 2,000 Sparks (Pro for $5) left money on the table. We needed a "Bridge" tier—an impulse buy. Here is the finalized profit architecture:

### 🟢 1. The Free Tier (The Teaser/Paywall)

**Goal:** Give them just enough to realize how powerful the formatting, tables, and AI explanations are, then shut off their engine.

- **Allocation:** 30 Sparks / month (30,000 Tokens).
- **Practical Use:** Exactly 20 Heavy Queries.
- **Your Exact API Cost:** $0.00558 USD (Half a penny per user).
- **Profit Strategy:** A cost close to $0.00 acts as high-leverage marketing.

### 🟡 2. The Plus/Starter Tier (The Impulse Buy) _[NEW]_

**Goal:** The no-brainer purchase for students who hit the paywall but hesitate at $5. Less than the cost of a coffee.

- **Price:** $1.99 / month
- **Allocation:** 300 Sparks / month (300,000 Tokens).
- **Practical Use:** ~200 Queries per month (~6 queries a day).
- **Your Exact API Cost:** $0.0558 USD.
- **Profit:** **$1.934 per user (97% Margin).**

### 🔵 3. The Pro Tier (The Serious Student)

**Goal:** The primary revenue engine for users deeply relying on the app for exams, tutoring, or daily studies.

- **Price:** $4.99 / month
- **Allocation:** 2,000 Sparks / month (2,000,000 Tokens).
- **Practical Use:** ~1,333 Queries per month (~44 queries a day).
- **Your Exact API Cost:** $0.372 USD.
- **Profit:** **$4.618 per user (92.5% Margin).**

### 🟣 4. The Unlimited/Scholar Tier (The Whale Catcher)

**Goal:** Capture power users drawn to "Unlimited" branding while capping database risk internally (Fair Use Policy).

- **Price:** $14.99 / month
- **Allocation:** 10,000 Sparks / month (10,000,000 Tokens).
- **Practical Use:** ~6,666 Queries per month (~220 queries a day - impossible for a normal human).
- **Your Exact API Cost:** $1.86 USD.
- **Profit:** **$13.13 per user (87.5% Margin).**

## 7. Next Technical Steps

1. **Backend Database:** Update `UserUsage` in PostgreSQL to use `ai_credit_balance (Integer)`, defaulting Free users to `30000`.
2. **Backend Engine:** Subtract exact `total_tokens` received by the Ghost Calculator directly from the database row on every successful prompt.
3. **Frontend UI:** Divide the database `ai_credit_balance` by 1000 to display the beautiful visual "Sparks" or "Energy Bar" interface, shutting down the prompt input box instantly when `Sparks <= 0`.
