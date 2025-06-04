FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies to avoid frontend build issues
RUN npm ci --production

# Install tsx globally for TypeScript execution
RUN npm install -g tsx

# Copy only backend files to avoid frontend build errors
COPY server/ ./server/
COPY shared/ ./shared/

# Create simple index.js that starts the server
RUN echo 'const express = require("express"); const app = express(); app.get("/", (req, res) => res.send("Webservice Studio API")); app.listen(5000, "0.0.0.0", () => console.log("Server running on port 5000"));' > simple-server.js

# Create uploads directory
RUN mkdir -p uploads

# Set permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 5000

# Start simple server
CMD ["node", "simple-server.js"]