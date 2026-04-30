# Design system catalog (Create React App + TypeScript). Build from the monorepo root (so pnpm-lock.yaml is included):
#   docker build -f catalog/Dockerfile .
#   docker run --rm -p 3000:3000 <image>
FROM node:20-alpine

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY . .
# Prefer a reproducible install when the lockfile is in context; otherwise fall back (e.g. export
# without lockfile, or lockfile temporarily out of sync with package.json — commit an updated lockfile).
RUN if [ ! -f pnpm-lock.yaml ]; then \
      echo >&2 "warning: pnpm-lock.yaml missing from build context; run this build from the repo root."; \
      pnpm install; \
    elif ! pnpm install --frozen-lockfile; then \
      echo >&2 "warning: frozen-lockfile failed; retrying with pnpm install (update and commit pnpm-lock.yaml)."; \
      pnpm install; \
    fi

WORKDIR /app/catalog
ENV DOCKER=1
ENV HOST=0.0.0.0
EXPOSE 3000

CMD ["pnpm", "exec", "react-scripts", "start"]
