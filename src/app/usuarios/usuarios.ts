import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSortModule } from '@angular/material/sort';

import { MaterialService } from '../services/material.service';
import {
  ExportacionService,
  ConfiguracionExportacion,
  ColumnaExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
  MapeoColumna,
} from '../services/carga-masiva.service';
import { Usuario, Rol, TipoUsuario } from '../models/insumo.model';
import { DetalleUsuarioDialogComponent } from './detalle-usuario-dialog/detalle-usuario-dialog';
import { EditarUsuarioDialogComponent } from './editar-usuario-dialog/editar-usuario-dialog';
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';

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
    MatSortModule,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  tiposUsuario: TipoUsuario[] = [];
  dataSource = new MatTableDataSource<Usuario>([]);

  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  dropdownExportAbierto = false;

  hasError = false;
  errorMessage = '';
  isEmpty = false;
  isFilteredEmpty = false;

  displayedColumns: string[] = [
    'id_usuario',
    'username',
    'email',
    'id_rol',
    'id_tipo_usuario',
    'activo',
    'last_login',
    'acciones',
  ];

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      idUsuario: [''],
      username: [''],
      email: [''],
      idRol: [''],
      idTipoUsuario: [''],
      activo: [''],
      fechaDesde: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarFiltros();
  }

  cargarDatos(): void {
    this.hasError = false;
    this.materialService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.dataSource.data = usuarios;
        this.isEmpty = usuarios.length === 0;
        this.isFilteredEmpty = false;
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = 'Error al cargar los usuarios. Intente nuevamente.';
        console.error('Error al cargar usuarios:', error);
      },
    });

    this.materialService.getRoles().subscribe((roles) => {
      this.roles = roles;
    });

    this.materialService.getTiposUsuario().subscribe((tipos) => {
      this.tiposUsuario = tipos;
    });
  }

  configurarFiltros(): void {
    this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.valueChanges.subscribe((valor) => {
        this.aplicarFiltroGeneral(valor);
      });

    this.filtrosColumnaForm.valueChanges.subscribe(() => {
      this.aplicarFiltrosColumna();
    });
  }

  aplicarFiltroGeneral(busqueda: string): void {
    if (!busqueda) {
      this.dataSource.data = this.usuarios;
      this.isFilteredEmpty = false;
      return;
    }

    const filtrados = this.usuarios.filter(
      (usuario) =>
        usuario.id_usuario?.toString().includes(busqueda.toLowerCase()) ||
        usuario.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email?.toLowerCase().includes(busqueda.toLowerCase())
    );

    this.dataSource.data = filtrados;
    this.isFilteredEmpty = filtrados.length === 0 && this.usuarios.length > 0;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let filtrados = this.usuarios;

    if (filtros.idUsuario) {
      filtrados = filtrados.filter((u) =>
        u.id_usuario?.toString().includes(filtros.idUsuario)
      );
    }
    if (filtros.username) {
      filtrados = filtrados.filter((u) =>
        u.username?.toLowerCase().includes(filtros.username.toLowerCase())
      );
    }
    if (filtros.email) {
      filtrados = filtrados.filter((u) =>
        u.email?.toLowerCase().includes(filtros.email.toLowerCase())
      );
    }
    if (filtros.idRol) {
      filtrados = filtrados.filter((u) => u.id_rol === filtros.idRol);
    }
    if (filtros.idTipoUsuario) {
      filtrados = filtrados.filter(
        (u) => u.id_tipo_usuario === parseInt(filtros.idTipoUsuario)
      );
    }
    if (filtros.activo !== '') {
      filtrados = filtrados.filter(
        (u) => u.activo === (filtros.activo === 'true')
      );
    }

    this.dataSource.data = filtrados;
    this.isFilteredEmpty = filtrados.length === 0 && this.usuarios.length > 0;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = this.usuarios;
    this.isFilteredEmpty = false;
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.aplicarFiltrosColumna();
  }

  sortData(column: string): void {
    console.log('Ordenar por:', column);
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
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

  obtenerFiltrosActivos(): string[] {
    const filtros: string[] = [];
    const general = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    const columna = this.filtrosColumnaForm.value;

    if (general) filtros.push(`Búsqueda: "${general}"`);
    if (columna.idUsuario) filtros.push(`ID: ${columna.idUsuario}`);
    if (columna.username) filtros.push(`Usuario: ${columna.username}`);
    if (columna.email) filtros.push(`Email: ${columna.email}`);
    if (columna.idRol)
      filtros.push(`Rol: ${this.obtenerNombreRol(columna.idRol)}`);
    if (columna.idTipoUsuario)
      filtros.push(`Tipo: ${this.obtenerNombreTipo(columna.idTipoUsuario)}`);
    if (columna.activo !== '')
      filtros.push(
        `Estado: ${columna.activo === 'true' ? 'Activo' : 'Inactivo'}`
      );

    return filtros;
  }

  private configurarExportacion(): ConfiguracionExportacion<Usuario> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'usuarios',
      nombreEntidad: 'Usuarios',
      columnas: [
        { campo: 'id_usuario', titulo: 'ID', formato: 'numero' },
        { campo: 'username', titulo: 'Usuario', formato: 'texto' },
        { campo: 'email', titulo: 'Email', formato: 'texto' },
        { campo: 'id_rol', titulo: 'Rol', formato: 'texto' },
        { campo: 'id_tipo_usuario', titulo: 'Tipo Usuario', formato: 'numero' },
        { campo: 'activo', titulo: 'Activo', formato: 'texto' },
        { campo: 'created_at', titulo: 'Fecha Creación', formato: 'fecha' },
        { campo: 'last_login', titulo: 'Último Acceso', formato: 'fecha' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.usuarios.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Usuario> {
    return {
      tipoEntidad: 'usuarios',
      mapeoColumnas: [
        {
          columnaArchivo: 'Usuario',
          campoEntidad: 'username',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Email',
          campoEntidad: 'email',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Rol',
          campoEntidad: 'id_rol',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Tipo Usuario',
          campoEntidad: 'id_tipo_usuario',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Activo',
          campoEntidad: 'activo',
          obligatorio: true,
          tipoEsperado: 'booleano',
        },
      ],
      validaciones: [
        {
          campo: 'username',
          validador: (valor) => valor && valor.length <= 50,
          mensajeError: 'El usuario debe tener máximo 50 caracteres',
        },
        {
          campo: 'email',
          validador: (valor) => !valor || valor.length <= 100,
          mensajeError: 'El email debe tener máximo 100 caracteres',
        },
      ],
    };
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

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  private descargarPlantillaCargaMasiva(): void {
    const config = this.configurarCargaMasiva();
    console.log('Descargar plantilla - Funcionalidad en desarrollo');
  }

  private procesarArchivoCargaMasiva(archivo: File): void {
    const config = this.configurarCargaMasiva();
    console.log('Procesar archivo - Funcionalidad en desarrollo');
  }

  agregar(): void {
    const dialogRef = this.dialog.open(EditarUsuarioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        esEdicion: false,
        titulo: 'Agregar Usuario',
        roles: this.roles,
        tiposUsuario: this.tiposUsuario,
      },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  editar(usuario: Usuario): void {
    const dialogRef = this.dialog.open(EditarUsuarioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        esEdicion: true,
        usuario: usuario,
        titulo: 'Editar Usuario',
        roles: this.roles,
        tiposUsuario: this.tiposUsuario,
      },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarDatos();
      }
    });
  }

  verDetalle(usuario: Usuario): void {
    this.dialog.open(DetalleUsuarioDialogComponent, {
      width: '800px',
      disableClose: true,
      data: {
        usuario: usuario,
        roles: this.roles,
        tiposUsuario: this.tiposUsuario,
      },
    });
  }

  eliminar(usuario: Usuario): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar el usuario ${usuario.username}?`
    );
    if (confirmacion && usuario.id_usuario) {
      // this.materialService.eliminarUsuario(usuario.id_usuario).subscribe({
      //   next: () => {
      //     this.cargarDatos();
      //   },
      //   error: (error: any) => {
      //     console.error('Error al eliminar usuario:', error);
      //   }
      // });
      console.log('Eliminar usuario - Funcionalidad en desarrollo');
    }
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }
}
