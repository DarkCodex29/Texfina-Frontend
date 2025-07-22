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

  async conectarBalanza(config: BalanzaConfig): Promise<boolean> {
    try {
      if (!('serial' in navigator)) {
        throw new Error('Web Serial API no está disponible en este navegador');
      }

      // Solicitar puerto serie con filtros específicos para Mettler-Toledo
      this.puerto = await (navigator as any).serial.requestPort({
        filters: [
          { usbVendorId: 0x0EB8 }, // Mettler Toledo VID oficial
          { usbVendorId: 0x0EB8, usbProductId: 0x0001 }, // MS303TS
          { usbVendorId: 0x0EB8, usbProductId: 0x0002 }, // MS32001L
        ]
      });

      // Configurar y abrir el puerto
      await this.puerto.open({
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      this._conectado.next(true);
      this._error.next(null);
      
      console.log(`Balanza ${config.modelo} conectada exitosamente`);
      return true;

    } catch (error) {
      const errorMsg = `Error al conectar balanza: ${error}`;
      this._error.next(errorMsg);
      console.error(errorMsg);
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
    if (!this.puerto || this.leyendoPeso) {
      return;
    }

    this.leyendoPeso = true;

    try {
      // Configurar lector
      this.reader = this.puerto.readable!.getReader();
      
      // Enviar comando SICS para obtener peso
      await this.enviarComando('S\r\n');

      // Leer respuesta continua
      while (this.leyendoPeso && this.reader) {
        const { value, done } = await this.reader.read();
        
        if (done) break;

        const respuesta = new TextDecoder().decode(value);
        const lectura = this.parsearRespuestaSICS(respuesta, config.modelo);
        
        if (lectura) {
          this._pesoActual.next(lectura);
        }
      }

    } catch (error) {
      this._error.next(`Error en lectura de peso: ${error}`);
      console.error('Error en lectura de peso:', error);
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
    if (!this.puerto || !this.puerto.writable) {
      throw new Error('Puerto no disponible para escritura');
    }

    const writer = this.puerto.writable.getWriter();
    try {
      await writer.write(new TextEncoder().encode(comando));
    } finally {
      writer.releaseLock();
    }
  }

  private parsearRespuestaSICS(respuesta: string, modelo: 'MS32001L' | 'MS303TS'): BalanzaReading | null {
    try {
      // Formato típico: "S S      0.00 g\r\n" o "S D    123.45 g\r\n" o "S I    ------\r\n"
      const match = respuesta.match(/S\s+([SDI])\s+([\-\d\.]+|------)\s*(\w*)/);
      
      if (!match) {
        return null;
      }

      const [, status, pesoStr, unidad] = match;
      
      // Manejar peso inválido
      if (status === 'I' || pesoStr === '------') {
        console.warn('Peso inválido recibido de la balanza');
        return null;
      }
      
      const peso = parseFloat(pesoStr);
      const estable = status === 'S'; // S = Stable, D = Dynamic, I = Invalid

      return {
        peso,
        unidad,
        estable,
        timestamp: new Date(),
        dispositivo: modelo
      };

    } catch (error) {
      console.error('Error al parsear respuesta SICS:', error);
      return null;
    }
  }

  // Obtener peso estable únicamente
  async obtenerPesoEstable(config: BalanzaConfig): Promise<BalanzaReading | null> {
    if (!this.puerto) {
      throw new Error('Balanza no conectada');
    }

    try {
      await this.enviarComando('ST\r\n'); // Send stable weight only
      
      const reader = this.puerto.readable!.getReader();
      const { value } = await reader.read();
      reader.releaseLock();

      const respuesta = new TextDecoder().decode(value);
      return this.parsearRespuestaSICS(respuesta, config.modelo);

    } catch (error) {
      throw new Error(`Error al obtener peso estable: ${error}`);
    }
  }

  // Métodos para integración con componentes
  async pesarParaConsumo(): Promise<BalanzaReading | null> {
    const dispositivos = this._dispositivos.value;
    const balanzaPrincipal = dispositivos[0]; // Usar primera balanza configurada
    
    if (!this._conectado.value) {
      await this.conectarBalanza(balanzaPrincipal);
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