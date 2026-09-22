# Multi-stage production Dockerfile for Google Cloud Run
# Optimized for Vantage AI Enterprise Workspace
# Copyright (c) 2026 Mike Ford <fordmj@gmail.com>

FROM node:22-slim AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./
COPY bun.lock* ./

# Install all dependencies (including devDependencies needed for build)
RUN npm ci || npm install

# Copy source code and config files
COPY . .

# Build client SPA and bundled CommonJS server
RUN npm run build

# Production runtime container
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production || npm install --production

# Copy built application assets and server bundle
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public

# Expose Cloud Run default port
EXPOSE 3000

# Start compiled CommonJS server
CMD ["node", "dist/server.cjs"]
