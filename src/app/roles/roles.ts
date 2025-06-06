import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MaterialService } from '../services/material.service';

export interface Rol {
  id_rol: string;
  descripcion: string;
  activo: boolean;
}

export interface Permiso {
  id_permiso: number;
  nombre: string;
  descripcion: string;
}

export interface RolPermiso {
  id_rol: string;
  id_permiso: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
  ],
  template: `<div>Roles y Permisos - Módulo en desarrollo</div>`,
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
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  permisos: Permiso[] = [];
  usuarios: any[] = [];
  rolesTodos: Rol[] = [];

  filtros = {
    rol: '',
    tipo: '',
    activo: '',
  };

  columnasTabla = ['rol', 'usuarios', 'permisos', 'estado', 'acciones'];

  // Estadísticas
  totalRoles = 0;
  totalPermisos = 0;
  usuariosConRol = 0;
  rolesActivos = 0;

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar roles
    this.materialService.getRoles().subscribe((roles: any) => {
      this.roles = roles;
      this.rolesTodos = [...roles];
      this.calcularEstadisticas();
    });

    // Cargar permisos
    this.materialService.getPermisos().subscribe((permisos: any) => {
      this.permisos = permisos;
      this.totalPermisos = permisos.length;
    });

    // Cargar usuarios
    this.materialService.getUsuarios().subscribe((usuarios: any) => {
      this.usuarios = usuarios;
      this.calcularEstadisticas();
    });
  }

  buscar(): void {
    let rolesFiltrados = [...this.rolesTodos];

    if (this.filtros.rol) {
      rolesFiltrados = rolesFiltrados.filter(
        (r) =>
          r.id_rol.toLowerCase().includes(this.filtros.rol.toLowerCase()) ||
          r.descripcion.toLowerCase().includes(this.filtros.rol.toLowerCase())
      );
    }

    if (this.filtros.tipo) {
      rolesFiltrados = rolesFiltrados.filter(
        (r) => r.id_rol === this.filtros.tipo
      );
    }

    if (this.filtros.activo !== '') {
      const activo = this.filtros.activo === 'true';
      rolesFiltrados = rolesFiltrados.filter((r) => r.activo === activo);
    }

    this.roles = rolesFiltrados;
  }

  limpiarFiltros(): void {
    this.filtros = {
      rol: '',
      tipo: '',
      activo: '',
    };
    this.roles = [...this.rolesTodos];
  }

  contarUsuariosPorRol(idRol: string): number {
    return this.usuarios.filter((u) => u.id_rol === idRol).length;
  }

  obtenerPermisosPorRol(idRol: string): Permiso[] {
    // Mock data para permisos por rol
    const permisosPorRol: { [key: string]: number[] } = {
      ADMIN: [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
        21, 22, 23, 24,
      ],
      SUPERVISOR: [4, 8, 9, 10, 11, 16, 20, 24],
      OPERARIO: [4, 8, 9, 20],
      CONSULTOR: [4, 8, 9, 16, 20, 24],
    };

    const permisosIds = permisosPorRol[idRol] || [];
    return this.permisos.filter((p) => permisosIds.includes(p.id_permiso));
  }

  calcularEstadisticas(): void {
    this.totalRoles = this.rolesTodos.length;
    this.rolesActivos = this.rolesTodos.filter((r) => r.activo).length;
    this.usuariosConRol = this.usuarios.filter((u) => u.id_rol).length;
  }

  abrirDialogoCrear(): void {
    console.log('Abrir diálogo crear rol');
    // TODO: Implementar diálogo de crear rol
  }

  abrirDialogoDetalle(rol: Rol): void {
    console.log('Abrir diálogo detalle rol:', rol);
    // TODO: Implementar diálogo de detalle rol
  }

  abrirDialogoEditar(rol: Rol): void {
    console.log('Abrir diálogo editar rol:', rol);
    // TODO: Implementar diálogo de editar rol
  }

  abrirDialogoPermisos(rol: Rol): void {
    console.log('Abrir diálogo permisos rol:', rol);
    // TODO: Implementar diálogo de gestión de permisos
  }
}
