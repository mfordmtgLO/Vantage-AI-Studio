# Multi-stage production Dockerfile for Google Cloud Run
# Optimized for Vantage AI Enterprise Workspace
# Copyright (c) 2026 Mike Ford <fordmj@gmail.com>

FROM node:22-slim AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./

# Install all dependencies (including dev tools like vite, esbuild, tailwindcss)
RUN npm install

# Copy application source code
COPY . .

# Build client bundle (Vite) and server bundle (esbuild)
RUN npm run build

# Production runtime container
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package manifests and install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy compiled assets from builder
COPY --from=builder /app/dist ./dist

# Expose default HTTP port
EXPOSE 3000

# Launch compiled CommonJS Express server
CMD ["node", "dist/server.cjs"]
