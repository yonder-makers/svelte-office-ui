FROM node:16-bullseye as builder
WORKDIR /app

COPY ./package*.json ./
RUN npm ci

ENV NODE_ENV build
COPY ./src ./src
COPY ./public ./public
COPY ./index.html ./
COPY ./tsconfig*.json ./
COPY ./svelte.config.js ./
COPY ./vite*.js ./

RUN npm run build


FROM nginx:stable-alpine as nginx-production
LABEL org.opencontainers.image.source="https://github.com/yonder-makers/svelte-office-ui"

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./* && rm /etc/nginx/conf.d/default.conf
# Copy config nginx
COPY --chown=nginx:nginx ./nginx/default.conf.template /etc/nginx/templates/
# Copy static assets from builder stage
COPY --chown=nginx:nginx --from=builder /app/dist .
COPY --chown=nginx:nginx ./nginx/config.json config.json

ENV API_URL http://localhost:3000

ENV NGINX_PORT=80

EXPOSE 80
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]