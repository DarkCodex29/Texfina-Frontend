#!/bin/bash

# Script de build para Vercel
echo "🔥 Starting Texfina build process..."

# Verificar que angular.json existe
if [ ! -f "angular.json" ]; then
    echo "❌ angular.json not found!"
    exit 1
fi

echo "✅ angular.json found"

# Verificar que package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

echo "✅ package.json found"

# Instalar Angular CLI globalmente
echo "📦 Installing Angular CLI..."
npm install -g @angular/cli@latest

# Verificar instalación
ng version

# Ejecutar build
echo "🏗️ Building Angular app..."
ng build --configuration production

echo "✅ Build completed!"

# Verificar que el directorio de salida existe
if [ -d "dist/texfina-web/browser" ]; then
    echo "✅ Output directory exists: dist/texfina-web/browser"
    ls -la dist/texfina-web/browser/
    
    # Verificar que index.html existe
    if [ -f "dist/texfina-web/browser/index.html" ]; then
        echo "✅ index.html found in output directory"
    else
        echo "❌ index.html not found in output directory"
        exit 1
    fi
else
    echo "❌ Output directory not found!"
    echo "Available directories:"
    ls -la dist/ || echo "No dist directory found"
    if [ -d "dist/texfina-web" ]; then
        echo "Contents of dist/texfina-web:"
        ls -la dist/texfina-web/
    fi
    exit 1
fi