FROM node:20

WORKDIR /usr/src/app

COPY . .

RUN cd front && npm install && npm run build

RUN cd back && npm install 

EXPOSE 3000

WORKDIR /usr/src/app/back

CMD ["npm", "run", "start"]
