FROM node

WORKDIR /app

RUN npm install -g pnpm
COPY package.json .
COPY pnpm-*.yaml .

RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build
ENTRYPOINT ["pnpm", "run", "start"]