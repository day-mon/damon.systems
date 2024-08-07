FROM oven/bun:1 as base

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install
COPY . .
RUN bun run build
ENTRYPOINT ["bun", ".output/server/index.mjs"]