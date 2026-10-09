FROM bun:1-alpine AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

FROM bun:1-alpine AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
ARG NEXT_PUBLIC_BASE_API
ARG NEXT_PUBLIC_SOCKET_URL
ENV NEXT_PUBLIC_BASE_API=$NEXT_PUBLIC_BASE_API
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
RUN bun run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy built app and dependencies
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN chmod -R 755 /app && \
    chown -R node:node /app

USER node
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
