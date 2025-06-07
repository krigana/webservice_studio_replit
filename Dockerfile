FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Set temporary DATABASE_URL for build process
ENV DATABASE_URL="postgresql://temp:temp@localhost:5432/temp"

# Build the application using the correct script
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Remove temporary DATABASE_URL
ENV DATABASE_URL=""

# Expose port (Railway uses PORT env var)
EXPOSE $PORT

# Start the application
CMD ["npm", "start"]