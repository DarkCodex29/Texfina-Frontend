import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { MaterialService } from '../services/material.service';
import { Usuario, Rol, TipoUsuario } from '../models/insumo.model';
import { DetalleUsuarioDialog } from './detalle-usuario-dialog/detalle-usuario-dialog';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
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
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  tiposUsuario: TipoUsuario[] = [];
  filtrosForm: FormGroup;

  displayedColumns: string[] = [
    'codigo',
    'username',
    'email',
    'rol',
    'tipo',
    'estado',
    'ultimo_ingreso',
    'acciones',
  ];

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialog: MatDialog
  ) {
    this.filtrosForm = this.fb.group({
      username: [''],
      email: [''],
      rol: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    // Cargar usuarios
    this.materialService.getUsuarios().subscribe((usuarios) => {
      this.usuarios = usuarios;
    });

    // Cargar roles para el select
    this.materialService.getRoles().subscribe((roles) => {
      this.roles = roles;
    });

    // Cargar tipos de usuario
    this.materialService.getTiposUsuario().subscribe((tipos) => {
      this.tiposUsuario = tipos;
    });
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00000';
    return id.toString().padStart(5, '0');
  }

  obtenerNombreRol(idRol?: string): string {
    if (!idRol) return '-';
    const rol = this.roles.find((r) => r.id_rol === idRol);
    return rol ? rol.nombre : idRol;
  }

  obtenerNombreTipo(idTipo?: number): string {
    if (!idTipo) return '-';
    const tipo = this.tiposUsuario.find((t) => t.id_tipo_usuario === idTipo);
    return tipo ? tipo.descripcion : '-';
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';

    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);

    if (isNaN(fechaObj.getTime())) return '-';

    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;

    this.materialService
      .buscarUsuarios(filtros)
      .subscribe((usuarios: Usuario[]) => {
        this.usuarios = usuarios;
      });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.cargarDatos();
  }

  abrirNuevoUsuario(): void {
    // TODO: Implementar modal de nuevo usuario
    console.log('Abrir modal nuevo usuario');
  }

  verDetalle(usuario: Usuario): void {
    const dialogRef = this.dialog.open(DetalleUsuarioDialog, {
      width: '600px',
      data: {
        usuario: usuario,
        roles: this.roles,
        tiposUsuario: this.tiposUsuario,
      },
    });
  }

  editarUsuario(usuario: Usuario): void {
    // TODO: Implementar modal de edición
    console.log('Editar usuario:', usuario);
  }
}
