# CI/CD — Part 3: Secrets, SSH Keys, and the Trust Chain

> **Series:** CI/CD from A to Z  
> **Part:** 3 of 3  
> **Tags:** #cicd #devops #ssh #security #github-actions #learning  
> **Date:** 2026-02-15

---

## The Fundamental Problem

Think about what we're trying to do:

```
GitHub's temporary VM (a stranger)
        │
        │  "Hey VPS, let me in. I want to run commands."
        │
        ▼
Your VPS (your server with all your data)
        │
        │  "Who the hell are you? How do I know you're legit?"
        │
        ▼
   ??? TRUST ???
```

Your VPS has **no reason** to trust GitHub's runner. It's a random machine on the internet asking to execute commands on your server. That's literally what a hacker does.

The answer: **SSH keys.**

---

## SSH Keys: The Mental Model

### Password Authentication (The Old Way)

```
You walk up to a door.
Guard: "What's the password?"
You: "swordfish"
Guard: "Come in."

Problem: Anyone who OVERHEARS the password can get in.
Problem: The password travels over the network — it can be intercepted.
```

### SSH Key Authentication (The Right Way)

```
You own a UNIQUE padlock and a UNIQUE key.

You give the padlock to the guard.
You keep the key.

Guard hangs YOUR padlock on the door.

When you arrive:
Guard: "Prove you own the padlock on this door."
You: *sticks key in, lock opens*
Guard: "You're legit. Come in."

No password is ever transmitted.
No one can copy your key unless they physically steal it.
```

---

## The Two Pieces

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  PUBLIC KEY  (the padlock)                                       │
│  ─────────────────────────                                       │
│  • You GIVE this to anyone you want to let you in                │
│  • It's safe to share publicly                                   │
│  • It can ONLY lock things, never unlock                         │
│  • Lives on your VPS in: ~/.ssh/authorized_keys                  │
│  • Looks like: ssh-ed25519 AAAAC3Nza...long string... label      │
│                                                                  │
│                                                                  │
│  PRIVATE KEY  (the key to the padlock)                           │
│  ──────────────────────────────────                              │
│  • You NEVER share this. EVER.                                   │
│  • If someone gets this, they can access your server             │
│  • It can unlock anything locked by its matching public key      │
│  • Lives in GitHub Secrets (encrypted vault)                     │
│  • Looks like:                                                   │
│    -----BEGIN OPENSSH PRIVATE KEY-----                            │
│    b3BlbnNzaC1rZXktdjEAAAAA...lots of random characters...       │
│    -----END OPENSSH PRIVATE KEY-----                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### The Math Behind It (Asymmetric Cryptography)

- The public and private keys are **mathematically linked**
- If you encrypt something with the public key, **ONLY** the private key can decrypt it
- If you sign something with the private key, the public key can **verify** it came from you
- But you **cannot derive** the private key from the public key (would take millions of years)

This is the same math that secures HTTPS, WhatsApp messages, and cryptocurrency wallets.

---

## The Complete Trust Chain

```
STEP 1: Generate key pair (you do this ONCE)
─────────────────────────────────────────────

    ssh-keygen creates TWO files:

    ┌─────────────────────┐    ┌─────────────────────┐
    │  id_deploy          │    │  id_deploy.pub       │
    │  (PRIVATE KEY)      │    │  (PUBLIC KEY)        │
    │                     │    │                      │
    │  The secret key     │    │  The padlock         │
    │  Goes to GitHub     │    │  Goes to VPS         │
    └─────────────────────┘    └─────────────────────┘


STEP 2: Put padlock on VPS door
────────────────────────────────

    Paste the PUBLIC KEY into your VPS's
    ~/.ssh/authorized_keys file.

    VPS now says: "I will accept anyone who
    can prove they hold the matching private key."


STEP 3: Give the secret key to GitHub
──────────────────────────────────────

    Paste the PRIVATE KEY into GitHub Secrets
    as a secret named SSH_KEY.

    GitHub encrypts it. Nobody can see it —
    not even you after you save it.


STEP 4: Deployment happens
──────────────────────────

    GitHub Runner:
    "I need to SSH into the VPS.
     Let me grab the private key from secrets..."

    Runner → VPS:
    "Here's proof I hold the private key" (mathematical proof)

    VPS checks ~/.ssh/authorized_keys:
    "The proof matches my public key. Access granted."

    Runner executes deployment commands on VPS. ✅
```

---

## Step-by-Step: How to Actually Do This

### Step 1: Generate the SSH Key Pair

On your Windows machine (using Git Bash, WSL, or PowerShell with OpenSSH):

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/id_deploy
```

**Breaking every flag:**

| Flag                         | Meaning                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| `ssh-keygen`                 | The command to generate keys                                              |
| `-t ed25519`                 | Algorithm. ed25519 is modern, fast, secure. (Better than older `rsa`)     |
| `-C "github-actions-deploy"` | A comment/label. Helps you identify this key later. Not security-related. |
| `-f ~/.ssh/id_deploy`        | Filename. Use a separate file — don't overwrite your personal `id_rsa`!   |

**When it asks for a passphrase:** Press Enter — leave it **EMPTY**. GitHub Actions is a machine — it can't type a passphrase. If you add one, the deployment will hang forever.

This creates:

```
~/.ssh/id_deploy        ← PRIVATE key (the secret)
~/.ssh/id_deploy.pub    ← PUBLIC key (the padlock)
```

---

### Step 2: Put the Public Key on Your VPS

SSH into your VPS normally, then:

```bash
# Create the .ssh directory if it doesn't exist
mkdir -p ~/.ssh

# Set correct permissions (SSH is PARANOID about permissions)
chmod 700 ~/.ssh

# Add the public key (paste the content of id_deploy.pub)
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBx...your key here... github-actions-deploy" >> ~/.ssh/authorized_keys

# Set correct permissions on authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

#### Why Permissions Matter

```
chmod 700 ~/.ssh              → Only the owner can read/write/enter
chmod 600 ~/.ssh/authorized_keys → Only the owner can read/write

SSH refuses to work if permissions are wrong.
Why? If OTHER users could modify authorized_keys,
they could add their own keys and gain access.
SSH says: "I won't trust a file that other people can tamper with."
```

---

### Step 3: Add the Private Key to GitHub Secrets

On your local machine, copy the private key content:

```bash
cat ~/.ssh/id_deploy
```

This outputs something like:

```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACAbfPz2m5bK7YEDMhUqB...many lines...
-----END OPENSSH PRIVATE KEY-----
```

Copy **EVERYTHING** — including the `-----BEGIN` and `-----END` lines.

Then in GitHub:

```
1. Go to your repo on GitHub.com
2. Click "Settings" tab (the REPO settings, not profile)
3. Left sidebar → "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Name: SSH_KEY
6. Value: paste the entire private key
7. Click "Add secret"
```

**All secrets you'll need:**

| Secret Name         | Value               | Example                 |
| ------------------- | ------------------- | ----------------------- |
| `VPS_HOST`          | Your VPS IP address | `143.198.45.67`         |
| `VPS_USER`          | SSH username        | `root` (or `deploy`)    |
| `SSH_KEY`           | Entire private key  | `-----BEGIN OPENSSH...` |
| `POSTGRES_USER`     | Database username   | `verbalingo`            |
| `POSTGRES_PASSWORD` | Database password   | `s3cur3_p@ssw0rd`       |
| `SECRET_KEY`        | FastAPI secret key  | `a1b2c3d4e5f6...`       |

---

## Pro Tip: Create a Deploy User (Don't Use Root)

Using `root` works but is **dangerous**. If your GitHub secrets leak, an attacker has **full root access**.

### Create a Limited User

```bash
# On your VPS:

# Create a user called "deploy"
sudo useradd -m -s /bin/bash deploy

# Add them to the docker group (so they can run docker commands)
sudo usermod -aG docker deploy

# Set up SSH for this user
sudo mkdir -p /home/deploy/.ssh
sudo cp ~/.ssh/authorized_keys /home/deploy/.ssh/
sudo chown -R deploy:deploy /home/deploy/.ssh
sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
```

**What the `deploy` user can do:**

- ✅ Run Docker commands
- ✅ Pull from Git
- ❌ Cannot delete system files
- ❌ Cannot modify other users
- ❌ Cannot install system packages

This is the **principle of least privilege** — give each entity only the permissions it actually needs. Nothing more.

---

## The `known_hosts` Problem

When SSH connects to a server for the **first time**, it asks:

```
The authenticity of host '143.198.45.67' can't be established.
ED25519 key fingerprint is SHA256:abc123def456...
Are you sure you want to continue connecting (yes/no)?
```

GitHub's runner **can't type "yes"**. Your deployment hangs.

### Two Solutions

```yaml
# Solution A: StrictHostKeyChecking=no (quick and dirty)
# Tells SSH: "Don't ask. Just connect."
- name: Deploy
  run: |
    ssh -o StrictHostKeyChecking=no deploy@${{ secrets.VPS_HOST }} "commands..."

# Less secure (vulnerable to man-in-the-middle attacks)
# but fine for personal projects.

# Solution B: Pre-register the host fingerprint (proper way)
# Get fingerprint: ssh-keyscan YOUR_VPS_IP
# Save output as GitHub secret SSH_KNOWN_HOSTS
- name: Set up known hosts
  run: |
    mkdir -p ~/.ssh
    echo "${{ secrets.SSH_KNOWN_HOSTS }}" >> ~/.ssh/known_hosts
    chmod 644 ~/.ssh/known_hosts
```

> **Note:** The `appleboy/ssh-action` handles this internally (uses `StrictHostKeyChecking=no`), so you usually don't need to worry about it.

---

## Visual Summary: Where Every Piece Lives

```
YOUR LOCAL MACHINE
┌─────────────────────────────────────┐
│ ~/.ssh/id_deploy      (private key) │──── COPY THIS ────┐
│ ~/.ssh/id_deploy.pub  (public key)  │──── COPY THIS ──┐ │
└─────────────────────────────────────┘                  │ │
                                                         │ │
YOUR VPS                                                 │ │
┌─────────────────────────────────────┐                  │ │
│ ~/.ssh/authorized_keys              │◄─────────────────┘ │
│                                     │  (public key        │
│ Contains: ssh-ed25519 AAAAC3...     │   pasted here)      │
└─────────────────────────────────────┘                     │
                                                            │
GITHUB REPO SECRETS                                         │
┌─────────────────────────────────────┐                     │
│ SSH_KEY = -----BEGIN OPENSSH...     │◄────────────────────┘
│           (encrypted, invisible)    │  (private key
│                                     │   pasted here,
│ VPS_HOST = 143.198.45.67           │   encrypted by GitHub)
│ VPS_USER = deploy                  │
└─────────────────────────────────────┘
         │
         │  At runtime, GitHub injects secrets
         │  into the runner VM
         ▼
GITHUB RUNNER (temporary VM)
┌─────────────────────────────────────┐
│                                     │
│ appleboy/ssh-action reads SSH_KEY   │
│ Connects to VPS_HOST as VPS_USER    │
│ Executes deployment script          │
│                                     │
│ Then this VM is destroyed.          │
│ The private key is gone from memory.│
└─────────────────────────────────────┘
```

---

## Key Takeaways

- ✅ SSH keys = public key (padlock → VPS) + private key (secret → GitHub)
- ✅ `ssh-keygen -t ed25519` generates the pair
- ✅ Public key → VPS's `~/.ssh/authorized_keys`
- ✅ Private key → GitHub Secrets (encrypted vault)
- ✅ Permissions matter: `chmod 700` on `.ssh/`, `chmod 600` on files
- ✅ Use a `deploy` user, not `root` (principle of least privilege)
- ✅ `known_hosts` = SSH verifying the server's identity on first connection
- ✅ Secrets are encrypted in GitHub, injected at runtime, never visible in logs
