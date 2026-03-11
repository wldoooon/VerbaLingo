# CI/CD — Part 2: The Anatomy of a GitHub Actions Workflow File

> **Series:** CI/CD from A to Z  
> **Part:** 2 of 3  
> **Tags:** #cicd #devops #github-actions #yaml #learning  
> **Date:** 2026-02-15

---

## Where Does the File Live?

GitHub Actions looks for workflow files in ONE specific place:

```
MiniYouGlish/
├── .github/              ← Hidden folder (starts with a dot)
│   └── workflows/        ← GitHub ONLY looks here
│       └── deploy.yml    ← Your pipeline definition
├── app/
├── ui/
├── docker-compose.yml
└── ...
```

The path **must** be exactly `.github/workflows/`. Not `.github/workflow/` (no 's'). Not `github/workflows/`. GitHub is stubborn about this.

The file extension can be `.yml` or `.yaml` — they mean the same thing. Industry standard leans toward `.yml`.

---

## YAML: The Language of DevOps

YAML is not a programming language. It's a **data format**, like JSON but designed to be human-readable.

### JSON vs YAML Comparison

```json
// JSON — machines love it, humans tolerate it
{
  "name": "Ahmed",
  "age": 22,
  "skills": ["Python", "Docker", "Next.js"],
  "address": {
    "city": "Algiers",
    "country": "Algeria"
  }
}
```

```yaml
# YAML — same data, but readable
name: Ahmed
age: 22
skills:
  - Python
  - Docker
  - Next.js
address:
  city: Algiers
  country: Algeria
```

### Critical YAML Rules

```yaml
# RULE 1: Indentation matters. Use SPACES, never TABS.
# 2 spaces is the convention. Not 4. Not 1. Two.
jobs:
  test:           # ← 2 spaces in from "jobs"
    runs-on: ubuntu-latest   # ← 2 more spaces in from "test"

# RULE 2: Key-value pairs use colon + space
name: Deploy      # ✅ Correct (space after colon)
name:Deploy       # ❌ BROKEN (no space after colon)

# RULE 3: Lists use a dash + space
skills:
  - Python        # ✅ Correct
  -Python         # ❌ BROKEN

# RULE 4: Strings usually don't need quotes
name: Deploy VerbaLingo    # ✅ Works fine without quotes
# But they DO need quotes if the string contains special characters like : { } [ ]
description: "This deploys the app: backend + frontend"   # ✅ Quotes needed

# RULE 5: The | character means "multi-line string"
script: |
  echo "line 1"
  echo "line 2"
  echo "line 3"
# All three echo commands are part of "script"
```

> **Important:** 90% of CI/CD debugging is "why is my YAML broken?" The error messages are often cryptic, but the cause is almost always a wrong indent or a missing space.

---

## The Workflow File — Block by Block

### Block 1: Name

```yaml
name: Deploy VerbaLingo
```

This is the **display name** that shows up in the GitHub Actions tab:

```
GitHub → Your Repo → Actions tab
┌──────────────────────────────────────────┐
│ Workflows                                │
│                                          │
│  ▶ Deploy VerbaLingo    ← this name      │
│    ✅ Run #14 - fix search bug           │
│    ✅ Run #13 - add user settings        │
│    ❌ Run #12 - broke the login          │
└──────────────────────────────────────────┘
```

This name is cosmetic. It doesn't affect behavior.

---

### Block 2: Triggers (`on`)

```yaml
on:
  push:
    branches: [main]
```

This is the **WHEN**. "When should this pipeline run?"

The `on` keyword defines **events** that trigger the workflow.

#### Common Triggers

```yaml
# ── Trigger on push to main ──
on:
  push:
    branches: [main]
# "When someone pushes code to the main branch, run this workflow"
# Use for CD — deploy when code lands on main.

# ── Trigger on pull request ──
on:
  pull_request:
    branches: [main]
# "When someone opens a PR targeting main, run this workflow"
# Use for CI — test code BEFORE it merges.

# ── Trigger on both ──
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
# "Run on pushes AND pull requests to main"
# Most common setup: test on PR, deploy on push.

# ── Trigger manually (click a button in GitHub) ──
on:
  workflow_dispatch:
# Adds a "Run workflow" button in the Actions tab.
# Useful for: "Deploy NOW" without pushing code.

# ── Trigger on a schedule (cron job) ──
on:
  schedule:
    - cron: '0 3 * * *'    # Every day at 3:00 AM UTC
# Useful for: nightly builds, scheduled backups
```

For VerbaLingo, we use `push` to `main` only — because you don't want to deploy every random branch.

---

### Block 3: Environment Variables (`env`)

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

Global variables available to ALL jobs and steps.

The `${{ }}` syntax is GitHub Actions' **expression syntax** — it injects dynamic values:

```
${{ github.repository }}  →  "YourUsername/MiniYouGlish"
```

---

### Block 4: Jobs

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run backend tests
        run: |
          cd app
          pip install -r requirements.txt
          pytest

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/verbalingo
            git pull origin main
            docker compose up -d --build
```

---

#### `runs-on: ubuntu-latest`

Tells GitHub: "For this job, spin up a fresh Ubuntu Linux VM."

| Option           | Description                                    |
| ---------------- | ---------------------------------------------- |
| `ubuntu-latest`  | Ubuntu Linux (most common, use this)           |
| `ubuntu-24.04`   | Specific Ubuntu version                        |
| `windows-latest` | Windows Server (rarely needed)                 |
| `macos-latest`   | macOS (for iOS apps, costs more minutes)       |
| `self-hosted`    | YOUR OWN machine acts as the runner (advanced) |

Use Ubuntu because your VPS also runs Linux. Match CI to production.

---

#### `steps` — Two Types

Steps run **one after another**, in order. If step 2 fails, step 3 never runs.

```yaml
# TYPE 1: "uses" — Run a pre-built action (someone else's code)
- name: Checkout code
  uses: actions/checkout@v4 # ← Built by GitHub themselves

# TYPE 2: "run" — Run a shell command (your own command)
- name: Install dependencies
  run: pip install -r requirements.txt
```

**The difference:**

```
"uses" = calling a function someone already wrote
         actions/checkout@v4 → clones your repo
         docker/login-action@v3 → logs into Docker Hub
         appleboy/ssh-action@v1 → SSHes into a server

         The @v4 part = version. Like npm packages have versions.

"run"  = typing a command in the terminal yourself
         Exactly what you'd type if you SSH'd into that Ubuntu VM.
```

---

#### `actions/checkout@v4` — Why It's Always First

When GitHub spins up the runner VM, it's a **blank machine** — your code isn't there.

```
Runner VM (before checkout):
┌────────────────────────────┐
│  Empty Ubuntu machine      │
│  No files. Nothing.        │
└────────────────────────────┘

Runner VM (after checkout):
┌────────────────────────────┐
│  /home/runner/work/repo/   │
│  ├── app/                  │
│  ├── ui/                   │
│  ├── docker-compose.yml    │
│  └── ...                   │
│                            │
│  Your entire repo is here! │
└────────────────────────────┘
```

---

#### `needs` — Job Dependencies

```yaml
deploy:
  needs: test # ← "DON'T start me until 'test' succeeds"
```

Without `needs`, jobs run **in parallel**. With `needs`, they run **sequentially**:

```
Without "needs":
  test ──────────►
  deploy ────────►     Both start at the same time! BAD!

With "needs: test":
  test ──────────► ✅ passed!
                          └──► deploy ────────►

  If test fails:
  test ──────────► ❌ failed!
                          └──► deploy SKIPPED (never runs)
```

---

#### `secrets` — The Vault

```yaml
host: ${{ secrets.VPS_HOST }}
username: ${{ secrets.VPS_USER }}
key: ${{ secrets.SSH_KEY }}
```

Secrets are **encrypted values** stored in GitHub repo settings:

- **Never** printed in logs (GitHub masks them with `***`)
- **Never** visible in code
- Only the workflow can read them at runtime

Set them up in: `GitHub → Repo → Settings → Secrets and Variables → Actions → New Repository Secret`

```
┌──────────────────────────────────────────────────┐
│  Repository Secrets                              │
│                                                  │
│  Name              │  Value (hidden)             │
│  ─────────────────────────────────────────────   │
│  VPS_HOST          │  ●●●●●●●●●●                 │
│  VPS_USER          │  ●●●●●●●●●●                 │
│  SSH_KEY           │  ●●●●●●●●●●                 │
└──────────────────────────────────────────────────┘
```

**Why not hardcode?**

```yaml
# ❌ NEVER — anyone who sees your repo sees your password
host: 143.198.45.67
key: "-----BEGIN RSA PRIVATE KEY-----\nMIIEow..."

# ✅ DO THIS — the real value is locked in GitHub's vault
host: ${{ secrets.VPS_HOST }}
```

---

### Block 5: The SSH Action

This is how the runner talks to your VPS:

```yaml
- name: Deploy to VPS
  uses: appleboy/ssh-action@v1.0.3
  with:
    host: ${{ secrets.VPS_HOST }}
    username: ${{ secrets.VPS_USER }}
    key: ${{ secrets.SSH_KEY }}
    script: |
      cd /opt/verbalingo
      git pull origin main
      docker compose up -d --build
```

#### What Happens Under the Hood

```
GitHub Runner (temporary VM)              Your VPS
┌──────────────────────────┐    SSH    ┌──────────────────────────┐
│                          │          │                          │
│  appleboy/ssh-action:    │          │                          │
│                          │          │                          │
│  1. Read the SSH key     │          │                          │
│     from secrets         │          │                          │
│                          │          │                          │
│  2. Connect to VPS ──────│──────────│──►  SSH connection       │
│     using host +         │          │     established          │
│     username + key       │          │                          │
│                          │          │                          │
│  3. Send the script ─────│──────────│──►  Runs these commands: │
│     commands             │          │     cd /opt/verbalingo   │
│                          │          │     git pull origin main │
│                          │          │     docker compose up... │
│                          │          │                          │
│  4. Report success/fail  │◄─────────│──  Exit code 0 or 1     │
│                          │          │                          │
└──────────────────────────┘          └──────────────────────────┘
         │
         ▼
   VM is destroyed
   (gone forever)
```

`appleboy/ssh-action` is a **community-built action** by Bo-Yi Wu. 10,000+ stars on GitHub. The `@v1.0.3` pins a specific version.

---

## The Full Flow — Visual Summary

```
YOU: git push origin main
  │
  ▼ (1 second later)
GITHUB: "Push detected. Workflow matches. Spinning up runner..."
  │
  ▼ (10 seconds later)
RUNNER VM (ubuntu-latest):

  Job: test
  ├── Step 1: Checkout code ✅ (cloned repo)
  ├── Step 2: Set up Python ✅
  ├── Step 3: Install deps  ✅ (pip install)
  └── Step 4: Run tests     ✅ (all passed!)
  │
  ▼ (test passed, "deploy" job starts)
  Job: deploy
  ├── Step 1: SSH into VPS
  │     ├── Connected to 143.198.xx.xx ✅
  │     ├── Running: git pull ✅
  │     ├── Running: docker compose up --build ✅
  │     └── All containers healthy ✅
  └── Done!
  │
  ▼
RUNNER VM: Destroyed. Gone. Poof.
YOUR VPS: Now running the latest code.
YOUR USERS: See the update instantly.
```

---

## Key Takeaways

- ✅ Workflow files live in `.github/workflows/`
- ✅ YAML syntax: indentation (2 spaces), `key: value`, lists with `-`, multi-line with `|`
- ✅ `on:` = when to trigger (push, PR, manual, schedule)
- ✅ `runs-on:` = what machine to use (ubuntu-latest)
- ✅ `uses:` = someone else's pre-built action
- ✅ `run:` = your own shell command
- ✅ `needs:` = job dependencies (test before deploy)
- ✅ `secrets` = encrypted values stored in GitHub, not in code
- ✅ `appleboy/ssh-action` = how the runner connects to your VPS
