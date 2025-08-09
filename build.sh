#!/bin/bash

echo "🔨 Iniciando build de Texfina Web..."

# Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist/

# Ejecutar el build de Angular
echo "📦 Construyendo aplicación Angular..."
ng build --configuration production

# Verificar si el build fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Build completado exitosamente!"
    echo "📁 Archivos generados en: dist/texfina-web"
    
    # Listar el contenido del directorio dist para verificación
    echo "📋 Contenido del directorio dist:"
    ls -la dist/texfina-web/
else
    echo "❌ Error durante el build"
    exit 1
fi

echo "🚀 Build listo para deployment!"