# CI/CD — Part 1: What Problem Are We Solving?

> **Series:** CI/CD from A to Z  
> **Part:** 1 of 3  
> **Tags:** #cicd #devops #github-actions #learning  
> **Date:** 2026-02-15

---

## The Pain (What Manual Deployment Looks Like)

Every time you want to update your live app on the VPS, you'd have to do this **manually**:

```
You (sitting at your laptop):

  1. Finish coding a feature
  2. Test it locally
  3. Open terminal
  4. git add . && git commit -m "fix search" && git push
  5. Open another terminal
  6. ssh root@YOUR_VPS_IP
  7. cd /opt/verbalingo
  8. git pull origin main
  9. docker compose down
  10. docker compose up -d --build
  11. docker compose logs -f backend   ← watch for errors
  12. Open browser, test the live site
  13. Pray nothing broke
```

That's **13 steps**. Every. Single. Time.

Imagine: It's 2 AM. You found a critical bug — users can't log in. You fix the code in 30 seconds. But deploying that fix? 10 minutes of SSH-ing, pulling, rebuilding, watching logs, and praying.

**What if you forget a step?** Or mistype a command? Or your VPS runs out of disk space and you don't notice?

**Humans make mistakes under pressure. Machines don't.**

---

## The Two Words: CI and CD

These aren't the same thing. They solve **different problems**:

```
CI = Continuous Integration
─────────────────────────
"Every time someone pushes code, AUTOMATICALLY test it
 and make sure it doesn't break anything."

The question CI answers:
  "Is this code safe to deploy?"


CD = Continuous Deployment (or Delivery)
────────────────────────────────────────
"Once we KNOW the code is safe, AUTOMATICALLY
 put it on the production server."

The question CD answers:
  "How do we get safe code to users?"
```

### The Assembly Line Analogy

```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌─────────────┐
│  Developer  │    │  CI: Quality │    │  CD: Ship it │    │   Users     │
│  writes     │───►│  Control     │───►│  to          │───►│   see the   │
│  code       │    │  Inspector   │    │  production  │    │   change    │
└─────────────┘    └──────────────┘    └──────────────┘    └─────────────┘
                         │                    │
                    "Does it build?"    "Deploy to VPS"
                    "Do tests pass?"   "Restart containers"
                    "Any lint errors?" "Verify health"
```

**CI without CD** = You know the code is safe, but you still deploy manually.  
**CD without CI** = You deploy automatically, but you might deploy broken code. 💀  
**CI + CD together** = Code is tested AND deployed automatically. The dream.

---

## Continuous Delivery vs. Continuous Deployment

The industry uses two flavors of "CD":

### Continuous DELIVERY

```
Code is automatically tested and PACKAGED (Docker image built).
But a human clicks "Deploy" to push it live.

git push → [auto test] → [auto build image] → HUMAN clicks deploy → live
                                                    ▲
                                               You decide WHEN

Good for: Teams that want a safety net. Banks, hospitals, etc.
```

### Continuous DEPLOYMENT

```
Code is automatically tested, packaged, AND deployed. No human involved.

git push → [auto test] → [auto build image] → [auto deploy] → live

No human in the loop. Fully automatic.

Good for: Fast-moving startups, personal projects, Netflix, Facebook.
```

For a solo developer project like VerbaLingo, **Continuous Deployment** is the right choice. You push, it deploys. If it breaks, you push a fix and it deploys again.

---

## Where Does GitHub Actions Fit?

GitHub Actions is **the machine that runs the assembly line.** It's a service that GitHub gives you for free (2,000 minutes/month for private repos, unlimited for public).

When an **event** happens in your repository (like a `git push`), GitHub Actions:

1. Spins up a **fresh Linux virtual machine** (called a "runner")
2. Clones your code into it
3. Runs whatever **commands** you tell it to
4. Reports success or failure
5. Destroys the VM

```
YOUR LAPTOP                    GITHUB                         YOUR VPS
┌──────────┐    git push    ┌───────────────────┐   SSH    ┌──────────┐
│          │ ──────────────►│ GitHub detects     │────────►│          │
│ You push │                │ the push event     │         │ App gets │
│ code     │                │                    │         │ updated  │
│          │                │ Spins up a VM:     │         │          │
└──────────┘                │ ┌───────────────┐  │         └──────────┘
                            │ │ Ubuntu runner  │  │
                            │ │               │  │
                            │ │ 1. Clone code  │  │
                            │ │ 2. Run tests   │  │
                            │ │ 3. Build image │  │
                            │ │ 4. SSH to VPS  │  │
                            │ │ 5. Deploy      │  │
                            │ └───────────────┘  │
                            │                    │
                            │ VM destroyed after │
                            └───────────────────┘
```

**Key insight:** The runner is NOT your laptop. It's NOT your VPS. It's a temporary machine that GitHub creates just for this job, then throws away. Like a disposable worker — shows up, does the job, disappears.

---

## The 3 Core Concepts

Before anything else, burn these into your brain:

| Concept      | What it is                                    | Analogy                                           |
| ------------ | --------------------------------------------- | ------------------------------------------------- |
| **Workflow** | A YAML file that defines the entire pipeline  | A recipe                                          |
| **Job**      | A group of steps that run on the same machine | A section of the recipe ("Prepare dough", "Bake") |
| **Step**     | A single command or action                    | One instruction ("Add 2 cups flour")              |

### Example Structure

```yaml
# This is a WORKFLOW (the recipe)
name: Deploy VerbaLingo

# WHEN should this recipe be followed?
on:
  push:
    branches: [main] # Only when pushing to main branch

# WHAT should we do?
jobs:
  # This is a JOB (a section of the recipe)
  test:
    runs-on: ubuntu-latest # Use a fresh Ubuntu VM
    steps: # These are the STEPS
      - name: Get the code
        uses: actions/checkout@v4

      - name: Run tests
        run: pytest

  # This is another JOB
  deploy:
    needs: test # Only run AFTER "test" job succeeds
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        run: echo "deploying..."
```

### The Relationship

```
Workflow
  └── Job: test
  │     ├── Step: Get the code
  │     └── Step: Run tests
  │
  └── Job: deploy (waits for "test" to pass)
        └── Step: Deploy to VPS
```

---

## Key Takeaways

- ✅ CI = automatic testing ("is this code safe?")
- ✅ CD = automatic deploying ("get safe code to users")
- ✅ GitHub Actions = the machine that runs both
- ✅ Workflow → Jobs → Steps (recipe → sections → instructions)
- ✅ Runners are **temporary VMs** that GitHub creates and destroys
