#FROM node:latest as build
FROM node:latest as build
WORKDIR /run/app
COPY . /run/app

RUN npm i && \
#    npm i -g serve && \
    npm run build-css && \
    npm run build

#CMD serve -s build

FROM nginx:latest
EXPOSE 8080
COPY default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /run/app/build /usr/share/nginx/html
