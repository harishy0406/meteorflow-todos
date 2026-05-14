# Stage 1: Build the Meteor app
FROM node:20-bullseye-slim AS builder

# Install Meteor globally using npm (Meteor 3.x support)
RUN npm install -g meteor

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN meteor npm install

# Copy application code
COPY . .

# Build the Meteor application
RUN meteor build --directory /app/build --architecture os.linux.x86_64

# Stage 2: Production runner
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy the built bundle from the builder stage
COPY --from=builder /app/build/bundle ./

# Install production dependencies for the Node.js server
RUN cd programs/server && npm install --production

# Set environment variables
ENV PORT=3000
ENV ROOT_URL=http://localhost
ENV NODE_ENV=production

# The MONGO_URL must be provided when running the container
# ENV MONGO_URL=mongodb://mongo:27017/meteorflow

EXPOSE 3000

# Start the Node.js application
CMD ["node", "main.js"]
