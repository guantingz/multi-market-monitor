# ============================================================
# Multi-Market Live Monitor — Production Dockerfile
# Multi-stage build: build frontend + backend, then run
# ============================================================

# Stage 1: Build
FROM node:22-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build frontend (Vite) + backend (esbuild)
RUN pnpm build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and patches
COPY package.json pnpm-lock.yaml ./
COPY patches ./patches

# Install ALL dependencies (vite is dynamically imported even in production build)
RUN pnpm install --frozen-lockfile

# Copy built artifacts from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Start the server
CMD ["node", "dist/index.js"]
