FROM node:22-alpine

WORKDIR /home/app

RUN apk add --no-cache bash

COPY package*.json ./
RUN npm install --include=optional

COPY . .

EXPOSE 5173