#builder

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

#production

FROM node:16-bullseye as production-build

LABEL org.opencontainers.image.source="https://github.com/yonder-makers/svelte-office-ui"

WORKDIR /app

COPY --from=builder /app/package*.json /app/
RUN npm ci --production

COPY --from=builder /app/public/ /app/public/

ENV NODE_ENV production
ENV API_URL http://localhost:3000/

EXPOSE 5000

CMD ["npm", "start"]



FROM nginx:stable-alpine as nginx-production

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./* && rm /etc/nginx/conf.d/default.conf
# Copy config nginx
COPY --chown=nginx:nginx ./nginx/default.conf.template /etc/nginx/templates/
# Copy static assets from builder stage
COPY --chown=nginx:nginx --from=production-build /app/public .
COPY --chown=nginx:nginx ./nginx/config.json config.json
ENV API_URL http://localhost:3000
ENV WEB_OFFICE_URL https://weboffice.yonder.local
# See https://hub.docker.com/_/nginx for details about "Using environment variables in nginx configuration"
# ENV NGINX_ENVSUBST_OUTPUT_DIR=/usr/share/nginx/html
# ENV NGINX_ENVSUBST_TEMPLATE_DIR=/usr/share/nginx/html
# ENV NGINX_ENVSUBST_TEMPLATE_SUFFIX=.template
ENV NGINX_PORT=80

EXPOSE 80
# Containers run nginx with global directives and daemon off
ENTRYPOINT ["/docker-entrypoint.sh", "nginx", "-g", "daemon off;"]