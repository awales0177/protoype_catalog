# Design system catalog (Create React App + TypeScript). Build from the monorepo root (include package-lock.json):
#   docker build -f catalog/Dockerfile .
#   docker run --rm -p 3000:3000 <image>
FROM node:20-alpine

WORKDIR /app

COPY . .
RUN if [ ! -f package-lock.json ]; then \
      echo >&2 "warning: package-lock.json missing from build context; run npm install at repo root."; \
      npm install; \
    elif ! npm ci; then \
      echo >&2 "warning: npm ci failed; retrying with npm install (update and commit package-lock.json)."; \
      npm install; \
    fi

ENV DOCKER=1
ENV HOST=0.0.0.0
EXPOSE 3000

WORKDIR /app
CMD ["npm", "run", "start", "-w", "catalog_ds"]
