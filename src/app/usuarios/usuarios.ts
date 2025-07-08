import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

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
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { UsuariosConfig } from '../shared/configs/usuarios-config';
import {
  PrimeDataTableComponent,
  TableColumn,
  TableAction,
  TableButtonConfig,
} from '../shared/components/prime-data-table/prime-data-table.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './usuarios.html',
  styleUrl: './usuarios.scss',
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  roles: Rol[] = [];
  tiposUsuario: TipoUsuario[] = [];
  
  dropdownExportAbierto = false;
  hasError = false;
  errorMessage = '';
  isLoading = false;

  columns: TableColumn[] = [];
  actions: TableAction[] = [];
  tableButtons: TableButtonConfig[] = [];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.initializeTable();
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  private initializeTable(): void {
    this.columns = UsuariosConfig.getTableColumns();
    this.actions = UsuariosConfig.getTableActions();
    this.tableButtons = [
      {
        action: 'add',
        label: 'Agregar Usuario',
        icon: 'add',
        color: 'primary',
      },
      {
        action: 'bulk-upload',
        label: 'Carga Masiva',
        icon: 'upload',
        color: 'secondary',
      },
    ];
  }

  cargarDatos(): void {
    this.isLoading = true;
    this.hasError = false;
    
    this.materialService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.isLoading = false;
      },
      error: (error) => {
        this.hasError = true;
        this.errorMessage = 'Error al cargar los usuarios. Intente nuevamente.';
        this.isLoading = false;
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

  onActionClick(event: { action: string; item: Usuario }): void {
    switch (event.action) {
      case 'view':
        this.verDetalle(event.item);
        break;
      case 'edit':
        this.editar(event.item);
        break;
      case 'delete':
        this.eliminar(event.item);
        break;
    }
  }

  onButtonClick(action: string): void {
    switch (action) {
      case 'add':
        this.agregar();
        break;
      case 'bulk-upload':
        this.cargaMasiva();
        break;
    }
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


  private configurarExportacion(): ConfiguracionExportacion<Usuario> {
    return {
      entidades: this.usuarios,
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
      filtrosActivos: [],
      metadatos: {
        cantidadTotal: this.usuarios.length,
        cantidadFiltrada: this.usuarios.length,
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
    this.cargaMasivaService.generarPlantilla(config);
  }

  private procesarArchivoCargaMasiva(archivo: File): void {
    const config = this.configurarCargaMasiva();
    this.cargaMasivaService
      .procesarArchivo(archivo, config)
      .then((resultado) => {
        console.log('Archivo procesado:', resultado);
        if (resultado.exitosa) {
          this.cargarDatos();
        }
      })
      .catch((error) => {
        console.error('Error procesando archivo:', error);
      });
  }

  agregar(): void {
    const configuracion = UsuariosConfig.getConfiguracionFormulario(false);

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && resultado.accion === 'guardar') {
        this.guardarUsuario(resultado.datos).then(() => {
          this.cargarDatos();
        });
      }
    });
  }

  editar(usuario: Usuario): void {
    const configuracion = UsuariosConfig.getConfiguracionFormulario(
      true,
      usuario
    );

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && resultado.accion === 'guardar') {
        this.actualizarUsuario(usuario.id_usuario!, resultado.datos).then(
          () => {
            this.cargarDatos();
          }
        );
      }
    });
  }

  verDetalle(usuario: Usuario): void {
    const configuracion = UsuariosConfig.getConfiguracionDetalle(usuario);

    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: configuracion,
    });
  }

  eliminar(usuario: Usuario): void {
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '400px',
      disableClose: true,
      data: UsuariosConfig.eliminarUsuario(usuario),
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && usuario.id_usuario) {
        console.log('Eliminar usuario:', usuario);
        this.cargarDatos();
      }
    });
  }

  async guardarUsuario(datos: any): Promise<any> {
    try {
      const nuevoUsuario: Usuario = {
        username: datos.username,
        email: datos.email,
        password_hash: datos.password,
        id_rol: datos.id_rol,
        id_tipo_usuario: parseInt(datos.id_tipo_usuario),
        activo: datos.activo ?? true,
      };

      console.log('Usuario a crear:', nuevoUsuario);
      return Promise.resolve(nuevoUsuario);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }

  async actualizarUsuario(id: number, datos: any): Promise<any> {
    try {
      const usuarioActualizado: Usuario = {
        id_usuario: id,
        username: datos.username,
        email: datos.email,
        id_rol: datos.id_rol,
        id_tipo_usuario: parseInt(datos.id_tipo_usuario),
        activo: datos.activo,
      };

      console.log('Usuario a actualizar:', usuarioActualizado);
      return Promise.resolve(usuarioActualizado);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }
}
