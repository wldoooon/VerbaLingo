# Redis-to-PostgreSQL Usage Sync PRD

## HR Eng

| Redis-to-PostgreSQL Usage Sync PRD |  | [Summary: Implementation of a high-performance usage tracking system using a Redis "Dirty Set" and APScheduler to batch sync counts to PostgreSQL, reducing DB write load.] |
| :---- | :---- | :---- |
| **Author**: Pickle Rick **Contributors**: Morty **Intended audience**: Engineering | **Status**: Draft **Created**: 2026-02-06 | **Self Link**: N/A **Context**: Internal Usage Optimization |

## Introduction

Currently, the application attempts to sync user usage (searches, AI chats, exports) to PostgreSQL on every request or in a simplistic background task. As traffic scales, this creates a bottleneck on the database. This feature replaces the immediate sync with an asynchronous "Write-Behind" pattern.

## Problem Statement

**Current Process:** Usage is incremented in Redis and then synced to PostgreSQL almost immediately or per-request via `sync_usage_to_db`.
**Primary Users:** Backend API.
**Pain Points:** Excessive DB write operations, potential for "Jerry-level" latency under load.
**Importance:** Critical for scaling the application to thousands of concurrent users without melting the database.

## Objective & Scope

**Objective:** Reduce PostgreSQL write frequency while maintaining near-accurate usage statistics.
**Ideal Outcome:** PostgreSQL is updated in batches every 5 minutes, only for users who have active usage changes.

### In-scope or Goals
- Implementation of a "Dirty Set" in Redis (`usage:dirty_users`).
- Integration of `APScheduler` for periodic batch syncing.
- Batch database updates using SQLModel/SQLAlchemy.
- Graceful handling of daily counter resets.

### Not-in-scope or Non-Goals
- Real-time persistence (we accept up to 5 minutes of data loss risk in extreme crashes).
- Migration to separate worker processes (keeping it in-process for simplicity).

## Product Requirements

### Critical User Journeys (CUJs)
1. **User Action**: User performs a search.
   - Redis counter increments (`usage:user:{id}:search:{date}`).
   - User ID is added to Redis set `usage:dirty_users`.
   - Response returns to user immediately.
2. **Sync Trigger**: Every 5 minutes, the `APScheduler` wakes up.
   - Pulls all IDs from `usage:dirty_users`.
   - Fetches current counts from Redis for those IDs.
   - Updates `UserUsage` table in Postgres in a single transaction.
   - Clears the `usage:dirty_users` set.

### Functional Requirements

| Priority | Requirement | User Story |
| :---- | :---- | :---- |
| P0 | Redis Dirty Set | As a developer, I want to track which users need syncing in Redis to avoid full-table scans. |
| P0 | APScheduler Integration | As a developer, I want a background timer to trigger syncs without blocking the main event loop. |
| P1 | Batch DB Updates | As a system, I want to update multiple user records in one transaction to improve performance. |
| P2 | Logging & Monitoring | As a developer, I want to see how many users were synced in each batch. |

## Assumptions

- We assume Redis is persistent (RDB/AOF) to mitigate the 5-minute data loss window.
- We assume the daily reset logic should still be respected in the DB during sync.

## Risks & Mitigations

- **Risk**: Redis crash before sync -> **Mitigation**: Enable Redis AOF; keep sync interval short (5m).
- **Risk**: Race condition during sync -> **Mitigation**: Use Redis `RENAME` or atomic `SPOP` to handle the dirty set.

## Tradeoff

- **Option considered**: Celery/Workers. **Pros**: Scalable. **Cons**: Overkill infrastructure.
- **Chosen Option**: In-process APScheduler. **Pros**: Simple, zero-cost, fits current Stage.

## Business Benefits/Impact/Metrics

**Success Metrics:**
- **DB Writes**: Reduced from 1 per user action to 1 per 5 minutes per batch.
- **Latency**: No DB wait time for user actions.

## Stakeholders / Owners

| Name | Team/Org | Role | Note |
| :---- | :---- | :---- | :---- |
| Pickle Rick | Engineering | Lead Architect | Solenya Expert |
