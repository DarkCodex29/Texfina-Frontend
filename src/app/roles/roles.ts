import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  PrimeDataTableComponent,
  TableColumn,
  TableAction,
  TableButtonConfig,
} from '../shared/components/prime-data-table/prime-data-table.component';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { RolesConfig } from '../shared/configs/roles-config';

interface Rol {
  id_rol: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
  usuarios_count?: number;
  permisos_count?: number;
}

interface Estadistica {
  nombre: string;
  valor: string;
  descripcion: string;
  tipo: 'info' | 'success' | 'warning' | 'error';
  porcentaje?: number;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent implements OnInit {
  roles: Rol[] = [];
  
  dropdownExportAbierto = false;
  hasError = false;
  errorMessage = '';
  isLoading = false;

  columns: TableColumn[] = [];
  actions: TableAction[] = [];
  tableButtons: TableButtonConfig[] = [];

  constructor(
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
    this.columns = RolesConfig.getTableColumns();
    this.actions = RolesConfig.getTableActions();
    this.tableButtons = [
      {
        action: 'add',
        label: 'Agregar Rol',
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

    try {
      this.roles = [
        {
          id_rol: 'ADMIN',
          nombre: 'Administrador',
          descripcion: 'Administrador del sistema con acceso completo',
          activo: true,
          usuarios_count: this.contarUsuarios('ADMIN'),
          permisos_count: this.contarPermisos('ADMIN'),
        },
        {
          id_rol: 'SUPERVISOR',
          nombre: 'Supervisor',
          descripcion: 'Supervisor de operaciones con permisos avanzados',
          activo: true,
          usuarios_count: this.contarUsuarios('SUPERVISOR'),
          permisos_count: this.contarPermisos('SUPERVISOR'),
        },
        {
          id_rol: 'OPERARIO',
          nombre: 'Operario',
          descripcion: 'Operario con permisos básicos de gestión',
          activo: true,
          usuarios_count: this.contarUsuarios('OPERARIO'),
          permisos_count: this.contarPermisos('OPERARIO'),
        },
        {
          id_rol: 'CONSULTOR',
          nombre: 'Consultor',
          descripcion: 'Consultor con permisos de solo lectura',
          activo: false,
          usuarios_count: this.contarUsuarios('CONSULTOR'),
          permisos_count: this.contarPermisos('CONSULTOR'),
        },
        {
          id_rol: 'INVITADO',
          nombre: 'Invitado',
          descripcion: 'Usuario con acceso limitado temporal',
          activo: false,
          usuarios_count: this.contarUsuarios('INVITADO'),
          permisos_count: this.contarPermisos('INVITADO'),
        },
      ];
      this.isLoading = false;
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Error al cargar los roles del sistema';
      this.isLoading = false;
    }
  }

  onActionClick(event: { action: string; item: Rol }): void {
    switch (event.action) {
      case 'view':
        this.verDetalle(event.item);
        break;
      case 'edit':
        this.editar(event.item);
        break;
      case 'permissions':
        this.gestionarPermisos(event.item);
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


  contarUsuarios(rolId: string): number {
    const conteos: { [key: string]: number } = {
      ADMIN: 2,
      SUPERVISOR: 3,
      OPERARIO: 5,
      CONSULTOR: 2,
      INVITADO: 0,
    };
    return conteos[rolId] || 0;
  }

  contarPermisos(rolId: string): number {
    const conteos: { [key: string]: number } = {
      ADMIN: 45,
      SUPERVISOR: 32,
      OPERARIO: 18,
      CONSULTOR: 8,
      INVITADO: 3,
    };
    return conteos[rolId] || 0;
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  agregar(): void {
    const configuracion = RolesConfig.getConfiguracionFormulario(false);

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && resultado.accion === 'guardar') {
        this.guardarRol(resultado.datos).then(() => {
          this.cargarDatos();
        });
      }
    });
  }

  verDetalle(rol: Rol): void {
    const configuracion = RolesConfig.getConfiguracionDetalle(rol);

    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: configuracion,
    });
  }

  editar(rol: Rol): void {
    const configuracion = RolesConfig.getConfiguracionFormulario(true, rol);

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado && resultado.accion === 'guardar') {
        this.actualizarRol(rol.id_rol, resultado.datos).then(() => {
          this.cargarDatos();
        });
      }
    });
  }

  gestionarPermisos(rol: Rol): void {
    console.log('Gestionar permisos para el rol:', rol);
    // TODO: Implementar gestión de permisos
  }

  private configurarExportacion(): ConfiguracionExportacion<Rol> {
    return {
      entidades: this.roles,
      nombreArchivo: 'roles_sistema',
      nombreEntidad: 'Roles del Sistema',
      columnas: [
        { campo: 'id_rol', titulo: 'Código del Rol', formato: 'texto' },
        { campo: 'nombre', titulo: 'Nombre del Rol', formato: 'texto' },
        { campo: 'descripcion', titulo: 'Descripción', formato: 'texto' },
        { campo: 'usuarios_count', titulo: 'Usuarios Asignados', formato: 'numero' },
        { campo: 'permisos_count', titulo: 'Permisos Configurados', formato: 'numero' },
        { 
          campo: 'activo', 
          titulo: 'Estado', 
          formato: 'texto',
          transformar: (valor: boolean) => valor ? 'Activo' : 'Inactivo'
        },
      ],
      filtrosActivos: [],
      metadatos: {
        cantidadTotal: this.roles.length,
        cantidadFiltrada: this.roles.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Rol> {
    return {
      tipoEntidad: 'roles',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código',
          campoEntidad: 'id_rol',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Nombre',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Descripción',
          campoEntidad: 'descripcion',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Activo',
          campoEntidad: 'activo',
          obligatorio: false,
          tipoEsperado: 'booleano',
        },
      ],
      validaciones: [
        {
          campo: 'id_rol',
          validador: (valor) => valor && valor.length <= 20,
          mensajeError: 'El código del rol debe tener máximo 20 caracteres',
        },
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El nombre debe tener máximo 100 caracteres',
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
      console.log('📊 Exportando roles a Excel...');
      console.log('🔍 Roles totales:', this.roles.length);
      
      this.dropdownExportAbierto = false;
      
      const config = this.configurarExportacion();
      console.log('⚙️ Configuración de exportación:', config);
      
      this.exportacionService.exportarExcel(config);
      
      console.log(`✅ ${this.roles.length} roles exportados a Excel`);
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
    }
  }

  exportarPDF(): void {
    try {
      console.log('📄 Exportando roles a PDF...');
      this.dropdownExportAbierto = false;
      
      const config = this.configurarExportacion();
      this.exportacionService.exportarPDF(config);
      
      console.log(`✅ ${this.roles.length} roles exportados a PDF`);
    } catch (error) {
      console.error('❌ Error al exportar PDF:', error);
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
          this.cargarDatos();
        }
      })
      .catch((error) => {
        console.error('Error procesando archivo:', error);
      });
  }

  async guardarRol(datos: any): Promise<any> {
    try {
      const nuevoRol: Rol = {
        id_rol: datos.id_rol,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        activo: datos.activo ?? true,
      };

      console.log('Rol a crear:', nuevoRol);
      return Promise.resolve(nuevoRol);
    } catch (error) {
      console.error('Error al crear rol:', error);
      throw error;
    }
  }

  async actualizarRol(id: string, datos: any): Promise<any> {
    try {
      const rolActualizado: Rol = {
        id_rol: id,
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        activo: datos.activo,
      };

      console.log('Rol a actualizar:', rolActualizado);
      return Promise.resolve(rolActualizado);
    } catch (error) {
      console.error('Error al actualizar rol:', error);
      throw error;
    }
  }

  eliminar(rol: Rol): void {
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '400px',
      disableClose: true,
      data: RolesConfig.eliminarRol(rol),
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && rol.id_rol) {
        console.log('Eliminar rol:', rol);
        this.cargarDatos();
      }
    });
  }

}
