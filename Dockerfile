FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json .
COPY bun.lock .

RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

ENTRYPOINT ["bun", "server.ts"]
