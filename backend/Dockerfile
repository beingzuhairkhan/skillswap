FROM node:18-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && ln -s /usr/bin/python3 /usr/bin/python

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "start"]