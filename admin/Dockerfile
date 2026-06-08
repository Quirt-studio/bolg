# ============================================
# Bolg Admin Dashboard - Multi-stage Docker build
# Build context: project root (F:/Bolg/)
# ============================================

# ---- Stage 1: Build Next.js app ----
FROM node:20-alpine AS builder

# Use Chinese npm mirror
RUN npm config set registry https://registry.npmmirror.com

WORKDIR /src

# Copy package files first for layer caching
COPY admin/package.json admin/package-lock.json* ./

# Install dependencies
RUN npm ci 2>/dev/null || npm install

# Copy admin source
COPY admin/ ./

# Set API URL for production (relative — behind Nginx)
ENV NEXT_PUBLIC_API_URL=/api/v1

# Build
RUN npm run build

# ---- Stage 2: Production runtime ----
FROM node:20-alpine

RUN apk add --no-cache tzdata curl && \
    cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    addgroup -S app && adduser -S app -G app

WORKDIR /app

# Copy package.json (needed for npm start)
COPY --from=builder /src/package.json ./

# Copy node_modules (Turbopack needs full deps even in production)
COPY --from=builder /src/node_modules ./node_modules/

# Copy build output
COPY --from=builder /src/.next ./.next/

USER app

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD curl -f http://localhost:3000/login || exit 1

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npx", "next", "start"]
