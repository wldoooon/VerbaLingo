# Usage and Rate Limit Synchronization PRD

## HR Eng

| Usage Sync PRD |  | Synchronize server-side rate limits and usage quotas with the React UI in real-time. |
| :---- | :---- | :---- |
| **Author**: Pickle Rick **Contributors**: Morty **Intended audience**: Engineering | **Status**: Draft **Created**: 2026-02-08 | **Self Link**: [Link] **Context**: Fixing Agent Slop |

## Introduction

The application implements rate limiting and usage quotas on the backend (FastAPI), but the frontend (Next.js/React) is currently unaware of these limits until a `429 Too Many Requests` error occurs. This PRD defines a unified synchronization strategy to provide real-time usage feedback to the user.

## Problem Statement

**Current Process:** 
1. Backend tracks usage in Redis/PostgreSQL.
2. Frontend makes requests via a mix of Axios and Fetch.
3. Next.js proxy strips custom headers from the backend.
4. UI only discovers limits upon failure.

**Primary Users:** All users (Anonymous, Free, PRO).
**Pain Points:** Poor UX due to unexpected errors; lack of transparency on remaining quotas; inconsistent networking code (Agent Slop).
**Importance:** High. Essential for monetization and preventing user frustration.

## Objective & Scope

**Objective:** Create a seamless, real-time synchronization between backend usage states and the frontend UI.
**Ideal Outcome:** The user always knows exactly how much quota they have left for features like Search and AI Chat, updated instantly after every action.

### In-scope or Goals
- Unify UI networking to a single Axios client.
- Fix Next.js proxy to forward all `RateLimit-*` headers.
- Inject usage data into the `/auth/me` endpoint.
- Implement an Axios interceptor to sync headers with a Zustand store.
- Create a UI component to display remaining usage.

### Not-in-scope or Non-Goals
- Changing the actual rate-limiting logic/algorithms on the backend.
- Implementing WebSockets for usage sync (overkill for now).

## Product Requirements

### Critical User Journeys (CUJs)
1. **Initial Sync**: User logs in or refreshes the page. The app fetches their profile which includes current usage. The Sidebar immediately shows "10/50 searches used."
2. **Real-time Update**: User performs a search. The response includes headers showing 11/50 used. The Sidebar updates instantly to reflect the new count.
3. **Proactive Warning**: User reaches 45/50 searches. The Sidebar indicator turns yellow/red to warn them of the approaching limit.

### Functional Requirements

| Priority | Requirement | User Story |
| :---- | :---- | :---- |
| P0 | Unify UI to use Axios | As a developer, I want a single source for API calls to ensure interceptors work reliably. |
| P0 | Forward Headers in Proxy | As a user, I want my quota stickers (headers) to reach the UI so I can see my status. |
| P1 | Usage Store (Zustand) | As a UI component, I want to subscribe to a global usage state that updates automatically. |
| P1 | Header Interceptor | As the app, I want to automatically parse RateLimit headers from every response and update the store. |
| P2 | Usage Dashboard Component | As a user, I want a visual indicator of my remaining searches and chat messages. |

## Assumptions

- We are using the standard IETF draft for RateLimit headers (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).
- The backend has access to the `UsageService` stats during the response lifecycle.

## Risks & Mitigations

- **Risk**: Performance overhead from frequent state updates. -> **Mitigation**: Use Zustand selectors to ensure only relevant components re-render.
- **Risk**: Next.js cache might swallow headers. -> **Mitigation**: Ensure `no-store` or dynamic headers are used for usage-heavy endpoints.

## Tradeoff

- **Chosen Option**: Hybrid (Option B + C). Injecting into `/auth/me` for initial state and using headers for updates. This avoids extra "sync" calls while keeping the UI fresh.

## Business Benefits/Impact/Metrics

**Success Metrics:**
- 0% reduction in "surprise" 429 errors (since users see them coming).
- 100% consistency in UI networking code (removing slop).
- Increased visibility for "Upgrade to PRO" calls.
