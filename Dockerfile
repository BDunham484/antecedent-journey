# Use Microsoft's official Playwright image — includes Node.js and all browser binaries
FROM mcr.microsoft.com/playwright:v1.45.3-jammy

WORKDIR /app

# Copy root package files and install root dev dependencies (concurrently etc.)
COPY package*.json ./
RUN npm install

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# Install client dependencies
COPY client/package*.json ./client/
RUN cd client && npm install --production=false

# Copy all source files
COPY . .

# Build the React client
RUN npm run build

# Expose the port the server listens on
EXPOSE 3003

# Start the server
CMD ["npm", "start"]
