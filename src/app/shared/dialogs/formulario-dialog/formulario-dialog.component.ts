import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil, firstValueFrom } from 'rxjs';

import { BalanzaService, BalanzaReading } from '../../../services/balanza.service';
import { ScannerService, ScanResult } from '../../../services/scanner.service';

export interface CampoFormulario {
  key: string;
  label: string;
  tipo: 'text' | 'number' | 'select' | 'autocomplete' | 'textarea' | 'date' | 'checkbox-group';
  placeholder?: string;
  maxLength?: number;
  step?: number;
  min?: number;
  obligatorio?: boolean;
  ancho?: 'normal' | 'completo';
  opciones?: { value: any; label: string }[];
  disabled?: boolean;
  conPesado?: boolean;
  conScanner?: boolean;
  conBotonAgregar?: boolean; // Para mostrar botón de agregar nuevo
  onAgregar?: () => void; // Callback cuando se hace clic en agregar
}

export interface ConfiguracionFormulario {
  titulo: {
    agregar: string;
    editar: string;
  };
  entidad: string;
  entidadArticulo: string;
  esEdicion: boolean;
  filas: CampoFormulario[][];
  datosIniciales?: any;
}

@Component({
  selector: 'app-formulario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './formulario-dialog.component.html',
  styleUrls: ['./formulario-dialog.component.scss'],
})
export class FormularioDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  formulario!: FormGroup;
  config: ConfiguracionFormulario;
  
  // Estado para pesado
  pesandoActivo = false;
  pesoActual: BalanzaReading | null = null;
  
  // Estado para scanner
  escaneandoActivo = false;
  ultimoScan: ScanResult | null = null;
  
  // Estado para autocomplete
  opcionesFiltradas: { [key: string]: any[] } = {};

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FormularioDialogComponent>,
    private balanzaService: BalanzaService,
    private scannerService: ScannerService,
    @Inject(MAT_DIALOG_DATA) public data: ConfiguracionFormulario
  ) {
    this.config = data;
  }

  ngOnInit(): void {
    this.crearFormulario();
    if (this.config.datosIniciales) {
      this.formulario.patchValue(this.config.datosIniciales);
    }
    this.configurarSuscripciones();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private configurarSuscripciones(): void {
    console.log('🔔 [FORMULARIO] Configurando suscripciones...');
    
    // Suscribirse a cambios de peso
    this.balanzaService.pesoActual$
      .pipe(takeUntil(this.destroy$))
      .subscribe(peso => {
        if (peso) {
          console.log('📡 [FORMULARIO] Peso recibido:', peso);
        }
        this.pesoActual = peso;
      });

    // Suscribirse a scans
    this.scannerService.ultimoScan$
      .pipe(takeUntil(this.destroy$))
      .subscribe(scan => {
        if (scan && this.escaneandoActivo) {
          console.log('📡 [FORMULARIO] Scan recibido:', scan);
          this.ultimoScan = scan;
          this.aplicarScan(scan);
        }
      });

    // Inicializar opciones filtradas para autocomplete (vacías al inicio)
    this.config.filas.forEach(fila => {
      fila.forEach(campo => {
        if (campo.tipo === 'autocomplete' && campo.opciones) {
          this.opcionesFiltradas[campo.key] = [];
        }
      });
    });
  }

  private crearFormulario(): void {
    const controles: any = {};

    this.config.filas.forEach((fila) => {
      fila.forEach((campo) => {
        const validators = [];
        if (campo.obligatorio) {
          validators.push(Validators.required);
        }
        if (campo.maxLength) {
          validators.push(Validators.maxLength(campo.maxLength));
        }

        // Para checkbox-group, inicializar como array
        if (campo.tipo === 'checkbox-group') {
          const valorInicial = this.config.datosIniciales?.[campo.key] || [];
          controles[campo.key] = [valorInicial, validators];
        } else {
          controles[campo.key] = ['', validators];
        }
      });
    });

    this.formulario = this.fb.group(controles);
  }

  // Métodos para pesado
  async iniciarPesado(campo: string): Promise<void> {
    console.log('🎯 [FORMULARIO] Iniciando pesado para campo:', campo);
    
    try {
      this.pesandoActivo = true;
      const dispositivos = this.balanzaService.obtenerConfiguracion();
      console.log('📊 [FORMULARIO] Dispositivos disponibles:', dispositivos);
      
      const config = dispositivos[0]; // Usar primera balanza
      console.log('🔧 [FORMULARIO] Usando configuración:', config);
      
      const conectado = await firstValueFrom(this.balanzaService.conectado$);
      console.log('🔌 [FORMULARIO] Estado de conexión:', conectado);
      
      if (!conectado) {
        console.log('🔌 [FORMULARIO] Conectando balanza...');
        await this.balanzaService.conectarBalanza(config);
      }
      
      console.log('📡 [FORMULARIO] Iniciando lectura de peso...');
      await this.balanzaService.iniciarLecturaPeso(config);
      console.log('✅ [FORMULARIO] Lectura de peso iniciada exitosamente');
      
    } catch (error) {
      console.error('❌ [FORMULARIO] Error al iniciar pesado:', error);
      this.pesandoActivo = false;
    }
  }

  async capturarPeso(campo: string): Promise<void> {
    console.log('🎯 [FORMULARIO] Capturando peso para campo:', campo);
    console.log('📊 [FORMULARIO] Peso actual:', this.pesoActual);
    
    if (this.pesoActual && this.pesoActual.estable) {
      console.log('✅ [FORMULARIO] Peso estable detectado');
      
      // Convertir unidades si es necesario
      let pesoFinal = this.pesoActual.peso;
      const unidadOriginal = this.pesoActual.unidad;
      
      // Si el peso está en gramos y es mayor a 1000, convertir a kg
      if (this.pesoActual.unidad === 'g' && pesoFinal >= 1000) {
        console.log('🔄 [FORMULARIO] Convirtiendo de gramos a kilogramos');
        pesoFinal = pesoFinal / 1000;
      }
      
      console.log(`⚖️ [FORMULARIO] Aplicando peso: ${pesoFinal} (original: ${this.pesoActual.peso} ${unidadOriginal})`);
      
      // Aplicar peso al campo
      this.formulario.patchValue({
        [campo]: pesoFinal
      });
      
      console.log(`✅ [FORMULARIO] Peso aplicado al campo ${campo}: ${pesoFinal}`);
      
      // Detener pesado
      await this.detenerPesado();
    } else {
      console.warn('⚠️ [FORMULARIO] No hay peso estable disponible para capturar');
    }
  }

  async detenerPesado(): Promise<void> {
    try {
      await this.balanzaService.detenerLecturaPeso();
      this.pesandoActivo = false;
      this.pesoActual = null;
    } catch (error) {
      console.error('Error al detener pesado:', error);
    }
  }

  // Métodos para scanner
  async iniciarScanner(campo: string): Promise<void> {
    console.log('📦 [FORMULARIO] Iniciando scanner para campo:', campo);
    
    try {
      this.escaneandoActivo = true;
      
      const conectado = await firstValueFrom(this.scannerService.conectado$);
      console.log('🔌 [FORMULARIO] Estado de conexión del scanner:', conectado);
      
      if (!conectado) {
        console.log('🔌 [FORMULARIO] Conectando scanner...');
        await this.scannerService.conectarScanner();
      }
      
      console.log('✅ [FORMULARIO] Scanner listo y escuchando');
      // El scanner escuchará automáticamente
    } catch (error) {
      console.error('❌ [FORMULARIO] Error al iniciar scanner:', error);
      this.escaneandoActivo = false;
    }
  }

  private aplicarScan(scan: ScanResult): void {
    // Buscar campo activo para scanner
    const campoScanner = this.obtenerCampoActivo('scanner');
    if (campoScanner) {
      // Aplicar el código escaneado al campo
      this.formulario.patchValue({
        [campoScanner]: scan.codigo
      });
      
      console.log(`Código escaneado aplicado al campo ${campoScanner}:`, scan.codigo);
    }
    
    this.detenerScanner();
  }

  detenerScanner(): void {
    this.escaneandoActivo = false;
    this.ultimoScan = null;
  }

  private obtenerCampoActivo(tipo: 'pesado' | 'scanner'): string | null {
    for (const fila of this.config.filas) {
      for (const campo of fila) {
        if (tipo === 'pesado' && campo.conPesado) {
          return campo.key;
        }
        if (tipo === 'scanner' && campo.conScanner) {
          return campo.key;
        }
      }
    }
    return null;
  }

  // Método para filtrar opciones en autocomplete
  filtrarOpciones(campo: string, valor: string): void {
    const campoConfig = this.obtenerCampoConfig(campo);
    if (campoConfig && campoConfig.opciones) {
      if (!valor || valor.trim() === '') {
        this.opcionesFiltradas[campo] = [];
      } else {
        this.opcionesFiltradas[campo] = campoConfig.opciones.filter(opcion =>
          opcion.label.toLowerCase().includes(valor.toLowerCase())
        );
      }
    } else {
      this.opcionesFiltradas[campo] = [];
    }
  }

  private obtenerCampoConfig(key: string): CampoFormulario | null {
    for (const fila of this.config.filas) {
      for (const campo of fila) {
        if (campo.key === key) {
          return campo;
        }
      }
    }
    return null;
  }

  // Método para seleccionar una opción del autocomplete
  seleccionarOpcion(campo: string, opcion: any): void {
    this.formulario.patchValue({
      [campo]: opcion.label
    });
    this.opcionesFiltradas[campo] = [];
  }

  // Método para obtener las opciones filtradas de forma segura
  obtenerOpcionesFiltradas(campo: string): any[] {
    return this.opcionesFiltradas[campo] || [];
  }

  onSubmit(): void {
    if (this.formulario.valid) {
      this.dialogRef.close({
        accion: 'guardar',
        datos: this.formulario.value,
      });
    } else {
      this.marcarCamposComoTocados();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.formulario.controls).forEach((key) => {
      this.formulario.get(key)?.markAsTouched();
    });
  }

  onCheckboxChange(event: any, fieldKey: string): void {
    const value = event.target.value;
    const isChecked = event.target.checked;
    const currentValues = this.formulario.get(fieldKey)?.value || [];

    if (isChecked) {
      // Añadir valor si no existe
      if (!currentValues.includes(value)) {
        currentValues.push(value);
      }
    } else {
      // Remover valor si existe
      const index = currentValues.indexOf(value);
      if (index > -1) {
        currentValues.splice(index, 1);
      }
    }

    this.formulario.get(fieldKey)?.setValue([...currentValues]);
  }

  isCheckboxChecked(fieldKey: string, value: string): boolean {
    const currentValues = this.formulario.get(fieldKey)?.value || [];
    return currentValues.includes(value);
  }
}
