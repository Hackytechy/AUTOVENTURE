# Use node:20-alpine as the base image to keep it lightweight
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package*.json ./

# Install backend dependencies
RUN npm install

# Copy the rest of the backend source code
COPY . .

# Expose the port your server runs on
EXPOSE 5001

# Start the Node server
CMD ["node", "index.js"]
