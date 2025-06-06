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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
    MatSnackBarModule,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['./configuracion.scss'],
})
export class ConfiguracionComponent implements OnInit {
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
      umbral_stock_minimo: 20,
      dias_alerta_vencimiento: 30,
      metodo_valoracion: 'FIFO',
      permitir_stock_negativo: false,
      alertas_automaticas: true,
      auditoria_movimientos: true,
    },
    seguridad: {
      tiempo_sesion: 480,
      intentos_login: 3,
      longitud_password: 8,
      requiere_mayusculas: true,
      requiere_numeros: true,
      requiere_simbolos: false,
      doble_factor: false,
      log_accesos: true,
    },
    respaldos: {
      frecuencia: 'DIARIO',
      hora: '02:00',
      dias_retencion: 30,
      ruta: '/backup/texfina',
      compresion: true,
      notificar_email: true,
    },
  };

  configuracionOriginal: ConfiguracionSistema = {} as ConfiguracionSistema;
  hayCambios = false;
  guardandoConfig = false;
  tabActual = 0;

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.cargarConfiguracion();
  }

  cargarConfiguracion(): void {
    // Simular carga de configuración
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

    // Simular guardado
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

  crearRespaldoManual(): void {
    this.snackBar.open('Creando respaldo manual...', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });

    setTimeout(() => {
      this.snackBar.open('Respaldo creado exitosamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-success'],
      });
    }, 2000);
  }

  verHistorialRespaldos(): void {
    this.snackBar.open('Abriendo historial de respaldos...', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
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
    this.hayCambios = this.hayCambiosPendientes();
  }

  exportarConfiguracion(): void {
    const dataStr = JSON.stringify(this.configuracion, null, 2);
    const dataUri =
      'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'configuracion-texfina.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    this.snackBar.open('Configuración exportada exitosamente', 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: ['snackbar-success'],
    });
  }

  importarConfiguracion(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const importedConfig = JSON.parse(e.target.result);
          this.configuracion = { ...this.configuracion, ...importedConfig };
          this.hayCambios = true;

          this.snackBar.open('Configuración importada exitosamente', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-success'],
          });
        } catch (error) {
          this.snackBar.open('Error al importar la configuración', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['snackbar-error'],
          });
        }
      };
      reader.readAsText(file);
    }
  }
}
