---
id: sync-01
title: "Implement Batch Sync Logic"
status: Triage
priority: High
project: project
created: 2026-02-06
updated: 2026-02-06
links:
  - url: ../linear_ticket_parent.md
    title: Parent Ticket
---

# Description

## Problem to solve
We need the "Janitor" function that actually does the work of moving data from Redis to Postgres.

## Solution
Create a service function that:
1. Atomically pops all IDs from `usage:dirty_users`.
2. Fetches counters from Redis.
3. Performs a bulk update in PostgreSQL.
