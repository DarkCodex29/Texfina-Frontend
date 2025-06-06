import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';

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
    umbral_stock_minimo: number;
    dias_alerta_vencimiento: number;
    metodo_valoracion: string;
    permitir_stock_negativo: boolean;
    alertas_automaticas: boolean;
    auditoria_movimientos: boolean;
  };
  seguridad: {
    tiempo_sesion: number;
    intentos_login: number;
    longitud_password: number;
    requiere_mayusculas: boolean;
    requiere_numeros: boolean;
    requiere_simbolos: boolean;
    doble_factor: boolean;
    log_accesos: boolean;
  };
  respaldos: {
    frecuencia: string;
    hora: string;
    dias_retencion: number;
    ruta: string;
    compresion: boolean;
    notificar_email: boolean;
  };
}

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  template: `<div>Configuración del Sistema - Módulo en desarrollo</div>`,
  styles: [
    `
      div {
        padding: 20px;
        text-align: center;
        font-size: 24px;
        color: #666;
      }
    `,
  ],
})
export class ConfiguracionComponent implements OnInit {
  configuracion: ConfiguracionSistema = {
    empresa: {
      nombre: 'Texfina S.A.',
      ruc: '20123456789',
      direccion: 'Av. Industrial 123, Lima, Perú',
      telefono: '+51 1 234-5678',
      email: 'contacto@texfina.com',
      sitio_web: 'https://www.texfina.com',
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
      umbral_stock_minimo: 20,
      dias_alerta_vencimiento: 30,
      metodo_valoracion: 'FIFO',
      permitir_stock_negativo: false,
      alertas_automaticas: true,
      auditoria_movimientos: true,
    },
    seguridad: {
      tiempo_sesion: 120,
      intentos_login: 5,
      longitud_password: 8,
      requiere_mayusculas: true,
      requiere_numeros: true,
      requiere_simbolos: false,
      doble_factor: false,
      log_accesos: true,
    },
    respaldos: {
      frecuencia: 'diario',
      hora: '02:00',
      dias_retencion: 30,
      ruta: '/backups/texfina',
      compresion: true,
      notificar_email: true,
    },
  };

  configuracionOriginal: ConfiguracionSistema = {} as ConfiguracionSistema;
  haycambios = false;
  guardandoConfig = false;
  tabActual = 0;
  hayChangios = false;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    // Simular carga desde API
    this.configuracionOriginal = JSON.parse(JSON.stringify(this.configuracion));
    console.log('Configuración cargada:', this.configuracion);
  }

  marcarCambios(): void {
    this.haycambios = this.hayCambiosPendientes();
    this.hayChangios = this.haycambios;
  }

  hayCambiosPendientes(): boolean {
    return (
      JSON.stringify(this.configuracion) !==
      JSON.stringify(this.configuracionOriginal)
    );
  }

  guardarConfiguracion(): void {
    if (!this.haycambios) {
      return;
    }

    this.guardandoConfig = true;

    // Simular guardado en API
    setTimeout(() => {
      this.configuracionOriginal = JSON.parse(
        JSON.stringify(this.configuracion)
      );
      this.haycambios = false;
      this.hayChangios = false;
      this.guardandoConfig = false;

      this.snackBar.open('Configuración guardada exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success'],
      });
    }, 2000);
  }

  crearRespaldoManual(): void {
    this.snackBar.open('Iniciando respaldo manual...', 'Cerrar', {
      duration: 3000,
      panelClass: ['snackbar-info'],
    });

    // Simular proceso de respaldo
    setTimeout(() => {
      this.snackBar.open('Respaldo creado exitosamente', 'Cerrar', {
        duration: 3000,
        panelClass: ['snackbar-success'],
      });
    }, 5000);
  }

  verHistorialRespaldos(): void {
    console.log('Ver historial de respaldos');
    this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', {
      duration: 2000,
    });
  }

  resetearTab(tabIndex: number): void {
    switch (tabIndex) {
      case 0: // General
        this.configuracion.empresa = { ...this.configuracionOriginal.empresa };
        this.configuracion.sistema = { ...this.configuracionOriginal.sistema };
        break;
      case 1: // Inventario
        this.configuracion.inventario = {
          ...this.configuracionOriginal.inventario,
        };
        break;
      case 2: // Seguridad
        this.configuracion.seguridad = {
          ...this.configuracionOriginal.seguridad,
        };
        break;
      case 3: // Respaldos
        this.configuracion.respaldos = {
          ...this.configuracionOriginal.respaldos,
        };
        break;
    }
    this.marcarCambios();
  }

  exportarConfiguracion(): void {
    const configJson = JSON.stringify(this.configuracion, null, 2);
    const blob = new Blob([configJson], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'configuracion-texfina.json';
    link.click();
    window.URL.revokeObjectURL(url);

    this.snackBar.open('Configuración exportada', 'Cerrar', {
      duration: 2000,
    });
  }

  importarConfiguracion(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          this.configuracion = { ...this.configuracion, ...config };
          this.marcarCambios();
          this.snackBar.open('Configuración importada', 'Cerrar', {
            duration: 2000,
            panelClass: ['snackbar-success'],
          });
        } catch (error) {
          this.snackBar.open('Error al importar configuración', 'Cerrar', {
            duration: 3000,
            panelClass: ['snackbar-error'],
          });
        }
      };
      reader.readAsText(file);
    }
  }
}
