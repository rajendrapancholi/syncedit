FROM oven/bun:1-alpine
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

COPY . .

RUN chmod -R 755 /app && chown -R bun:bun /app

ENV NODE_ENV=production
ENV BASE_PORT=5000
EXPOSE 5000

USER bun
CMD ["bun", "run", "src/server.ts"]
