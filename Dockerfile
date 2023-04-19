FROM node:latest

COPY ./ /run/ACFT

WORKDIR /run/ACFT

RUN npm install --save && \
    npm install -g serve && \
    npm run build-css && \
    npm build

CMD serve -s build
