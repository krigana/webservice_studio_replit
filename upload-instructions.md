# Інструкції для завантаження на CloudPanel

## Файли які потрібно оновити в GitHub репозиторії:

### 1. Dockerfile (замінити повністю)
```dockerfile
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
```

### 2. Видалити з header.tsx і footer.tsx:
- Рядок: `import logoPath from "@assets/webservice31.png";`
- Замінити: `siteSettings?.logoUrl || logoPath` на `siteSettings?.logoUrl || ""`

### 3. Після оновлення на CloudPanel виконати:
```bash
cd webservice_studio_replit
git pull origin main
docker-compose down
docker system prune -f
docker-compose build --no-cache
docker-compose up -d
```

### 4. Перевірити статус:
```bash
docker-compose ps
docker-compose logs -f app
```

### 5. Сайт буде доступний на:
```
http://IP_СЕРВЕРА:3000
```

Це запустить простий Express сервер без frontend збірки, що дозволить уникнути помилок з attached_assets файлами.