---
id: redis-01
title: "Implement Redis Dirty Set Tracking"
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
We need a way to track which users have had their usage counters updated in Redis so we don't have to scan the entire database or all Redis keys.

## Solution
Modify `increment_usage` in `app/services/usage_service.py` to use `SADD` to add the `user.id` to a Redis set named `usage:dirty_users`.
