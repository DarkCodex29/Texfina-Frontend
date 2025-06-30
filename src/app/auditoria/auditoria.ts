import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';

interface RegistroAuditoria {
  id_auditoria: number;
  usuario: string;
  accion: string;
  tabla: string;
  registro_id: string;
  datos_anteriores?: string;
  datos_nuevos?: string;
  fecha: Date;
  ip_address?: string;
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class AuditoriaComponent implements OnInit {
  registros: RegistroAuditoria[] = [];
  dataSource = new MatTableDataSource<RegistroAuditoria>([]);
  displayedColumns: string[] = [
    'id_auditoria',
    'usuario',
    'accion',
    'tabla',
    'registro_id',
    'fecha',
    'acciones',
  ];

  filtroGeneralForm: FormGroup;
  cargando = false;
  error: string | null = null;
  dropdownExportAbierto = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private exportacionService: ExportacionService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    this.error = null;

    const datosSimulados: RegistroAuditoria[] = [
      {
        id_auditoria: 1,
        usuario: 'admin',
        accion: 'CREATE',
        tabla: 'USUARIO',
        registro_id: 'USR001',
        fecha: new Date('2024-01-15T10:30:00'),
        ip_address: '192.168.1.100',
      },
      {
        id_auditoria: 2,
        usuario: 'supervisor01',
        accion: 'UPDATE',
        tabla: 'INSUMO',
        registro_id: 'INS001',
        fecha: new Date('2024-01-15T09:15:00'),
        ip_address: '192.168.1.101',
      },
      {
        id_auditoria: 3,
        usuario: 'operario01',
        accion: 'DELETE',
        tabla: 'LOTE',
        registro_id: 'LOT001',
        fecha: new Date('2024-01-14T16:45:00'),
        ip_address: '192.168.1.102',
      },
    ];

    setTimeout(() => {
      this.registros = datosSimulados;
      this.dataSource.data = this.registros;
      this.cargando = false;
    }, 1000);
  }

  aplicarFiltroGeneral(): void {
    const filtro =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';

    if (!filtro.trim()) {
      this.dataSource.data = this.registros;
      return;
    }

    this.dataSource.data = this.registros.filter(
      (registro) =>
        registro.usuario.toLowerCase().includes(filtro) ||
        registro.accion.toLowerCase().includes(filtro) ||
        registro.tabla.toLowerCase().includes(filtro) ||
        registro.registro_id.toLowerCase().includes(filtro)
    );
  }

  limpiarFiltros(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = this.registros;
  }

  private configurarExportacion(): ConfiguracionExportacion<RegistroAuditoria> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'auditoria',
      nombreEntidad: 'Registros de Auditoría',
      columnas: [
        { campo: 'id_auditoria', titulo: 'ID', formato: 'numero' },
        { campo: 'usuario', titulo: 'Usuario', formato: 'texto' },
        { campo: 'accion', titulo: 'Acción', formato: 'texto' },
        { campo: 'tabla', titulo: 'Tabla', formato: 'texto' },
        { campo: 'registro_id', titulo: 'Registro ID', formato: 'texto' },
        { campo: 'fecha', titulo: 'Fecha', formato: 'fecha' },
        { campo: 'ip_address', titulo: 'IP Address', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.registros.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private obtenerFiltrosActivos(): { [key: string]: any } {
    const filtros: { [key: string]: any } = {};
    const busquedaGeneral =
      this.filtroGeneralForm.get('busquedaGeneral')?.value;

    if (busquedaGeneral) {
      filtros['busquedaGeneral'] = busquedaGeneral;
    }

    return filtros;
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

  verDetalle(registro: RegistroAuditoria): void {
    console.log('Ver detalle de registro de auditoría:', registro);
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearAccion(accion?: string): string {
    if (!accion) return '-';
    const acciones: { [key: string]: string } = {
      CREATE: 'Crear',
      UPDATE: 'Actualizar',
      DELETE: 'Eliminar',
      LOGIN: 'Iniciar Sesión',
      LOGOUT: 'Cerrar Sesión',
    };
    return acciones[accion.toUpperCase()] || accion;
  }

  obtenerTipoAccion(accion?: string): string {
    if (!accion) return 'neutral';
    switch (accion.toUpperCase()) {
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'warning';
      case 'DELETE':
        return 'danger';
      case 'LOGIN':
        return 'info';
      case 'LOGOUT':
        return 'info';
      default:
        return 'neutral';
    }
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
