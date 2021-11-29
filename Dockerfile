#builder

FROM node:16-bullseye as builder
WORKDIR /app

COPY ./package*.json ./
RUN npm i 

ENV NODE_ENV build
COPY ./src ./src
COPY ./public ./public
COPY ./tsconfig*.json ./
COPY ./rollup*.js ./

RUN npm run build

#production

FROM node:16-bullseye as production-build

LABEL org.opencontainers.image.source="https://github.com/yonder-makers/weboffice-ui-svelte"

WORKDIR /app

COPY --from=builder /app/package*.json /app/
RUN npm i --production

COPY --from=builder /app/public/ /app/public/

ENV NODE_ENV production
ENV API_URL http://localhost:3000/

EXPOSE 5000

CMD ["npm", "start"]



FROM nginx:alpine as nginx-production

# Copy config nginx
COPY --from=builder /app/nginx/nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=production-build /app .

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]