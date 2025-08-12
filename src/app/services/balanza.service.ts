import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { takeWhile, map } from 'rxjs/operators';

export interface BalanzaReading {
  peso: number;
  unidad: string;
  estable: boolean;
  timestamp: Date;
  dispositivo: 'MS32001L' | 'MS303TS';
}

export interface BalanzaConfig {
  puerto: string;
  modelo: 'MS32001L' | 'MS303TS';
  timeout: number;
  intervaloPesado: number;
}

@Injectable({
  providedIn: 'root'
})
export class BalanzaService {
  private readonly _pesoActual = new BehaviorSubject<BalanzaReading | null>(null);
  private readonly _dispositivos = new BehaviorSubject<BalanzaConfig[]>([]);
  private readonly _conectado = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);

  private puerto: any | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private leyendoPeso = false;

  readonly pesoActual$ = this._pesoActual.asObservable();
  readonly dispositivos$ = this._dispositivos.asObservable();
  readonly conectado$ = this._conectado.asObservable();
  readonly error$ = this._error.asObservable();

  constructor() {
    this.inicializarDispositivos();
  }

  private inicializarDispositivos(): void {
    const dispositivos: BalanzaConfig[] = [
      {
        puerto: 'auto',
        modelo: 'MS32001L', // NewClassic MF - 32kg, 0.1g - SNR: B445240418
        timeout: 5000,
        intervaloPesado: 1000
      },
      {
        puerto: 'auto',
        modelo: 'MS303TS', // Precisión 320g, 1mg - SNR: B819829012
        timeout: 5000,
        intervaloPesado: 1000
      }
    ];
    this._dispositivos.next(dispositivos);
  }

  async conectarBalanza(config: BalanzaConfig, sinFiltros: boolean = false): Promise<boolean> {
    try {
      console.log('🔌 [BALANZA] Iniciando conexión con balanza...');
      console.log('📋 [BALANZA] Configuración:', config);
      console.log('🔍 [BALANZA] Modo sin filtros:', sinFiltros);
      
      if (!('serial' in navigator)) {
        console.error('❌ [BALANZA] Web Serial API no disponible');
        throw new Error('Web Serial API no está disponible en este navegador');
      }

      console.log('🔍 [BALANZA] Solicitando puerto serie...');
      
      // Solicitar puerto serie con o sin filtros
      if (sinFiltros) {
        console.log('📂 [BALANZA] Mostrando TODOS los puertos disponibles (sin filtros)');
        this.puerto = await (navigator as any).serial.requestPort();
      } else {
        console.log('🔍 [BALANZA] Buscando adaptadores USB-Serial conocidos');
        
        // Solicitar puerto serie con filtros para adaptadores comunes
        // NOTA: Las balanzas pueden estar conectadas vía adaptadores USB-Serial
        this.puerto = await (navigator as any).serial.requestPort({
          filters: [
            // Adaptadores Prolific (PL2303GT y otros)
            { usbVendorId: 0x067B }, // Prolific Technology
            { usbVendorId: 0x067B, usbProductId: 0x2303 }, // PL2303
            
            // Adaptadores FTDI
            { usbVendorId: 0x0403 }, // FTDI
            { usbVendorId: 0x0403, usbProductId: 0x6001 }, // FT232R
            
            // Adaptadores Silicon Labs
            { usbVendorId: 0x10C4 }, // Silicon Labs
            { usbVendorId: 0x10C4, usbProductId: 0xEA60 }, // CP210x
            
            // Mettler Toledo (por si acaso tienen conexión directa)
            { usbVendorId: 0x0EB8 }, // Mettler Toledo VID oficial
          ]
        });
      }

      console.log('✅ [BALANZA] Puerto seleccionado:', this.puerto);
      
      // Verificar si el puerto ya está abierto
      if (this.puerto.readable || this.puerto.writable) {
        console.log('⚠️ [BALANZA] El puerto ya estaba abierto, cerrando primero...');
        try {
          await this.puerto.close();
          console.log('✅ [BALANZA] Puerto cerrado correctamente');
          // Esperar un momento antes de reabrir
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (closeError) {
          console.warn('⚠️ [BALANZA] Error al cerrar puerto:', closeError);
        }
      }
      
      console.log('🔧 [BALANZA] Configurando puerto: 9600,8,N,1');
      
      // Configurar y abrir el puerto
      try {
        await this.puerto.open({
          baudRate: 9600,
          dataBits: 8,
          stopBits: 1,
          parity: 'none',
          flowControl: 'none'
        });
        
        console.log('✅ [BALANZA] Puerto abierto exitosamente');
        console.log('📊 [BALANZA] Estado del puerto:', {
          readable: !!this.puerto.readable,
          writable: !!this.puerto.writable
        });
      } catch (openError: any) {
        // Analizar el tipo de error
        if (openError.message?.includes('Failed to open serial port')) {
          console.error('❌ [BALANZA] No se pudo abrir el puerto. Posibles causas:');
          console.error('   1. El puerto está siendo usado por otro programa');
          console.error('   2. El dispositivo fue desconectado');
          console.error('   3. Problemas con los drivers USB-Serial');
          console.error('   Solución: Cierre otros programas que puedan estar usando COM3');
        }
        throw openError;
      }

      this._conectado.next(true);
      this._error.next(null);
      
      console.log(`✅ [BALANZA] ${config.modelo} conectada exitosamente`);
      return true;

    } catch (error: any) {
      console.error('❌ [BALANZA] Error al conectar:', error);
      console.error('❌ [BALANZA] Detalles del error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMsg = `Error al conectar balanza: ${error.message || error}`;
      this._error.next(errorMsg);
      return false;
    }
  }

  async desconectarBalanza(): Promise<void> {
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }

      if (this.puerto && this.puerto.readable) {
        await this.puerto.close();
      }

      this.puerto = null;
      this.leyendoPeso = false;
      this._conectado.next(false);
      this._pesoActual.next(null);

    } catch (error) {
      console.error('Error al desconectar balanza:', error);
    }
  }

  async iniciarLecturaPeso(config: BalanzaConfig): Promise<void> {
    console.log('⚖️ [BALANZA] Iniciando lectura de peso...');
    
    if (!this.puerto || this.leyendoPeso) {
      console.warn('⚠️ [BALANZA] Puerto no disponible o ya leyendo peso');
      return;
    }

    this.leyendoPeso = true;
    console.log('📡 [BALANZA] Modo lectura continua activado');

    try {
      // Configurar lector
      this.reader = this.puerto.readable!.getReader();
      console.log('📖 [BALANZA] Reader configurado');
      
      // Enviar comando SICS para obtener peso
      console.log('📤 [BALANZA] Enviando comando S (lectura continua)...');
      await this.enviarComando('S\r\n');

      // Buffer para acumular fragmentos
      let buffer = '';
      let lecturaCount = 0;
      
      // Leer respuesta continua
      while (this.leyendoPeso && this.reader) {
        const { value, done } = await this.reader.read();
        
        if (done) {
          console.log('🔚 [BALANZA] Lectura finalizada');
          break;
        }

        const fragmento = new TextDecoder().decode(value);
        console.log(`📥 [BALANZA] Fragmento #${++lecturaCount}:`, fragmento.replace(/\r\n/g, '\\r\\n'));
        
        // Acumular fragmentos en el buffer
        buffer += fragmento;
        console.log('📝 [BALANZA] Buffer actual:', buffer.replace(/\r\n/g, '\\r\\n'));
        
        // Buscar líneas completas terminadas en \r\n o \n
        const lineas = buffer.split(/[\r\n]+/);
        
        // Procesar todas las líneas completas excepto la última (que puede estar incompleta)
        for (let i = 0; i < lineas.length - 1; i++) {
          const linea = lineas[i].trim();
          if (linea) {
            console.log('📋 [BALANZA] Procesando línea completa:', linea);
            const lectura = this.parsearRespuestaSICS(linea, config.modelo);
            
            if (lectura) {
              console.log('✅ [BALANZA] Lectura válida:', lectura);
              this._pesoActual.next(lectura);
            }
          }
        }
        
        // Mantener solo la última línea (posiblemente incompleta) en el buffer
        buffer = lineas[lineas.length - 1];
        
        // Si el buffer tiene una respuesta que parece completa, procesarla
        if (buffer.length > 10 && buffer.includes('g')) {
          console.log('📋 [BALANZA] Procesando buffer acumulado:', buffer);
          const lectura = this.parsearRespuestaSICS(buffer, config.modelo);
          
          if (lectura) {
            console.log('✅ [BALANZA] Lectura válida del buffer:', lectura);
            this._pesoActual.next(lectura);
            buffer = ''; // Limpiar buffer después de procesar
          }
        }
      }

    } catch (error) {
      console.error('❌ [BALANZA] Error en lectura de peso:', error);
      this._error.next(`Error en lectura de peso: ${error}`);
    }
  }

  async detenerLecturaPeso(): Promise<void> {
    this.leyendoPeso = false;
    
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (error) {
        console.error('Error al cancelar reader:', error);
      }
      this.reader = null;
    }
  }

  async obtenerPesoUnaVez(config: BalanzaConfig): Promise<BalanzaReading | null> {
    if (!this.puerto) {
      throw new Error('Balanza no conectada');
    }

    try {
      const writer = this.puerto.writable!.getWriter();
      await writer.write(new TextEncoder().encode('SI\r\n')); // Send Immediate - comando SICS correcto
      writer.releaseLock();

      const reader = this.puerto.readable!.getReader();
      const { value } = await reader.read();
      reader.releaseLock();

      const respuesta = new TextDecoder().decode(value);
      return this.parsearRespuestaSICS(respuesta, config.modelo);

    } catch (error) {
      throw new Error(`Error al obtener peso: ${error}`);
    }
  }

  private async enviarComando(comando: string): Promise<void> {
    console.log(`📤 [BALANZA] Enviando comando: "${comando.replace(/\r\n/g, '\\r\\n')}"`);
    
    if (!this.puerto || !this.puerto.writable) {
      console.error('❌ [BALANZA] Puerto no disponible para escritura');
      throw new Error('Puerto no disponible para escritura');
    }

    const writer = this.puerto.writable.getWriter();
    try {
      const bytes = new TextEncoder().encode(comando);
      console.log(`📤 [BALANZA] Bytes a enviar:`, Array.from(bytes));
      await writer.write(bytes);
      console.log('✅ [BALANZA] Comando enviado exitosamente');
    } catch (error) {
      console.error('❌ [BALANZA] Error al enviar comando:', error);
      throw error;
    } finally {
      writer.releaseLock();
    }
  }

  private parsearRespuestaSICS(respuesta: string, modelo: 'MS32001L' | 'MS303TS'): BalanzaReading | null {
    try {
      console.log(`🔍 [BALANZA] Parseando respuesta: "${respuesta.replace(/\r\n/g, '\\r\\n')}"`);
      
      // Formato típico: "S S      0.00 g\r\n" o "S D    123.45 g\r\n" o "S I    ------\r\n"
      const match = respuesta.match(/S\s+([SDI])\s+([\-\d\.]+|------)\s*(\w*)/);
      
      if (!match) {
        console.warn('⚠️ [BALANZA] Respuesta no coincide con formato SICS esperado');
        return null;
      }

      const [fullMatch, status, pesoStr, unidad] = match;
      console.log('📊 [BALANZA] Datos parseados:', { status, pesoStr, unidad });
      
      // Manejar peso inválido
      if (status === 'I' || pesoStr === '------') {
        console.warn('⚠️ [BALANZA] Peso inválido recibido (Status=I o peso=------)');
        return null;
      }
      
      const peso = parseFloat(pesoStr);
      const estable = status === 'S'; // S = Stable, D = Dynamic, I = Invalid
      
      const reading = {
        peso,
        unidad,
        estable,
        timestamp: new Date(),
        dispositivo: modelo
      };
      
      console.log('✅ [BALANZA] Lectura parseada:', reading);
      return reading;

    } catch (error) {
      console.error('❌ [BALANZA] Error al parsear respuesta SICS:', error);
      return null;
    }
  }

  // Obtener peso estable únicamente
  async obtenerPesoEstable(config: BalanzaConfig): Promise<BalanzaReading | null> {
    console.log('⚖️ [BALANZA] Solicitando peso estable...');
    
    if (!this.puerto) {
      console.error('❌ [BALANZA] Balanza no conectada');
      throw new Error('Balanza no conectada');
    }

    try {
      console.log('📤 [BALANZA] Enviando comando ST (peso estable)...');
      await this.enviarComando('ST\r\n'); // Send stable weight only
      
      const reader = this.puerto.readable!.getReader();
      console.log('⏳ [BALANZA] Esperando respuesta de peso estable...');
      const { value } = await reader.read();
      reader.releaseLock();

      const respuesta = new TextDecoder().decode(value);
      console.log(`📥 [BALANZA] Respuesta recibida: "${respuesta.replace(/\r\n/g, '\\r\\n')}"`);
      
      const lectura = this.parsearRespuestaSICS(respuesta, config.modelo);
      if (lectura) {
        console.log('✅ [BALANZA] Peso estable obtenido:', lectura);
      } else {
        console.warn('⚠️ [BALANZA] No se pudo obtener peso estable');
      }
      
      return lectura;

    } catch (error) {
      console.error('❌ [BALANZA] Error al obtener peso estable:', error);
      throw new Error(`Error al obtener peso estable: ${error}`);
    }
  }

  // Método alternativo para conectar mostrando TODOS los puertos
  async conectarBalanzaSinFiltros(config: BalanzaConfig): Promise<boolean> {
    console.log('🔓 [BALANZA] Conectando sin filtros - se mostrarán TODOS los puertos COM');
    return this.conectarBalanza(config, true);
  }

  // Método para forzar desconexión y reconexión
  async reconectarBalanza(config: BalanzaConfig): Promise<boolean> {
    console.log('🔄 [BALANZA] Intentando reconectar balanza...');
    
    // Primero intentar desconectar si hay conexión
    if (this.puerto) {
      await this.desconectarBalanza();
      // Esperar un momento para que el puerto se libere
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Intentar reconectar
    return this.conectarBalanza(config);
  }

  // Método para obtener puertos disponibles (diagnóstico)
  async listarPuertosDisponibles(): Promise<void> {
    try {
      console.log('📋 [BALANZA] Listando puertos seriales disponibles...');
      const ports = await (navigator as any).serial.getPorts();
      
      if (ports.length === 0) {
        console.log('ℹ️ [BALANZA] No hay puertos previamente autorizados');
      } else {
        console.log(`✅ [BALANZA] ${ports.length} puerto(s) previamente autorizado(s):`, ports);
        ports.forEach((port: any, index: number) => {
          console.log(`   Puerto ${index + 1}:`, port);
        });
      }
    } catch (error) {
      console.error('❌ [BALANZA] Error al listar puertos:', error);
    }
  }

  // Métodos para integración con componentes
  async pesarParaConsumo(): Promise<BalanzaReading | null> {
    const dispositivos = this._dispositivos.value;
    const balanzaPrincipal = dispositivos[0]; // Usar primera balanza configurada
    
    if (!this._conectado.value) {
      // Intentar primero con filtros, si falla, intentar sin filtros
      const conectado = await this.conectarBalanza(balanzaPrincipal);
      if (!conectado) {
        console.log('⚠️ [BALANZA] Reintentando sin filtros...');
        await this.conectarBalanzaSinFiltros(balanzaPrincipal);
      }
    }

    return await this.obtenerPesoEstable(balanzaPrincipal); // Usar peso estable
  }

  async calibrarBalanza(config: BalanzaConfig): Promise<boolean> {
    try {
      await this.enviarComando('C\r\n'); // Comando de calibración SICS
      return true;
    } catch (error) {
      this._error.next(`Error en calibración: ${error}`);
      return false;
    }
  }

  async resetearBalanza(config: BalanzaConfig): Promise<boolean> {
    try {
      await this.enviarComando('Z\r\n'); // Comando zero/tare SICS
      return true;
    } catch (error) {
      this._error.next(`Error en reset: ${error}`);
      return false;
    }
  }

  // Configuración de dispositivos
  actualizarConfiguracion(dispositivos: BalanzaConfig[]): void {
    this._dispositivos.next(dispositivos);
  }

  obtenerConfiguracion(): BalanzaConfig[] {
    return this._dispositivos.value;
  }
}