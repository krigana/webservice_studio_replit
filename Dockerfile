FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create uploads directory
RUN mkdir -p uploads

# Set permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]