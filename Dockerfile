FROM oven/bun:1 as base

WORKDIR /app

COPY package.json .
COPY bun.lockb .

RUN bun install
COPY . .
RUN bun run build

ENV HOST=0.0.0.0
ENV PORT=4321
EXPOSE 4321

ENTRYPOINT ["bun", "run", "./dist/server/entry.mjs"]
