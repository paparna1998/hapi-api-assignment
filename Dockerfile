# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies (including nodemon globally)
RUN npm install && npm install -g nodemon

# Copy the entire project
COPY . .

# Expose the application port
EXPOSE 5002

# Start the server with nodemon
CMD ["nodemon", "app.js"]
