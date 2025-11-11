# Use Node.js LTS (Long Term Support) version with Alpine for smaller image size
FROM node:20-alpine AS base

LABEL container.name="team3-job-app-frontend"

# Install dependencies only when needed
FROM base AS deps
# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Development dependencies builder
FROM base AS dev-deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# Build the application
FROM base AS builder
WORKDIR /app

# Copy dependencies from dev-deps
COPY --from=dev-deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript code
RUN npm run build

# Build CSS with Tailwind
RUN npm run build:css:prod

# Production runner
FROM base AS runner
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 expressapp

# Copy necessary files from builder
COPY --from=builder --chown=expressapp:nodejs /app/dist ./dist
COPY --from=builder --chown=expressapp:nodejs /app/public ./public
COPY --from=builder --chown=expressapp:nodejs /app/views ./views
COPY --from=builder --chown=expressapp:nodejs /app/drizzle ./drizzle
COPY --from=deps --chown=expressapp:nodejs /app/node_modules ./node_modules
COPY --chown=expressapp:nodejs package.json ./
COPY --chown=expressapp:nodejs .env ./.env
COPY --chown=expressapp:nodejs app.db ./app.db

# Switch to non-root user
USER expressapp

# Expose the application port
EXPOSE 3000

# Set environment variables
ENV PORT=3000
ENV HOST=0.0.0.0

# Start the application
CMD ["node", "dist/index.js"]
