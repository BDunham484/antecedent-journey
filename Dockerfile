# Use Microsoft's official Playwright image — includes Node.js and all browser binaries
FROM mcr.microsoft.com/playwright:v1.45.3-jammy

WORKDIR /app

# Copy package files for all three directories before installing
# This ensures the root install script (cd server && npm i && cd ../client && npm i) can cd into them
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Run root install — triggers the install script which installs server and client deps
RUN npm install

# Copy all remaining source files
COPY . .

# Build the React client
RUN npm run build

# Expose the port the server listens on
EXPOSE 3003

# Start the server
CMD ["npm", "start"]
