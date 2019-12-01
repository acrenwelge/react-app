# base image
FROM node:12.2.0-alpine

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

COPY . /app
RUN npm install --silent
RUN npm install react-scripts@3.0.1 -g --silent
RUN npm install http-server -g
RUN npm build

# start app
CMD http-server ./build
