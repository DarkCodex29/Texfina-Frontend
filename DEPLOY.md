# Guía de Despliegue en Vercel - Texfina Web

## Configuración Previa

### 1. Preparación del Repositorio
```bash
# Asegúrate de que todos los archivos estén committeados
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

### 2. Variables de Entorno
En el panel de Vercel, configura las siguientes variables de entorno:

- `NODE_ENV`: `production`
- `API_URL`: URL de tu API backend en producción

### 3. Configuración de Dominio
Si tienes un dominio personalizado, configúralo en Vercel:
- Ir a Settings > Domains
- Agregar tu dominio personalizado
- Configurar DNS según las instrucciones de Vercel

## Proceso de Despliegue

### Opción 1: Conectar Repositorio de GitHub
1. Ve a [vercel.com](https://vercel.com)
2. Haz clic en "New Project"
3. Conecta tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto Angular
5. Las configuraciones en `vercel.json` se aplicarán automáticamente

### Opción 2: Despliegue Manual con CLI
```bash
# Instalar Vercel CLI
npm i -g vercel

# Hacer login
vercel login

# Desplegar
vercel --prod
```

## Comandos Útiles

```bash
# Build local para verificar que todo funciona
npm run build

# Servir build de producción localmente
npm run serve:prod

# Analizar el bundle size
npm run analyze

# Ejecutar linter
npm run lint

# Ejecutar tests
npm run test
```

## Configuraciones Importantes

### vercel.json
- Framework: null (custom build)
- Build Command: `chmod +x build.sh && ./build.sh`
- Output Directory: `dist/texfina-web/browser`
- Install Command: `npm install --legacy-peer-deps`

### angular.json
- Configuración de producción con budgets aumentados
- File replacements para environment.prod.ts
- allowedCommonJsDependencies para evitar warnings

### Environments
- `environment.ts`: Desarrollo (localhost:5116)
- `environment.prod.ts`: Producción (API_URL de producción)

## Verificaciones Post-Despliegue

1. **Funcionalidad básica**:
   - Login funciona
   - Navegación entre páginas
   - Tablas cargan correctamente
   - Filtros y paginación funcionan

2. **Performance**:
   - Tiempo de carga inicial < 3 segundos
   - Lazy loading de rutas funciona
   - No hay errores de consola

3. **Responsive**:
   - Se ve bien en móvil
   - Dropdowns no se recortan
   - Tablas son scrolleable en móvil

## Troubleshooting

### Build Errors
- Si hay errores de budget, aumentar límites en angular.json
- Si hay errores de TypeScript, verificar versiones de dependencias

### Runtime Errors
- Verificar que las URLs del API sean correctas
- Verificar que las variables de entorno estén configuradas
- Revisar la consola del navegador para errores específicos

### Performance Issues
- Usar `npm run analyze` para identificar bundles grandes
- Verificar que lazy loading esté funcionando
- Optimizar imágenes en `src/assets`

## Monitoring

### Logs de Vercel
```bash
# Ver logs en tiempo real
vercel logs

# Ver logs de una función específica
vercel logs --follow
```

### Analytics
- Habilitar Vercel Analytics para métricas de performance
- Configurar error tracking si es necesario

## Rollback

Si necesitas hacer rollback a una versión anterior:
```bash
# Listar deployments
vercel ls

# Promover un deployment anterior
vercel promote [deployment-url]
```

## Notas Adicionales

- Los archivos estáticos se cachean automáticamente por 1 año
- Las rutas SPA se manejan con el rewrite rule en vercel.json
- Headers de seguridad están configurados en vercel.json
- La aplicación está configurada para usar el directorio de output correcto de Angular