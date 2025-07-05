# Dockerfile base para un microservicio en Node.js
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 50057

CMD ["npm", "start"]
