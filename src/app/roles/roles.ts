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
  descripcion?: string;
  activo: boolean;
  usuarios_count?: number;
  permisos_count?: number;
  permisos?: PermisosRol;
}

interface PermisosRol {
  [key: string]: boolean;
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
          id_rol: 'ADMIN_SISTEMAS',
          nombre: 'Administrador (sistemas)',
          descripcion: 'Administrador del sistema con acceso completo',
          activo: true,
          usuarios_count: this.contarUsuarios('ADMIN_SISTEMAS'),
          permisos_count: this.contarPermisos('ADMIN_SISTEMAS'),
          permisos: this.getPermisosCompletos()
        },
        {
          id_rol: 'GERENCIA',
          nombre: 'Gerencia',
          descripcion: 'Gerencia con acceso a reportes y dashboards',
          activo: true,
          usuarios_count: this.contarUsuarios('GERENCIA'),
          permisos_count: this.contarPermisos('GERENCIA'),
          permisos: this.getPermisosGerencia()
        },
        {
          id_rol: 'JEFE_PLANTA',
          nombre: 'Jefatura de Planta',
          descripcion: 'Jefatura con permisos operacionales amplios',
          activo: true,
          usuarios_count: this.contarUsuarios('JEFE_PLANTA'),
          permisos_count: this.contarPermisos('JEFE_PLANTA'),
          permisos: this.getPermisosJefePlanta()
        },
        {
          id_rol: 'JEFE_TINTORERIA',
          nombre: 'Jefatura de Tintorería',
          descripcion: 'Jefatura específica de área de tintorería',
          activo: true,
          usuarios_count: this.contarUsuarios('JEFE_TINTORERIA'),
          permisos_count: this.contarPermisos('JEFE_TINTORERIA'),
          permisos: this.getPermisosJefeTintoreria()
        },
        {
          id_rol: 'JEFE_LABORATORIO',
          nombre: 'Jefatura de Laboratorio',
          descripcion: 'Jefatura con enfoque en control de calidad',
          activo: true,
          usuarios_count: this.contarUsuarios('JEFE_LABORATORIO'),
          permisos_count: this.contarPermisos('JEFE_LABORATORIO'),
          permisos: this.getPermisosJefeLaboratorio()
        },
        {
          id_rol: 'JEFE_ALMACEN',
          nombre: 'Jefatura de Almacén',
          descripcion: 'Jefatura con permisos completos de almacén',
          activo: true,
          usuarios_count: this.contarUsuarios('JEFE_ALMACEN'),
          permisos_count: this.contarPermisos('JEFE_ALMACEN'),
          permisos: this.getPermisosJefeAlmacen()
        },
        {
          id_rol: 'SUPERVISOR',
          nombre: 'Supervisor',
          descripcion: 'Supervisor de operaciones diarias',
          activo: true,
          usuarios_count: this.contarUsuarios('SUPERVISOR'),
          permisos_count: this.contarPermisos('SUPERVISOR'),
          permisos: this.getPermisosSupervisor()
        },
        {
          id_rol: 'LABORATORISTA',
          nombre: 'Laboratorista/Analista de Laboratorio',
          descripcion: 'Personal técnico de laboratorio',
          activo: true,
          usuarios_count: this.contarUsuarios('LABORATORISTA'),
          permisos_count: this.contarPermisos('LABORATORISTA'),
          permisos: this.getPermisosLaboratorista()
        },
        {
          id_rol: 'INGENIERIA',
          nombre: 'Ingeniería',
          descripcion: 'Personal de ingeniería y desarrollo',
          activo: true,
          usuarios_count: this.contarUsuarios('INGENIERIA'),
          permisos_count: this.contarPermisos('INGENIERIA'),
          permisos: this.getPermisosIngenieria()
        },
        {
          id_rol: 'LOGISTICA',
          nombre: 'Compras/Ventas (Logística)',
          descripcion: 'Personal de compras y logística',
          activo: true,
          usuarios_count: this.contarUsuarios('LOGISTICA'),
          permisos_count: this.contarPermisos('LOGISTICA'),
          permisos: this.getPermisosLogistica()
        },
        {
          id_rol: 'OPERARIO_ALMACEN',
          nombre: 'Operario de Almacén',
          descripcion: 'Operario con permisos básicos de almacén',
          activo: true,
          usuarios_count: this.contarUsuarios('OPERARIO_ALMACEN'),
          permisos_count: this.contarPermisos('OPERARIO_ALMACEN'),
          permisos: this.getPermisosOperarioAlmacen()
        },
        {
          id_rol: 'EQUIPO_TECNICO',
          nombre: 'Equipo Técnico de Laboratorio',
          descripcion: 'Equipo técnico de soporte laboratorio',
          activo: true,
          usuarios_count: this.contarUsuarios('EQUIPO_TECNICO'),
          permisos_count: this.contarPermisos('EQUIPO_TECNICO'),
          permisos: this.getPermisosEquipoTecnico()
        }
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
      ADMIN_SISTEMAS: 0, // No hay usuarios asignados actualmente
      GERENCIA: 1, // Humberto Ponte
      JEFE_PLANTA: 1, // Raquel Llauca
      JEFE_TINTORERIA: 1, // Karla Santillan
      JEFE_LABORATORIO: 1, // Jose Alonso
      JEFE_ALMACEN: 1, // Hugo Ramirez
      SUPERVISOR: 6, // Alex/Alonso, Betsy, Dino, Alejando, Carlos, Huidobro
      LABORATORISTA: 3, // Lesly, Miguel Levano, Javier
      INGENIERIA: 5, // Nancy, Lenar, Lizet, Miguel Ayala, Xavier
      LOGISTICA: 1, // Virginia Quilla
      OPERARIO_ALMACEN: 0, // No hay usuarios asignados actualmente
      EQUIPO_TECNICO: 3, // Erick, Jessica, Dennis
    };
    return conteos[rolId] || 0;
  }

  contarPermisos(rolId: string): number {
    // Retornar conteo basado en tu matriz
    const conteos: { [key: string]: number } = {
      ADMIN_SISTEMAS: 26, // Todos los permisos
      GERENCIA: 18, // Según tu matriz
      JEFE_PLANTA: 26, // Todos los permisos
      JEFE_TINTORERIA: 26, // Todos los permisos
      JEFE_LABORATORIO: 26, // Todos los permisos
      JEFE_ALMACEN: 26, // Todos los permisos
      SUPERVISOR: 26, // Todos los permisos
      LABORATORISTA: 18, // Según tu matriz
      INGENIERIA: 26, // Todos los permisos
      LOGISTICA: 26, // Todos los permisos
      OPERARIO_ALMACEN: 18, // Según tu matriz
      EQUIPO_TECNICO: 18, // Según tu matriz
    };
    return conteos[rolId] || 0;
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  agregar(): void {
    const configuracion = RolesConfig.getConfiguracionFormulario(false);

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '800px',
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
    // Preparar datos iniciales con permisos en formato de formulario
    const datosIniciales = {
      id_rol: rol.id_rol,
      nombre: rol.nombre,
      activo: rol.activo,
      ...this.obtenerPermisosMatriz(rol.id_rol),
    };

    const configuracion = RolesConfig.getConfiguracionFormulario(true, datosIniciales);

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '800px',
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
        activo: datos.activo ?? true,
        permisos: this.convertirPermisosFormularioAEstructura(datos)
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
        activo: datos.activo,
        permisos: this.convertirPermisosFormularioAEstructura(datos)
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

  private obtenerPermisosMatriz(idRol: string): any {
    const rol = this.roles.find(r => r.id_rol === idRol);
    if (!rol?.permisos) return {};
    
    const permisos = rol.permisos;
    return {
      // Modificar
      permisos_modificar: Object.keys(permisos).filter(key => 
        key.startsWith('modificar_') && permisos[key]
      ),
      // Registro/Ingreso
      permisos_registro_ingreso: Object.keys(permisos).filter(key => 
        (key.startsWith('registro_') || key.startsWith('apartado_')) && permisos[key]
      ),
      // Apartados/Lectura
      permisos_apartados: Object.keys(permisos).filter(key => 
        key.startsWith('lectura_') && permisos[key]
      ),
      // Historial
      permisos_historial: Object.keys(permisos).filter(key => 
        key.startsWith('historial_') && permisos[key]
      ),
      // Roles
      permisos_roles: Object.keys(permisos).filter(key => 
        key.startsWith('roles_') && permisos[key]
      )
    };
  }

  private convertirPermisosFormularioAEstructura(datos: any): PermisosRol {
    const resultado: PermisosRol = {};
    
    // Combinar todos los arrays de permisos en un objeto plano
    const todosLosPermisos = [
      ...(datos.permisos_modificar || []),
      ...(datos.permisos_registro_ingreso || []),
      ...(datos.permisos_apartados || []),
      ...(datos.permisos_historial || []),
      ...(datos.permisos_roles || [])
    ];
    
    // Establecer todos los permisos disponibles como false inicialmente
    const permisosDisponibles = [
      'modificar_maestro', 'modificar_peso', 'modificar_precios', 'modificar_estado_de_lote', 'modificar_qca',
      'registro_lotes', 'registro_precio_local', 'registro_precio_importacion', 'apartado_pesado', 'apartado_lectura_cajas',
      'lectura_maestro', 'lectura_precios', 'lectura_reporte', 'lectura_dashboard', 'lectura_descarga', 'lectura_stock', 'lectura_pesado',
      'historial_movimientos', 'historial_precios', 'historial_logs', 'historial_auditoria', 'historial_descarga',
      'roles_asignacion', 'roles_modificacion'
    ];
    
    permisosDisponibles.forEach(permiso => {
      resultado[permiso] = todosLosPermisos.includes(permiso);
    });
    
    return resultado;
  }

  private async actualizarPermisosRol(idRol: string, permisos: any): Promise<void> {
    try {
      console.log('🔒 Actualizando permisos del rol:', idRol, permisos);
      
      // Simular actualización en backend
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Aquí iría la llamada al servicio real
      // return this.rolesService.actualizarPermisos(idRol, permisos);
      
      console.log('✅ Permisos actualizados exitosamente');
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      throw error;
    }
  }

  // Métodos de permisos por rol basados en tu matriz
  private getPermisosCompletos(): PermisosRol {
    // Administrador (sistemas) - todos los permisos
    return {
      modificar_maestro: true,
      modificar_peso: true,
      modificar_precios: true,
      modificar_estado_de_lote: true,
      modificar_qca: true,
      registro_lotes: true,
      registro_precio_local: true,
      registro_precio_importacion: true,
      apartado_pesado: true,
      apartado_lectura_cajas: true,
      lectura_maestro: true,
      lectura_precios: true,
      lectura_reporte: true,
      lectura_dashboard: true,
      lectura_descarga: true,
      lectura_stock: true,
      lectura_pesado: true,
      historial_movimientos: true,
      historial_precios: true,
      historial_logs: true,
      historial_auditoria: true,
      historial_descarga: true,
      roles_asignacion: true,
      roles_modificacion: true
    };
  }

  private getPermisosGerencia(): PermisosRol {
    return {
      modificar_maestro: true,
      modificar_peso: true,
      modificar_precios: true,
      modificar_estado_de_lote: false,
      modificar_qca: true,
      registro_lotes: false,
      registro_precio_local: true,
      registro_precio_importacion: true,
      apartado_pesado: false,
      apartado_lectura_cajas: false,
      lectura_maestro: true,
      lectura_precios: true,
      lectura_reporte: true,
      lectura_dashboard: true,
      lectura_descarga: true,
      lectura_stock: true,
      lectura_pesado: false,
      historial_movimientos: true,
      historial_precios: true,
      historial_logs: true,
      historial_auditoria: true,
      historial_descarga: true,
      roles_asignacion: true,
      roles_modificacion: true
    };
  }

  private getPermisosJefePlanta(): PermisosRol {
    // Todos los permisos
    return this.getPermisosCompletos();
  }

  private getPermisosJefeTintoreria(): PermisosRol {
    return this.getPermisosCompletos();
  }

  private getPermisosJefeLaboratorio(): PermisosRol {
    return this.getPermisosCompletos();
  }

  private getPermisosJefeAlmacen(): PermisosRol {
    return this.getPermisosCompletos();
  }

  private getPermisosSupervisor(): PermisosRol {
    return this.getPermisosCompletos();
  }

  private getPermisosLaboratorista(): PermisosRol {
    return {
      modificar_maestro: false,
      modificar_peso: true,
      modificar_precios: false,
      modificar_estado_de_lote: true,
      modificar_qca: true,
      registro_lotes: false,
      registro_precio_local: false,
      registro_precio_importacion: false,
      apartado_pesado: true,
      apartado_lectura_cajas: true,
      lectura_maestro: true,
      lectura_precios: true,
      lectura_reporte: true,
      lectura_dashboard: true,
      lectura_descarga: true,
      lectura_stock: true,
      lectura_pesado: true,
      historial_movimientos: true,
      historial_precios: false,
      historial_logs: true,
      historial_auditoria: true,
      historial_descarga: true,
      roles_asignacion: true,
      roles_modificacion: false
    };
  }

  private getPermisosIngenieria(): PermisosRol {
    return this.getPermisosCompletos();
  }

  private getPermisosLogistica(): PermisosRol {
    return this.getPermisosCompletos();
  }

  private getPermisosOperarioAlmacen(): PermisosRol {
    return {
      modificar_maestro: false,
      modificar_peso: true,
      modificar_precios: false,
      modificar_estado_de_lote: true,
      modificar_qca: true,
      registro_lotes: true,
      registro_precio_local: false,
      registro_precio_importacion: false,
      apartado_pesado: true,
      apartado_lectura_cajas: true,
      lectura_maestro: true,
      lectura_precios: true,
      lectura_reporte: true,
      lectura_dashboard: true,
      lectura_descarga: true,
      lectura_stock: true,
      lectura_pesado: true,
      historial_movimientos: true,
      historial_precios: false,
      historial_logs: true,
      historial_auditoria: true,
      historial_descarga: true,
      roles_asignacion: true,
      roles_modificacion: false
    };
  }

  private getPermisosEquipoTecnico(): PermisosRol {
    return {
      modificar_maestro: false,
      modificar_peso: true,
      modificar_precios: false,
      modificar_estado_de_lote: true,
      modificar_qca: true,
      registro_lotes: true,
      registro_precio_local: false,
      registro_precio_importacion: false,
      apartado_pesado: true,
      apartado_lectura_cajas: true,
      lectura_maestro: true,
      lectura_precios: true,
      lectura_reporte: true,
      lectura_dashboard: true,
      lectura_descarga: true,
      lectura_stock: true,
      lectura_pesado: true,
      historial_movimientos: true,
      historial_precios: false,
      historial_logs: true,
      historial_auditoria: true,
      historial_descarga: true,
      roles_asignacion: true,
      roles_modificacion: false
    };
  }
}
