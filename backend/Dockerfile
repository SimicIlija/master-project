FROM node:14-buster-slim
# if already built locally before
# FROM cdi_backend

# set the web-backend up
WORKDIR /usr/src/app/backend
RUN mkdir -p storage/uploaded
COPY ./backend/package*.json ./
RUN npm install
COPY ./backend .
COPY ./common ../common
RUN npm run build

# set the python environment up (for the DoWhy lib)
WORKDIR /usr/src/app/dowhy
RUN apt-get update && apt-get install -y python3-pip && pip3 install --upgrade pip && pip3 install numpy pandas sklearn dowhy econml
COPY ./dowhy/ ./

WORKDIR /usr/src/app/backend
