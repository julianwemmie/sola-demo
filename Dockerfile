# ── Build stage ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies (needed for native npm packages)
RUN apk add --no-cache python3 make g++

# Copy package files and install all dependencies (including devDependencies for build)
COPY package*.json ./
RUN npm ci

# Copy source and build the frontend (tsc -b && vite build → dist/)
COPY . .
RUN npm run build

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Install only ffmpeg — minimal build, audio-only use case (libmp3lame is
# included in Alpine's ffmpeg package; no graphics/SDL/Cairo pulled in)
RUN apk add --no-cache ffmpeg

# Copy production node_modules and built frontend from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Copy server source (tsx executes it directly at runtime)
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.node.json ./tsconfig.node.json
COPY --from=builder /app/vite.config.ts ./vite.config.ts

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node_modules/.bin/tsx", "server/index.ts"]
