#!/bin/bash

# Webservice Studio Deployment Script
# This script deploys the full application to any VPS/Cloud server

set -e

echo "🚀 Starting Webservice Studio deployment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p ssl

# Set permissions
chmod 755 uploads
chmod 700 ssl

# Check if SSL certificates exist
if [ ! -f "ssl/web-service.studio.crt" ] || [ ! -f "ssl/web-service.studio.key" ]; then
    echo "⚠️  SSL certificates not found!"
    echo "Please add your SSL certificates:"
    echo "  - ssl/web-service.studio.crt"
    echo "  - ssl/web-service.studio.key"
    echo ""
    echo "You can get free SSL certificates from Let's Encrypt:"
    echo "https://letsencrypt.org/"
    echo ""
    echo "For testing, you can create self-signed certificates:"
    echo "openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout ssl/web-service.studio.key -out ssl/web-service.studio.crt"
    read -p "Continue without SSL? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build and start containers
echo "🔨 Building Docker containers..."
docker-compose build --no-cache

echo "🚀 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to initialize..."
sleep 10

# Check if services are running
echo "✅ Checking service status..."
docker-compose ps

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "Your application is now running:"
echo "  - HTTP: http://localhost"
echo "  - HTTPS: https://localhost"
echo "  - Database: localhost:5432"
echo ""
echo "Admin credentials:"
echo "  - Username: admin"
echo "  - Password: admin123"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo "To restart: docker-compose restart"
echo ""
echo "🔧 Next steps:"
echo "1. Point your domain DNS to this server's IP"
echo "2. Update SSL certificates in ssl/ directory"
echo "3. Change default admin password in admin panel"
echo "4. Configure environment variables in docker-compose.yml"