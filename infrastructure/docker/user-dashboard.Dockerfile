# syntax=docker/dockerfile:1.7

FROM node:22-alpine AS builder
WORKDIR /app

ARG VITE_API_URL=http://localhost:4000/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN corepack enable && corepack prepare pnpm@11.21.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/user-dashboard/package.json apps/user-dashboard/package.json
RUN pnpm install --frozen-lockfile --filter @waandapp/user-dashboard...

COPY apps/user-dashboard/ apps/user-dashboard/
RUN pnpm --filter @waandapp/user-dashboard build

FROM nginxinc/nginx-unprivileged:1.28-alpine AS runner
COPY infrastructure/docker/user-dashboard.nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/apps/user-dashboard/dist /usr/share/nginx/html

EXPOSE 8080
