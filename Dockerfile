FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./

RUN npm install

COPY src ./src
COPY public ./public
COPY views ./views
COPY drizzle ./drizzle

RUN npm run build:css:prod && npm run build

EXPOSE 3000

CMD ["npm", "start"]
