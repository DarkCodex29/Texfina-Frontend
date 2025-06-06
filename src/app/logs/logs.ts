import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatSortModule } from '@angular/material/sort';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { LogEvento, Usuario } from '../models/insumo.model';
import { MaterialService } from '../services/material.service';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatChipsModule,
    MatSortModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './logs.html',
  styleUrls: ['./logs.scss'],
})
export class LogsComponent implements OnInit {
  logs: LogEvento[] = [];
  usuarios: Usuario[] = [];
  filtrosForm: FormGroup;

  displayedColumns: string[] = [
    'timestamp',
    'usuario',
    'accion',
    'modulo',
    'tabla_afectada',
    'descripcion',
    'ip_origen',
    'acciones',
  ];

  // Opciones para filtros
  modulosDisponibles: string[] = [
    'USUARIOS',
    'INSUMOS',
    'PROVEEDORES',
    'LOTES',
    'ALMACENES',
    'CLASES',
    'UNIDADES',
    'STOCK',
    'INGRESOS',
    'CONSUMOS',
    'RECETAS',
    'SESIONES',
    'CONFIGURACION',
  ];

  accionesDisponibles: string[] = [
    'LOGIN',
    'LOGOUT',
    'CREAR',
    'EDITAR',
    'ELIMINAR',
    'CONSULTAR',
    'EXPORTAR',
    'IMPORTAR',
    'CONFIGURAR',
    'BACKUP',
    'RESTORE',
  ];

  constructor(
    private materialService: MaterialService,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      usuario: [''],
      modulo: [''],
      accion: [''],
      tabla_afectada: [''],
      ip_origen: [''],
      fecha_desde: [''],
      fecha_hasta: [''],
      descripcion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar logs y usuarios en paralelo
    this.materialService.getLogs().subscribe((logs) => {
      this.logs = logs;
    });

    this.materialService.getUsuarios().subscribe((usuarios) => {
      this.usuarios = usuarios;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    this.materialService.buscarLogs(filtros).subscribe((logs) => {
      this.logs = logs;
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.cargarDatos();
  }

  exportarLogs(): void {
    // TODO: Implementar exportación de logs
    console.log('Exportar logs con filtros:', this.filtrosForm.value);
  }

  verDetalleLogs(log: LogEvento): void {
    // TODO: Implementar modal de detalle
    console.log('Ver detalle de log:', log);
  }

  getNombreUsuario(id_usuario?: number): string {
    if (!id_usuario) return 'Sistema';
    const usuario = this.usuarios.find((u) => u.id_usuario === id_usuario);
    return usuario ? usuario.username : `Usuario #${id_usuario}`;
  }

  getColorAccion(accion?: string): string {
    switch (accion?.toUpperCase()) {
      case 'LOGIN':
      case 'CONSULTAR':
        return 'success';
      case 'CREAR':
        return 'primary';
      case 'EDITAR':
        return 'accent';
      case 'ELIMINAR':
        return 'warn';
      case 'LOGOUT':
      case 'ERROR':
        return 'warn';
      default:
        return 'default';
    }
  }

  getIconoAccion(accion?: string): string {
    switch (accion?.toUpperCase()) {
      case 'LOGIN':
        return 'login';
      case 'LOGOUT':
        return 'logout';
      case 'CREAR':
        return 'add_circle';
      case 'EDITAR':
        return 'edit';
      case 'ELIMINAR':
        return 'delete';
      case 'CONSULTAR':
        return 'visibility';
      case 'EXPORTAR':
        return 'download';
      case 'IMPORTAR':
        return 'upload';
      case 'CONFIGURAR':
        return 'settings';
      case 'BACKUP':
        return 'backup';
      case 'RESTORE':
        return 'restore';
      default:
        return 'info';
    }
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    const fechaObj = new Date(fecha);
    return fechaObj.toLocaleString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getNivelSeveridad(accion?: string): 'low' | 'medium' | 'high' | 'critical' {
    switch (accion?.toUpperCase()) {
      case 'ELIMINAR':
      case 'RESTORE':
        return 'critical';
      case 'EDITAR':
      case 'CONFIGURAR':
      case 'BACKUP':
        return 'high';
      case 'CREAR':
      case 'IMPORTAR':
      case 'EXPORTAR':
        return 'medium';
      case 'LOGIN':
      case 'LOGOUT':
      case 'CONSULTAR':
        return 'low';
      default:
        return 'medium';
    }
  }
}
