FROM node:latest

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run createdb

RUN npm run build

EXPOSE 8989

CMD ["npm", "start"]
