FROM node:latest as build
WORKDIR /run/app
COPY . /run/app

RUN npm i && \
    npm run build-css && \
    npm run build


FROM nginxinc/nginx-unprivileged:latest
EXPOSE 8080
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /run/app/build /usr/share/nginx/html
