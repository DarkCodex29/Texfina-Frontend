# Integración Balanzas Mettler-Toledo MS303TS y MS32001L

## Resumen de Investigación

### Modelos de Balanzas
- **MS303TS**: Balanza de precisión, 320g capacidad, 1mg legibilidad
- **MS32001L**: Balanza analítica, 32kg capacidad, 0.1g legibilidad

### Protocolo SICS (Standard Interface Command Set)
Ambas balanzas utilizan el protocolo MT-SICS de Mettler-Toledo para comunicación serie.

## Configuración de Hardware

### Conexiones Soportadas
- **USB**: Conexión directa via puerto USB (recomendado)
- **RS232**: Puerto serie tradicional
- **LAN**: Conexión de red (algunos modelos)

### Configuración Serie
```javascript
const portConfig = {
  baudRate: 9600,    // Estándar para balanzas MT
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none'
};
```

## Comandos SICS Principales

### Comandos Básicos de Peso
- `S` - Enviar peso actual (continuo)
- `SI` - Enviar peso inmediato (una vez)
- `ST` - Enviar peso estable únicamente
- `Z` - Poner en cero (tarar)
- `ZI` - Tara inmediata
- `C` - Calibrar balanza

### Comandos de Configuración
- `I1` - Información del dispositivo
- `I2` - Tipo de dispositivo y capacidad
- `I3` - Versión de software
- `I4` - Número de serie

### Formato de Respuesta Típico
```
S S    123.45 g\r\n    // Peso estable
S D    123.45 g\r\n    // Peso dinámico (inestable)
S I    ------\r\n      // Peso inválido/error
```

## Implementación Web Serial API

### 1. Solicitar Puerto
```javascript
async function conectarBalanza() {
  try {
    // Filtrar por VID de Mettler-Toledo
    const port = await navigator.serial.requestPort({
      filters: [
        { usbVendorId: 0x0EB8 }  // Mettler-Toledo VID
      ]
    });
    
    await port.open({
      baudRate: 9600,
      dataBits: 8,
      stopBits: 1,
      parity: 'none'
    });
    
    return port;
  } catch (error) {
    console.error('Error conectando balanza:', error);
    return null;
  }
}
```

### 2. Enviar Comandos
```javascript
async function enviarComando(port, comando) {
  const writer = port.writable.getWriter();
  const encoder = new TextEncoder();
  
  try {
    await writer.write(encoder.encode(comando + '\r\n'));
  } finally {
    writer.releaseLock();
  }
}
```

### 3. Leer Respuestas
```javascript
async function leerRespuesta(port) {
  const reader = port.readable.getReader();
  const decoder = new TextDecoder();
  
  try {
    const { value, done } = await reader.read();
    if (done) return null;
    
    return decoder.decode(value);
  } finally {
    reader.releaseLock();
  }
}
```

### 4. Parser de Respuestas SICS
```javascript
function parsearRespuestaSICS(respuesta) {
  // Formato: "S S    123.45 g\r\n"
  const regex = /S\s+([SID])\s+([\-\d\.]+|------)\s*(\w*)/;
  const match = respuesta.match(regex);
  
  if (!match) return null;
  
  const [, status, pesoStr, unidad] = match;
  
  if (pesoStr === '------') {
    return { error: 'Peso inválido' };
  }
  
  return {
    peso: parseFloat(pesoStr),
    unidad: unidad,
    estable: status === 'S',
    dinamico: status === 'D',
    invalido: status === 'I',
    timestamp: new Date()
  };
}
```

## Integración con Formulario de Pesado

### Modificaciones Requeridas en BalanzaService

```typescript
// Reemplazar configuración de puerto mock con configuración real
private readonly configuracionesPuerto = {
  MS303TS: {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    usbVendorId: 0x0EB8,
    usbProductId: 0x0001  // Verificar PID específico
  },
  MS32001L: {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'none',
    usbVendorId: 0x0EB8,
    usbProductId: 0x0002  // Verificar PID específico
  }
};

// Implementar detección automática de balanzas
async function detectarBalanzas(): Promise<BalanzaDetectada[]> {
  const ports = await navigator.serial.getPorts();
  const balanzasDetectadas = [];
  
  for (const port of ports) {
    const info = port.getInfo();
    if (info.usbVendorId === 0x0EB8) {
      // Identificar modelo por product ID
      const modelo = identificarModelo(info.usbProductId);
      balanzasDetectadas.push({
        puerto: port,
        modelo: modelo,
        numeroSerie: await obtenerNumeroSerie(port)
      });
    }
  }
  
  return balanzasDetectadas;
}
```

## Pruebas y Validación

### Lista de Verificación
1. **Conexión Física**
   - [ ] Balanza conectada via USB
   - [ ] Driver instalado correctamente
   - [ ] Puerto COM asignado

2. **Navegador Web**
   - [ ] Chrome 89+ en desktop
   - [ ] Flag experimental habilitado (si es necesario)
   - [ ] HTTPS requerido para producción

3. **Comandos SICS**
   - [ ] Comando `S` devuelve peso actual
   - [ ] Comando `Z` tara correctamente
   - [ ] Parsing de respuestas funciona
   - [ ] Detección estabilidad correcta

4. **Interfaz Usuario**
   - [ ] Botón conectar/desconectar
   - [ ] Indicador estado balanza
   - [ ] Captura peso estable
   - [ ] Manejo errores

## Documentación Adicional Requerida

### De Mettler-Toledo
1. **Manual MT-SICS Reference** - Comandos completos
2. **Certificados de Calibración** - Para trazabilidad
3. **Software de Configuración** - Para ajustes avanzados

### Implementación en Producción
1. **Política HTTPS** - Web Serial API requiere contexto seguro
2. **Permisos Usuario** - Manejo de autorizaciones
3. **Manejo Errores** - Reconexión automática
4. **Logging/Auditoría** - Para cumplimiento normativo

## Recursos Técnicos

- [Web Serial API Documentation](https://developer.chrome.com/docs/capabilities/serial)
- [MT-SICS Protocol GitHub](https://github.com/Atlantis-Software/mt-sics)
- [Mettler Toledo Support Portal](https://www.mt.com/int/en/home/support.html)

## Próximos Pasos

1. **Obtener Documentación Oficial**: Contactar soporte Mettler-Toledo
2. **Configurar Hardware de Prueba**: Conectar balanzas al entorno desarrollo
3. **Implementar Detección Automática**: Identificar modelos conectados
4. **Realizar Pruebas Funcionales**: Validar comandos SICS
5. **Integrar con Formularios**: Actualizar componente pesado
6. **Documentar Procedimientos**: Para operadores finales