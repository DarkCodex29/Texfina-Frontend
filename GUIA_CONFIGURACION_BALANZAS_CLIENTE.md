# 🏭 GUÍA DE CONFIGURACIÓN BALANZAS METTLER-TOLEDO
## Para implementación en Texfina Web

---

## 📋 **INFORMACIÓN DE EQUIPOS**

### Balanza 1 - Analítica
- **Modelo**: MS32001L/01 (NewClassic MF)
- **Capacidad**: 32 kg
- **Precisión**: 0.1 g
- **Número de Serie**: B445240418
- **TDNR**: 42.28.3.2937.1330

### Balanza 2 - Precisión
- **Modelo**: MS303TS/00
- **Capacidad**: 320 g  
- **Precisión**: 1 mg
- **Número de Serie**: B819829012

---

## 🎯 **PASOS OBLIGATORIOS PARA EL CLIENTE**

### **PASO 1: CONTACTAR SOPORTE METTLER-TOLEDO**

📞 **Contactar con la siguiente información exacta:**

**Datos a proporcionar:**
- Modelo 1: MS32001L/01 - Serie: B445240418
- Modelo 2: MS303TS/00 - Serie: B819829012
- TDNR: 42.28.3.2937.1330 (para MS32001L)
- Sistema Operativo: Windows 10/11
- **Solicitar**: Drivers USB específicos para protocolo MT-SICS

**Contactos Mettler-Toledo:**
- 🌐 Web: https://www.mt.com/int/en/home/support.html
- 📧 Email: support@mt.com (o soporte local)
- 📞 Teléfono: Consultar número local en la web

---

### **PASO 2: DESCARGAR E INSTALAR DRIVERS**

1. **Descargar drivers específicos** desde Mettler-Toledo
2. **Instalar drivers** siguiendo las instrucciones del fabricante
3. **Reiniciar el PC** después de la instalación

⚠️ **IMPORTANTE**: NO usar drivers genéricos USB-Serial. Deben ser específicos de Mettler-Toledo.

---

### **PASO 3: CONFIGURAR BALANZAS EN MODO SICS**

🔧 **En cada balanza, configurar:**

#### MS32001L/01 (Balanza analítica):
1. Menú → Setup → Communication → Interface
2. Seleccionar: **MT-SICS**
3. Configurar velocidad: **9600 baud**
4. Guardar configuración

#### MS303TS/00 (Balanza precisión):
1. Menú → Setup → Communication → Interface  
2. Seleccionar: **MT-SICS**
3. Configurar velocidad: **9600 baud**
4. Guardar configuración

---

### **PASO 4: CONECTAR HARDWARE**

1. **Conectar ambas balanzas** via USB al PC
2. **Verificar en Administrador de dispositivos**:
   - Windows + X → "Administrador de dispositivos"
   - Buscar en "Puertos (COM y LPT)"
   - Debe aparecer: "Mettler Toledo USB Serial Port (COM3)" y "COM4"
   - ✅ Sin símbolos de error amarillos

---

### **PASO 5: CONFIGURAR NAVEGADOR WEB**

🌐 **Requisitos obligatorios:**
- **Google Chrome 89+** o **Microsoft Edge 89+**
- ❌ NO funciona en Firefox, Safari, Internet Explorer
- ❌ NO funciona en dispositivos móviles

🔒 **Configurar HTTPS:**
- El sistema Texfina debe funcionar con HTTPS (no HTTP)
- URL debe empezar con `https://`
- Web Serial API requiere conexión segura

---

### **PASO 6: CONFIGURAR PERMISOS**

🔐 **Primera vez - Autorizar acceso:**
1. Abrir Texfina Web en Chrome
2. Ir a "Consumos" → clic "Iniciar Pesado"
3. **Aparecerá popup de permisos**
4. Seleccionar balanza Mettler-Toledo de la lista
5. Clic "Conectar"
6. Chrome recordará este permiso

---

## 👨‍💼 **PROCEDIMIENTO OPERATIVO**

### **Secuencia de pesado:**

1. **Abrir sistema Texfina** en Chrome con HTTPS
2. **Ir a Consumos** → "Iniciar Pesado"
3. **Escanear código QCA** con lector
4. **Seleccionar insumo y lote**
5. **Colocar material en balanza**
6. **Clic botón "Balanza"** → aparece peso en tiempo real
7. **Esperar indicador "Estable"**
8. **Clic "Capturar peso"** → se transfiere al formulario
9. **Completar campos** y guardar

---

## 🔧 **TROUBLESHOOTING**

### **Si las balanzas no aparecen:**
- ✅ Verificar drivers instalados correctamente
- ✅ Comprobar cables USB conectados
- ✅ Balanzas encendidas y funcionando
- ✅ Protocolo SICS habilitado en ambas balanzas

### **Si el navegador no detecta:**
- ✅ Usar Chrome/Edge (no Firefox/Safari)
- ✅ URL debe ser HTTPS (no HTTP)
- ✅ Dar permisos cuando aparezca el popup
- ✅ Verificar que Web Serial API esté habilitado

### **Si el peso no aparece:**
- ✅ Verificar balanza en modo SICS
- ✅ Comprobar velocidad 9600 baud
- ✅ Reiniciar navegador y volver a dar permisos
- ✅ Revisar consola del navegador (F12) para errores

---

## 📞 **SOPORTE TÉCNICO**

### **Para problemas de hardware:**
- **Mettler-Toledo**: Soporte oficial del fabricante
- **Drivers**: Solo descargar desde sitio oficial MT

### **Para problemas de software:**
- **Texfina Web**: Equipo de desarrollo Texfina
- **Navegador**: Verificar versión Chrome/Edge

---

## ⚠️ **CONSIDERACIONES IMPORTANTES**

### **Seguridad:**
- Mantener programa de calibración regular
- Verificar certificados de calibración vigentes
- Registrar todos los pesados para auditoría

### **Producción:**
- Una balanza por estación de trabajo
- Siempre mantener opción de entrada manual como backup
- Capacitar operadores en secuencia correcta

### **Red corporativa:**
- IT debe permitir acceso USB en políticas de seguridad
- No bloquear Web Serial API en navegadores
- Configurar certificado SSL válido para HTTPS

---

## ✅ **CHECKLIST FINAL**

Antes de ir a producción, verificar:

- [ ] Drivers Mettler-Toledo instalados
- [ ] Balanzas configuradas en modo SICS
- [ ] Ambas balanzas detectadas en Administrador de dispositivos  
- [ ] Chrome/Edge actualizado (89+)
- [ ] Sistema Texfina funcionando con HTTPS
- [ ] Permisos de puerto serie otorgados
- [ ] Prueba de pesado exitosa en ambas balanzas
- [ ] Operadores capacitados en el procedimiento

---

## 🎯 **ESTADO ACTUAL DEL DESARROLLO**

✅ **Software 100% listo:**
- Integración Web Serial API implementada
- Protocolo MT-SICS conforme a documentación oficial
- Interfaz de usuario completa con indicadores de estado
- Manejo de errores y reconexión automática
- Formularios integrados con captura automática de peso

**⏳ Pendiente únicamente: Configuración de hardware por parte del cliente**

---

*Documento generado para implementación Texfina Web - Integración Balanzas Mettler-Toledo*