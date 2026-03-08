# Stage 1: Install dependencies
FROM oven/bun:1.3 AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY packages/core/package.json packages/core/
COPY packages/api/package.json packages/api/
COPY packages/web/package.json packages/web/
COPY packages/widget/package.json packages/widget/
RUN bun install --frozen-lockfile

# Stage 2: Build web dashboard
FROM deps AS build
COPY . .
RUN cd packages/core && bun run build
RUN cd packages/web && bun run build

# Stage 3: Production image
FROM oven/bun:1.3-slim AS production
WORKDIR /app

# Copy package files and install production deps only
COPY package.json bun.lock ./
COPY packages/core/package.json packages/core/
COPY packages/api/package.json packages/api/
COPY packages/widget/package.json packages/widget/
RUN bun install --frozen-lockfile --production

# Copy source code (API runs from TypeScript via Bun)
COPY packages/core/src packages/core/src
COPY packages/api/src packages/api/src

# Copy built web assets
COPY --from=build /app/packages/web/dist packages/web/dist

# Database volume mount point
RUN mkdir -p /data

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_URL=/data/patchwork.db
ENV STATIC_DIR=packages/web/dist

EXPOSE 3000

# Run migrations then start the server
CMD ["sh", "-c", "bun run packages/api/src/db/migrate.ts && bun run packages/api/src/index.ts"]
