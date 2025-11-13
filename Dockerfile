FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build && npm run build:css:prod

FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production PORT=3000 HOST=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/views ./views
COPY package.json ./

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE ${PORT}
CMD ["node", "dist/index.js"]
