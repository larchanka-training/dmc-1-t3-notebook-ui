# === Build stage (used for production image AND as local dev target) ===
FROM node:22-alpine AS builder

WORKDIR /home/app

RUN apk add --no-cache bash \
    && npm install -g pnpm@9

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# === Build stage (CI/CD only — not reached by docker-compose target: builder) ===
FROM builder AS build

# Injected at build time by GitHub Actions
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN pnpm build

# === Production stage ===
FROM nginx:alpine AS production

COPY --from=build /home/app/dist /usr/share/nginx/html

# SPA routing: serve index.html for all unknown paths
RUN printf 'server {\n  listen 80;\n  root /usr/share/nginx/html;\n  index index.html;\n  location / {\n    try_files $uri $uri/ /index.html;\n  }\n}\n' \
    > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]