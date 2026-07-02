# Use Node.js 20 LTS
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source
COPY . .

# Expose the port
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
