FROM node:16.8.0 as build
WORKDIR /app
COPY package.json .
RUN npm install

COPY . /app/.
CMD npm start