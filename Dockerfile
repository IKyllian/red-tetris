FROM node:20

RUN npm install -g nodemon

WORKDIR /usr/app/front

COPY front/package*.json ./

RUN npm install

COPY front/ ./

RUN npm run build

WORKDIR /usr/app/back

COPY back/package*.json ./

RUN npm install

COPY back/ ./

EXPOSE 3000

CMD ["npm", "run", "start:dev"]