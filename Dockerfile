FROM node:22-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    g++ \
    make \
    python3 \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json vitest.config.ts ./
COPY package-lock.json ./
COPY packages ./packages
COPY scripts ./scripts
COPY src ./src
COPY README.md ARCHITECTURE.md DOCUMENTATION.md constitution.md LICENSE .gitignore ./

RUN pnpm install --frozen-lockfile
RUN pnpm build


FROM node:22-bookworm-slim AS runtime

ENV HOME="/root"
ENV NODE_ENV="production"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=build /app /app
COPY docker/entrypoint.sh /usr/local/bin/automaton-entrypoint
COPY docker/bootstrap.mjs /app/docker/bootstrap.mjs

RUN chmod +x /usr/local/bin/automaton-entrypoint \
  && mkdir -p /root/.automaton

VOLUME ["/root/.automaton"]

ENTRYPOINT ["automaton-entrypoint"]
CMD ["--run"]
