import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';

export interface ConfiguracionSistema {
  empresa: {
    nombre: string;
    ruc: string;
    direccion: string;
    telefono: string;
    email: string;
    sitio_web: string;
  };
  sistema: {
    zona_horaria: string;
    idioma: string;
    formato_fecha: string;
    moneda: string;
    modo_oscuro: boolean;
    notificaciones_email: boolean;
  };
  inventario: {
    stock_minimo_defecto: number;
    stock_maximo_defecto: number;
    metodo_valorizacion: string;
    alerta_stock_bajo: boolean;
    seguimiento_lotes: boolean;
    control_fechas_vencimiento: boolean;
  };
  usuarios: {
    dias_expiracion_password: number;
    max_intentos_login: number;
    duracion_sesion_horas: number;
    autenticacion_doble_factor: boolean;
    bloqueo_automatico: boolean;
    historial_passwords: boolean;
  };
  auditoria: {
    dias_retencion_logs: number;
    nivel_log: string;
    auditoria_activa: boolean;
    log_cambios_datos: boolean;
    log_acceso_usuarios: boolean;
  };
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSnackBarModule,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.scss'],
})
export class ConfiguracionComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  configuracion: ConfiguracionSistema = {
    empresa: {
      nombre: 'Texfina Industries',
      ruc: '20123456789',
      direccion: 'Av. Textil 123, Lima, Perú',
      telefono: '+51 1 234-5678',
      email: 'info@texfina.com',
      sitio_web: 'www.texfina.com',
    },
    sistema: {
      zona_horaria: 'America/Lima',
      idioma: 'es',
      formato_fecha: 'DD/MM/YYYY',
      moneda: 'PEN',
      modo_oscuro: false,
      notificaciones_email: true,
    },
    inventario: {
      stock_minimo_defecto: 10,
      stock_maximo_defecto: 1000,
      metodo_valorizacion: 'FIFO',
      alerta_stock_bajo: true,
      seguimiento_lotes: true,
      control_fechas_vencimiento: true,
    },
    usuarios: {
      dias_expiracion_password: 90,
      max_intentos_login: 3,
      duracion_sesion_horas: 8,
      autenticacion_doble_factor: false,
      bloqueo_automatico: true,
      historial_passwords: true,
    },
    auditoria: {
      dias_retencion_logs: 365,
      nivel_log: 'INFO',
      auditoria_activa: true,
      log_cambios_datos: true,
      log_acceso_usuarios: true,
    },
  };

  configuracionOriginal: ConfiguracionSistema = {} as ConfiguracionSistema;
  hayCambios = false;
  guardandoConfig = false;
  tabActual = 0;
  dropdownExportAbierto = false;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarConfiguracion(): void {
    this.configuracionOriginal = JSON.parse(JSON.stringify(this.configuracion));
  }

  marcarCambios(): void {
    this.hayCambios = true;
  }

  hayCambiosPendientes(): boolean {
    return (
      JSON.stringify(this.configuracion) !==
      JSON.stringify(this.configuracionOriginal)
    );
  }

  guardarConfiguracion(): void {
    this.guardandoConfig = true;

    setTimeout(() => {
      this.guardandoConfig = false;
      this.hayCambios = false;
      this.configuracionOriginal = JSON.parse(
        JSON.stringify(this.configuracion)
      );

      this.snackBar.open('Configuración guardada exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-success'],
      });
    }, 2000);
  }

  resetearTab(tabIndex: number): void {
    switch (tabIndex) {
      case 0:
        this.configuracion.empresa = { ...this.configuracionOriginal.empresa };
        this.configuracion.sistema = { ...this.configuracionOriginal.sistema };
        break;
      case 1:
        this.configuracion.inventario = {
          ...this.configuracionOriginal.inventario,
        };
        break;
      case 2:
        this.configuracion.usuarios = {
          ...this.configuracionOriginal.usuarios,
        };
        break;
      case 3:
        this.configuracion.auditoria = {
          ...this.configuracionOriginal.auditoria,
        };
        break;
    }
    this.hayCambios = false;
  }

  private configurarExportacion(): ConfiguracionExportacion<any> {
    return {
      entidades: [this.configuracion],
      nombreArchivo: 'configuracion-sistema',
      nombreEntidad: 'Configuración del Sistema',
      columnas: [
        { campo: 'empresa.nombre', titulo: 'Empresa', formato: 'texto' },
        {
          campo: 'sistema.zona_horaria',
          titulo: 'Zona Horaria',
          formato: 'texto',
        },
        {
          campo: 'inventario.metodo_valorizacion',
          titulo: 'Método Valorización',
          formato: 'texto',
        },
        {
          campo: 'usuarios.max_intentos_login',
          titulo: 'Max Intentos Login',
          formato: 'numero',
        },
        { campo: 'auditoria.nivel_log', titulo: 'Nivel Log', formato: 'texto' },
      ],
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: 1,
        cantidadFiltrada: 1,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<any> {
    return {
      tipoEntidad: 'configuracion',
      mapeoColumnas: [
        {
          columnaArchivo: 'Empresa',
          campoEntidad: 'empresa.nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Zona Horaria',
          campoEntidad: 'sistema.zona_horaria',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'empresa.nombre',
          validador: (valor) => valor && valor.length <= 200,
          mensajeError:
            'El nombre de la empresa debe tener máximo 200 caracteres',
        },
      ],
    };
  }

  cargaMasiva(): void {
    const dialogRef = this.dialog.open(CargaMasivaDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        configuracion: this.configurarCargaMasiva(),
        onDescargarPlantilla: () => this.descargarPlantillaCargaMasiva(),
        onProcesarArchivo: (archivo: File) =>
          this.procesarArchivoCargaMasiva(archivo),
      },
    });
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  exportarExcel(): void {
    try {
      const config = this.configurarExportacion();
      this.exportacionService.exportarExcel(config);
      this.dropdownExportAbierto = false;
    } catch (error) {
      console.error('Error al exportar Excel:', error);
    }
  }

  exportarPDF(): void {
    try {
      const config = this.configurarExportacion();
      this.exportacionService.exportarPDF(config);
      this.dropdownExportAbierto = false;
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  }

  private descargarPlantillaCargaMasiva(): void {
    const config = this.configurarCargaMasiva();
    this.cargaMasivaService.generarPlantilla(config);
  }

  private procesarArchivoCargaMasiva(archivo: File): void {
    const config = this.configurarCargaMasiva();
    this.cargaMasivaService
      .procesarArchivo(archivo, config)
      .then((resultado) => {
        console.log('Archivo procesado:', resultado);
        if (resultado.exitosa) {
          this.cargarConfiguracion();
        }
      })
      .catch((error) => {
        console.error('Error procesando archivo:', error);
      });
  }
}
