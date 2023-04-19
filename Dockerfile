FROM node:latest

COPY /root/ACFT /run/ACFT

WORKDIR /run/ACFT

RUN npm install --save && \
    npm run build-css

CMD npm start
