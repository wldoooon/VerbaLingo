---
id: sync-epic
title: "[Epic] Redis-to-PostgreSQL Usage Sync Engine"
status: Backlog
priority: High
project: project
created: 2026-02-06
updated: 2026-02-06
links:
  - url: ../docs/prd.md
    title: PRD Document
labels: [core, backend, performance]
assignee: Pickle Rick
---

# Description

## Problem to solve
The current usage sync logic is too frequent and potentially blocks the main event loop or overloads the PostgreSQL database with small, frequent writes.

## Solution
Implement a "Write-Behind" pattern using a Redis "Dirty Set" to track active users and a background scheduler (APScheduler) to flush usage counts to the database in batches every 5 minutes.
