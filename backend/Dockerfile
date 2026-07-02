# LOGIC: Railway deployment — uses Node 20, respects $PORT env
FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

# Railway sets PORT env automatically, our server.js uses process.env.PORT
EXPOSE 5000

CMD ["node", "server.js"]
