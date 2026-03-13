---
id: sched-01
title: "Setup APScheduler in FastAPI"
status: Triage
priority: Medium
project: project
created: 2026-02-06
updated: 2026-02-06
links:
  - url: ../linear_ticket_parent.md
    title: Parent Ticket
---

# Description

## Problem to solve
We need a "Kitchen Timer" to trigger the sync process every 5 minutes.

## Solution
Install `apscheduler` and initialize a `BackgroundScheduler` in the FastAPI `lifespan` event (app/main.py).
