#!/bin/bash

echo "🔧 Виправлення залежностей attached_assets..."

# Видаляємо імпорти logoPath з header.tsx
sed -i '/import logoPath from "@assets\/webservice31.png";/d' client/src/components/header.tsx
sed -i 's/siteSettings?.logoUrl || logoPath/siteSettings?.logoUrl || ""/g' client/src/components/header.tsx

# Видаляємо імпорти logoPath з footer.tsx  
sed -i '/import logoPath from "@assets\/webservice31.png";/d' client/src/components/footer.tsx
sed -i 's/siteSettings?.logoUrl || logoPath/siteSettings?.logoUrl || ""/g' client/src/components/footer.tsx

# Створюємо новий vite.config.ts без @assets
cat > vite.config.ts << 'EOF'
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
});
EOF

# Видаляємо директорію attached_assets якщо існує
rm -rf attached_assets

echo "✅ Виправлення завершено! Тепер можна запускати деплоймент."