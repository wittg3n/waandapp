# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable && corepack prepare pnpm@11.21.0 --activate
WORKDIR /app

FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/blog/package.json apps/blog/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json
COPY packages/typescript-config/package.json packages/typescript-config/package.json
RUN pnpm install --frozen-lockfile

FROM dependencies AS builder
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ARG NEXT_PUBLIC_BLOG_URL=http://localhost:3002
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_USER_DASHBOARD_URL=http://localhost:3001
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_BLOG_URL=$NEXT_PUBLIC_BLOG_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_USER_DASHBOARD_URL=$NEXT_PUBLIC_USER_DASHBOARD_URL
COPY . .
RUN pnpm turbo run build --filter @waandapp/blog

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3002
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs
COPY --from=builder --chown=nextjs:nodejs /app/apps/blog/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/blog/.next/static ./apps/blog/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/blog/public ./apps/blog/public
USER nextjs
EXPOSE 3002
CMD ["node", "apps/blog/server.js"]
