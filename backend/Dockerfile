# --- Stage 1: Build Stage ---
FROM node:18-alpine

# Use a more descriptive name for the build stage
AS builder

WORKDIR /app

# Copy package files and install all dependencies (including devDependencies if a build step were needed)
COPY package*.json ./
RUN npm install --production=false

# Copy the rest of the application source code
COPY . .

# --- Stage 2: Production Stage ---
FROM node:18-alpine

WORKDIR /app

# Create a non-root user to run the application for better security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only the production dependencies from the builder stage
COPY --from=builder /app/node_modules ./node_modules
# Copy the application code from the builder stage
COPY --from=builder /app .

# Change ownership of the files to the non-root user
RUN chown -R appuser:appgroup /app
USER appuser

# Expose the port your app runs on
EXPOSE 5001

# Use node directly to run the server in production
CMD ["node", "server.js"]