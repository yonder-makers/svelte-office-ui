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

FROM node:16-bullseye as production

LABEL org.opencontainers.image.source="https://github.com/yonder-makers/weboffice-ui-svelte"

WORKDIR /app

COPY --from=builder /app/package*.json /app/
RUN npm i --production

COPY --from=builder /app/public/ /app/public/

ENV NODE_ENV production

EXPOSE 5000

CMD ["npm", "start"]
