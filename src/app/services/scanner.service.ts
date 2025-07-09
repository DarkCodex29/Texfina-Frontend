import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { filter, map, debounceTime } from 'rxjs/operators';

export interface ScanResult {
  codigo: string;
  tipo: string; // 'CODE128', 'EAN13', 'QR', etc.
  timestamp: Date;
  dispositivo: string;
}

export interface ScannerConfig {
  modelo: 'NLS-HR32';
  modo: 'HID' | 'DataPipe' | 'COM';
  vendorId: number;
  productId: number;
  timeout: number;
}

@Injectable({
  providedIn: 'root'
})
export class ScannerService {
  private readonly _ultimoScan = new BehaviorSubject<ScanResult | null>(null);
  private readonly _conectado = new BehaviorSubject<boolean>(false);
  private readonly _error = new BehaviorSubject<string | null>(null);
  private readonly _configuracion = new BehaviorSubject<ScannerConfig | null>(null);

  private device: any | null = null;
  private escuchandoTeclado = false;
  private bufferScan = '';
  private timeoutScan: any;

  readonly ultimoScan$ = this._ultimoScan.asObservable();
  readonly conectado$ = this._conectado.asObservable();
  readonly error$ = this._error.asObservable();

  constructor() {
    this.inicializarConfiguracion();
    this.configurarEscuchaGlobal();
  }

  private inicializarConfiguracion(): void {
    const config: ScannerConfig = {
      modelo: 'NLS-HR32',
      modo: 'HID', // Modo recomendado para web
      vendorId: 0x1EAB, // Newland VID
      productId: 0x0000, // Se detectará automáticamente
      timeout: 5000
    };
    this._configuracion.next(config);
  }

  async conectarScanner(): Promise<boolean> {
    try {
      if (!('hid' in navigator)) {
        // Fallback a modo teclado si WebHID no está disponible
        console.warn('WebHID no disponible, usando modo teclado');
        return this.iniciarModoTeclado();
      }

      const config = this._configuracion.value!;
      
      // Solicitar dispositivo HID
      const devices = await (navigator as any).hid.requestDevice({
        filters: [
          {
            vendorId: config.vendorId,
            usagePage: 0x008C, // Barcode Scanner Usage Page
          }
        ]
      });

      if (devices.length === 0) {
        throw new Error('No se encontró scanner NLS-HR32');
      }

      this.device = devices[0];
      
      // Abrir conexión
      await this.device.open();
      
      // Configurar listener para datos del scanner
      this.device.addEventListener('inputreport', this.manejarReporteHID.bind(this));
      
      this._conectado.next(true);
      this._error.next(null);
      
      console.log('Scanner NLS-HR32 conectado exitosamente');
      return true;

    } catch (error) {
      const errorMsg = `Error al conectar scanner: ${error}`;
      this._error.next(errorMsg);
      console.error(errorMsg);
      
      // Intentar modo teclado como fallback
      return this.iniciarModoTeclado();
    }
  }

  private iniciarModoTeclado(): boolean {
    try {
      this.escuchandoTeclado = true;
      this._conectado.next(true);
      console.log('Scanner en modo teclado (HID-KBW) activado');
      return true;
    } catch (error) {
      console.error('Error al iniciar modo teclado:', error);
      return false;
    }
  }

  async desconectarScanner(): Promise<void> {
    try {
      if (this.device) {
        await this.device.close();
        this.device = null;
      }

      this.escuchandoTeclado = false;
      this.limpiarBuffer();
      
      this._conectado.next(false);
      this._ultimoScan.next(null);

    } catch (error) {
      console.error('Error al desconectar scanner:', error);
    }
  }

  private manejarReporteHID(event: any): void {
    try {
      const data = new Uint8Array(event.data.buffer);
      const codigo = this.decodificarDataHID(data);
      
      if (codigo) {
        const resultado: ScanResult = {
          codigo,
          tipo: this.detectarTipoCodigo(codigo),
          timestamp: new Date(),
          dispositivo: 'NLS-HR32'
        };
        
        this._ultimoScan.next(resultado);
      }

    } catch (error) {
      console.error('Error al procesar reporte HID:', error);
    }
  }

  private configurarEscuchaGlobal(): void {
    // Escuchar eventos de teclado para modo HID-KBW
    fromEvent<KeyboardEvent>(document, 'keydown')
      .pipe(
        filter(() => this.escuchandoTeclado),
        debounceTime(50)
      )
      .subscribe(event => this.manejarTeclaGlobal(event));
  }

  private manejarTeclaGlobal(event: KeyboardEvent): void {
    // Detectar secuencias de scanner (típicamente rápidas y terminadas en Enter)
    if (event.key === 'Enter') {
      if (this.bufferScan.length > 0) {
        const resultado: ScanResult = {
          codigo: this.bufferScan.trim(),
          tipo: this.detectarTipoCodigo(this.bufferScan.trim()),
          timestamp: new Date(),
          dispositivo: 'NLS-HR32-KBW'
        };
        
        this._ultimoScan.next(resultado);
        this.limpiarBuffer();
      }
    } else if (event.key.length === 1) {
      // Acumular caracteres
      this.bufferScan += event.key;
      
      // Reset timeout para limpiar buffer
      clearTimeout(this.timeoutScan);
      this.timeoutScan = setTimeout(() => {
        this.limpiarBuffer();
      }, 100);
    }
  }

  private decodificarDataHID(data: Uint8Array): string | null {
    try {
      // Implementar decodificación específica para NLS-HR32
      // El formato exacto depende de la configuración del scanner
      const decoder = new TextDecoder('utf-8');
      const texto = decoder.decode(data);
      
      // Filtrar caracteres de control y espacios
      const codigo = texto.replace(/[\x00-\x1F\x7F]/g, '').trim();
      
      return codigo.length > 0 ? codigo : null;

    } catch (error) {
      console.error('Error al decodificar datos HID:', error);
      return null;
    }
  }

  private detectarTipoCodigo(codigo: string): string {
    if (!codigo) return 'UNKNOWN';

    // Detectar tipo basado en longitud y patrón
    if (/^\d{13}$/.test(codigo)) return 'EAN13';
    if (/^\d{12}$/.test(codigo)) return 'UPC-A';
    if (/^\d{8}$/.test(codigo)) return 'EAN8';
    if (codigo.length >= 1 && codigo.length <= 43) return 'CODE128';
    if (/^[A-Z0-9\-\.\$\/\+\%\s]*$/.test(codigo)) return 'CODE39';
    
    return 'UNKNOWN';
  }

  private limpiarBuffer(): void {
    this.bufferScan = '';
    if (this.timeoutScan) {
      clearTimeout(this.timeoutScan);
      this.timeoutScan = null;
    }
  }

  // Métodos para integración con componentes
  async escanearParaIngresos(): Promise<Observable<ScanResult>> {
    if (!this._conectado.value) {
      await this.conectarScanner();
    }

    return this.ultimoScan$.pipe(
      filter(scan => scan !== null),
      map(scan => scan!)
    );
  }

  async escanearParaLotes(): Promise<Observable<ScanResult>> {
    return this.escanearParaIngresos(); // Mismo comportamiento
  }

  // Configuración del scanner
  async configurarScanner(configuracion: Partial<ScannerConfig>): Promise<boolean> {
    try {
      const configActual = this._configuracion.value!;
      const nuevaConfig = { ...configActual, ...configuracion };
      
      this._configuracion.next(nuevaConfig);
      
      // Si está conectado, reconectar con nueva configuración
      if (this._conectado.value) {
        await this.desconectarScanner();
        return await this.conectarScanner();
      }
      
      return true;

    } catch (error) {
      this._error.next(`Error en configuración: ${error}`);
      return false;
    }
  }

  obtenerConfiguracion(): ScannerConfig | null {
    return this._configuracion.value;
  }

  // Utilidades para validación de códigos
  validarCodigoBarras(codigo: string): boolean {
    if (!codigo || codigo.length === 0) return false;
    
    // Validaciones básicas según tipo
    const tipo = this.detectarTipoCodigo(codigo);
    
    switch (tipo) {
      case 'EAN13':
        return this.validarEAN13(codigo);
      case 'EAN8':
        return this.validarEAN8(codigo);
      case 'UPC-A':
        return this.validarUPCA(codigo);
      default:
        return codigo.length > 0;
    }
  }

  private validarEAN13(codigo: string): boolean {
    if (!/^\d{13}$/.test(codigo)) return false;
    
    const digitos = codigo.split('').map(Number);
    const checkDigit = digitos.pop()!;
    
    let suma = 0;
    for (let i = 0; i < digitos.length; i++) {
      suma += digitos[i] * (i % 2 === 0 ? 1 : 3);
    }
    
    const calculado = (10 - (suma % 10)) % 10;
    return calculado === checkDigit;
  }

  private validarEAN8(codigo: string): boolean {
    if (!/^\d{8}$/.test(codigo)) return false;
    
    const digitos = codigo.split('').map(Number);
    const checkDigit = digitos.pop()!;
    
    let suma = 0;
    for (let i = 0; i < digitos.length; i++) {
      suma += digitos[i] * (i % 2 === 0 ? 3 : 1);
    }
    
    const calculado = (10 - (suma % 10)) % 10;
    return calculado === checkDigit;
  }

  private validarUPCA(codigo: string): boolean {
    if (!/^\d{12}$/.test(codigo)) return false;
    
    const digitos = codigo.split('').map(Number);
    const checkDigit = digitos.pop()!;
    
    let suma = 0;
    for (let i = 0; i < digitos.length; i++) {
      suma += digitos[i] * (i % 2 === 0 ? 3 : 1);
    }
    
    const calculado = (10 - (suma % 10)) % 10;
    return calculado === checkDigit;
  }
}