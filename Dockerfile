FROM node:lts-bullseye-slim as build
WORKDIR /usr/local/src/bare

RUN npm install -g pnpm
COPY package.json .
COPY pnpm-*.yaml .

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

ENTRYPOINT ["pnpm", "run", "start"]