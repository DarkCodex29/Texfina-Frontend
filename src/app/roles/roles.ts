import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

interface Rol {
  id_rol: string;
  descripcion: string;
  activo: boolean;
}

interface Permiso {
  id_permiso: number;
  nombre: string;
  descripcion: string;
  modulo: string;
  activo: boolean;
}

interface Usuario {
  id_usuario: number;
  username: string;
  id_rol: string;
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
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent {
  // Configuración de la tabla
  displayedColumns: string[] = [
    'codigo',
    'rol',
    'usuarios',
    'permisos',
    'estado',
    'acciones',
  ];

  // Datos
  roles: Rol[] = [
    {
      id_rol: 'ADMIN',
      descripcion: 'Administrador del sistema con acceso completo',
      activo: true,
    },
    {
      id_rol: 'SUPERVISOR',
      descripcion: 'Supervisor de operaciones con permisos avanzados',
      activo: true,
    },
    {
      id_rol: 'OPERARIO',
      descripcion: 'Operario con permisos básicos de gestión',
      activo: true,
    },
    {
      id_rol: 'CONSULTOR',
      descripcion: 'Consultor con permisos de solo lectura',
      activo: false,
    },
  ];

  permisos: Permiso[] = [
    {
      id_permiso: 1,
      nombre: 'CREAR_USUARIO',
      descripcion: 'Crear nuevos usuarios',
      modulo: 'Usuarios',
      activo: true,
    },
    {
      id_permiso: 2,
      nombre: 'EDITAR_USUARIO',
      descripcion: 'Editar usuarios existentes',
      modulo: 'Usuarios',
      activo: true,
    },
    {
      id_permiso: 3,
      nombre: 'ELIMINAR_USUARIO',
      descripcion: 'Eliminar usuarios',
      modulo: 'Usuarios',
      activo: true,
    },
    {
      id_permiso: 4,
      nombre: 'VER_INSUMOS',
      descripcion: 'Visualizar insumos',
      modulo: 'Insumos',
      activo: true,
    },
    {
      id_permiso: 5,
      nombre: 'CREAR_INSUMO',
      descripcion: 'Crear nuevos insumos',
      modulo: 'Insumos',
      activo: true,
    },
    {
      id_permiso: 6,
      nombre: 'EDITAR_INSUMO',
      descripcion: 'Editar insumos existentes',
      modulo: 'Insumos',
      activo: true,
    },
    {
      id_permiso: 7,
      nombre: 'VER_REPORTES',
      descripcion: 'Acceder a reportes',
      modulo: 'Reportes',
      activo: true,
    },
    {
      id_permiso: 8,
      nombre: 'CONFIGURAR_SISTEMA',
      descripcion: 'Configurar el sistema',
      modulo: 'Configuración',
      activo: true,
    },
  ];

  usuarios: Usuario[] = [
    { id_usuario: 1, username: 'admin', id_rol: 'ADMIN' },
    { id_usuario: 2, username: 'supervisor1', id_rol: 'SUPERVISOR' },
    { id_usuario: 3, username: 'operario1', id_rol: 'OPERARIO' },
    { id_usuario: 4, username: 'operario2', id_rol: 'OPERARIO' },
    { id_usuario: 5, username: 'consultor1', id_rol: 'CONSULTOR' },
  ];

  // Filtros
  filtros = {
    rol: '',
    tipo: '',
    activo: '',
  };

  // Estadísticas calculadas
  get totalRoles(): number {
    return this.roles.length;
  }

  get totalPermisos(): number {
    return this.permisos.length;
  }

  get usuariosConRol(): number {
    return this.usuarios.length;
  }

  get rolesActivos(): number {
    return this.roles.filter((r) => r.activo).length;
  }

  // Métodos de filtrado
  buscar(): void {
    console.log('Buscando roles con filtros:', this.filtros);
    // Aquí iría la lógica de filtrado
  }

  limpiarFiltros(): void {
    this.filtros = {
      rol: '',
      tipo: '',
      activo: '',
    };
    console.log('Filtros limpiados');
  }

  // Métodos de utilidad
  contarUsuariosPorRol(rolId: string): number {
    return this.usuarios.filter((u) => u.id_rol === rolId).length;
  }

  obtenerPermisosPorRol(rolId: string): Permiso[] {
    // Mock: devolvemos permisos según el rol
    switch (rolId) {
      case 'ADMIN':
        return this.permisos;
      case 'SUPERVISOR':
        return this.permisos.filter(
          (p) =>
            !p.nombre.includes('ELIMINAR') && !p.nombre.includes('CONFIGURAR')
        );
      case 'OPERARIO':
        return this.permisos.filter(
          (p) =>
            p.nombre.includes('VER') ||
            p.nombre.includes('CREAR') ||
            p.nombre.includes('EDITAR')
        );
      case 'CONSULTOR':
        return this.permisos.filter((p) => p.nombre.includes('VER'));
      default:
        return [];
    }
  }

  // Métodos de diálogos
  abrirDialogoCrear(): void {
    console.log('Abriendo diálogo para crear rol');
  }

  abrirDialogoDetalle(rol: Rol): void {
    console.log('Abriendo detalle de rol:', rol);
  }

  abrirDialogoEditar(rol: Rol): void {
    console.log('Abriendo diálogo para editar rol:', rol);
  }

  abrirDialogoPermisos(rol: Rol): void {
    console.log('Abriendo gestión de permisos para rol:', rol);
  }
}
