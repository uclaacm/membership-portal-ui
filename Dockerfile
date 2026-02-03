# Brand-new to making Dockerfiles so if someone from CI/CD can review this plz

# Build Stage
FROM node:18-alpine AS build
WORKDIR /app

# Install deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the source files
COPY . .

# Generates .next/standalone
RUN pnpm build

# Prod/Deploy Stage
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Non-root user required by Next.js for some security thing
RUN addgroup --system --gid 1001 next \
  && adduser --system --uid 1001 next

COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

USER next

EXPOSE 8080

# Start Next.js server
CMD ["node", "server.js"]
