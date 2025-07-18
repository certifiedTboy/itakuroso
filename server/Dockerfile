FROM node:lts-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --only=prod

COPY . .

EXPOSE 9000

CMD ["node", "dist/main"]