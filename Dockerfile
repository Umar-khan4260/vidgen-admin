# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# VidGen AI Admin — production image
#
# Build:
#   docker build -t vidgen-admin .
# Run:
#   docker compose up -d
#
# All configuration (Firebase credentials, admin login, Kie.ai key) is read
# from environment variables at RUNTIME. Nothing secret is copied into the
# image, so the same image can be promoted across environments.
# ---------------------------------------------------------------------------

# ---- 1. Install dependencies -------------------------------------------------
# Tailwind v4 is loaded via @tailwindcss/turbopack during `next build`, so the
# builder needs devDependencies too. The final runtime stage does not.
FROM node:22-alpine AS deps

# Required by some Node native modules on Alpine.
RUN apk add --no-cache libc6-compat

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# ---- 2. Build the application ------------------------------------------------
FROM node:22-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1 \
    NEXT_OUTPUT_STANDALONE=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# No .env files are present (see .dockerignore); all secrets are runtime-only.
RUN npm run build

# ---- 3. Minimal runtime ------------------------------------------------------
FROM node:22-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# Run as an unprivileged user.
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# The standalone output already contains the traced node_modules and server.js.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/login').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "server.js"]
