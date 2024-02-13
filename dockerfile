# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock) to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Bundle app source
COPY . .

# Build the Vite app
RUN npm run build

# Expose the port the app runs on
EXPOSE 4999

# Define the command to run the app
CMD [ "node", "server/server.js" ]
