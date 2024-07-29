FROM node:19

WORKDIR /usr/app/front

COPY . .

RUN npm i

RUN npm i -g serve

RUN npm run build

EXPOSE 5173

ENTRYPOINT [ "npm", "run", "dev", "--", "--host"]