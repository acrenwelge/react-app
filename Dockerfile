# base image
FROM node:13.13.0-alpine AS base

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

COPY . /app
RUN npm install --silent
RUN npm config set unsafe-perm true
RUN npm install http-server@13.1.0 -g
RUN npm build

# multi-stage build
FROM base

# start app
CMD http-server ./build -p 8080 -a 0.0.0.0
