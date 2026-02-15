# ─────────────────────────────────────────────────────────
# VerbaLingo Frontend — Production Dockerfile (Multi-Stage)
# ─────────────────────────────────────────────────────────
#
# MULTI-STAGE BUILD — 3 stages, each with a specific job:
#
#   Stage 1 (deps):    Install node_modules          [~500MB, thrown away]
#   Stage 2 (builder): Build the production bundle   [~800MB, thrown away]
#   Stage 3 (runner):  Run the app                   [~170MB, shipped!]
#
# The magic: node_modules is 500MB+. After building with Next.js
# standalone mode, the ENTIRE runnable app is only ~50MB of JS.
# We throw away node_modules and keep only the output.
#
# HOW TO BUILD (from project root):
#   docker build -f ui/Dockerfile -t verbalingo-frontend ./ui
#
# Image size comparison:
#   Without multi-stage + standalone: ~1.2 GB
#   With multi-stage + standalone:    ~170 MB (85% reduction!)


# ═══════════════════════════════════════════
# STAGE 1: Install dependencies
# ═══════════════════════════════════════════
FROM node:20-alpine AS deps

# Why Alpine?
# Regular node:20 is ~350MB (Debian-based with lots of extras)
# node:20-alpine is ~130MB (bare minimum Linux + Node.js)
# For just installing npm packages, Alpine is perfect.

# libc6-compat: Some npm packages are compiled against glibc (GNU's C library)
# but Alpine uses musl (a smaller alternative). This compatibility layer
# makes those packages work. Without it, you get cryptic "GLIBC not found" errors.
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files FIRST — the Docker layer caching trick
# ──────────────────────────────────────────────────────────
# Docker caches each instruction as a separate "layer."
# If package.json hasn't changed, Docker reuses the cached node_modules.
# This turns a 60-second npm install into a 0-second cache hit.
# ONLY when you add/remove a dependency does this layer rebuild.
COPY package.json package-lock.json* ./

# npm ci = "Clean Install" — designed for CI/CD and Docker:
#   ✅ Deletes existing node_modules first
#   ✅ Installs EXACTLY what's in package-lock.json (deterministic)
#   ✅ Faster than npm install (no dependency resolution needed)
#   ❌ npm install: might update minor versions, non-deterministic
RUN npm ci


# ═══════════════════════════════════════════
# STAGE 2: Build the Next.js application
# ═══════════════════════════════════════════
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules from Stage 1
# This is the "only carry what you need" principle of multi-stage builds.
COPY --from=deps /app/node_modules ./node_modules

# Copy ALL source code for the build
COPY . .

# Disable Next.js telemetry during build
# (it phones home to Vercel with anonymous usage data — not needed in Docker)
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the production bundle
# ──────────────────────────
# This runs `next build` which:
#   1. Compiles TypeScript → JavaScript
#   2. Bundles and minifies all code
#   3. Pre-renders static pages
#   4. Creates the .next/standalone/ directory (because of output:'standalone')
#
# The standalone output is the KEY OPTIMIZATION:
# Instead of needing the full 500MB node_modules, Next.js traces
# which modules are actually imported and bundles ONLY those.
# Result: server.js + minimal deps = ~50MB total
RUN npm run build


# ═══════════════════════════════════════════
# STAGE 3: Production runner (tiny image!)
# ═══════════════════════════════════════════
FROM node:20-alpine AS runner
WORKDIR /app

# Security: Create a non-root user
# ─────────────────────────────────
# Same principle as the backend — limit the blast radius of any exploit.
# The "system" flag means this user can't log in interactively.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# ── Copy ONLY the production artifacts ──
# 1. Public assets (favicons, images, etc.)
COPY --from=builder /app/public ./public

# 2. Create .next directory for the prerender cache
#    Next.js writes cache files here at runtime.
#    We create it now and set ownership BEFORE switching to non-root user.
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 3. The standalone server — this IS the app
#    Contains server.js + only the node_modules actually used
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# 4. Static assets (CSS, JS chunks, images processed by webpack)
#    These are served directly by the Next.js server
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Port configuration
EXPOSE 3000
ENV PORT=3000
# HOSTNAME must be 0.0.0.0 for Docker — same reason as backend.
# "localhost" or "127.0.0.1" would mean "only accept connections from
# inside the container" — useless when you need to reach it from outside.
ENV HOSTNAME="0.0.0.0"

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the production server
# server.js is auto-generated by Next.js standalone mode
# It's a minimal Node.js HTTP server that serves your built app
CMD ["node", "server.js"]
