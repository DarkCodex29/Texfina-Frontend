import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { PrimeDataTableComponent, TableColumn, TableAction, TableState } from '../shared/components/prime-data-table/prime-data-table.component';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';

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
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatTooltipModule,
    MatSortModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Configuración del DataTable
  tableColumns: TableColumn[] = [
    {
      key: 'id_rol',
      title: 'Código',
      type: 'badge',
      sortable: true,
      filterable: true,
      width: '120px',
      icon: 'pi pi-hashtag'
    },
    {
      key: 'nombre',
      title: 'Rol',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '200px',
      icon: 'pi pi-user'
    },
    {
      key: 'descripcion',
      title: 'Descripción',
      type: 'description',
      sortable: false,
      filterable: true,
      width: '300px',
      icon: 'pi pi-info-circle'
    },
    {
      key: 'usuarios_count',
      title: 'Usuarios',
      type: 'badge',
      sortable: true,
      filterable: false,
      width: '100px',
      icon: 'pi pi-users'
    },
    {
      key: 'permisos_count',
      title: 'Permisos',
      type: 'badge',
      sortable: true,
      filterable: false,
      width: '100px',
      icon: 'pi pi-shield'
    },
    {
      key: 'activo',
      title: 'Estado',
      type: 'badge',
      sortable: true,
      filterable: true,
      width: '100px',
      icon: 'pi pi-circle'
    }
  ];

  tableActions: TableAction[] = [
    {
      icon: 'pi pi-eye',
      tooltip: 'Ver detalle del rol',
      action: 'view',
      color: 'primary'
    },
    {
      icon: 'pi pi-pencil',
      tooltip: 'Editar rol',
      action: 'edit',
      color: 'secondary'
    },
    {
      icon: 'pi pi-shield',
      tooltip: 'Gestionar permisos',
      action: 'permissions',
      color: 'warn'
    },
    {
      icon: 'pi pi-trash',
      tooltip: 'Eliminar rol',
      action: 'delete',
      color: 'danger'
    }
  ];

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  displayedColumns: string[] = [
    'codigo',
    'rol',
    'usuarios',
    'permisos',
    'estado',
    'acciones',
  ];

  roles: Rol[] = [];
  dataSource = new MatTableDataSource<Rol>([]);
  estadisticas: Estadistica[] = [];
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosColumnaHabilitados = false;
  dropdownExportAbierto = false;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      codigo: [''],
      rol: [''],
      usuarios: [''],
      permisos: [''],
      estado: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.cargarEstadisticas();
    this.configurarFiltros();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.roles.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      !this.hasError &&
      this.roles.length > 0 &&
      this.dataSource.filteredData.length === 0
    );
  }

  private configurarFiltros(): void {
    this.filtroGeneralForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltroGeneral();
      });
  }

  private async cargarDatos(): Promise<void> {
    this.tableState = { ...this.tableState, loading: true, error: false };
    this.isLoading = true;
    this.hasError = false;

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.roles = [
        {
          id_rol: 'ADMIN',
          nombre: 'Administrador',
          descripcion: 'Administrador del sistema con acceso completo',
          activo: true,
        },
        {
          id_rol: 'SUPERVISOR',
          nombre: 'Supervisor',
          descripcion: 'Supervisor de operaciones con permisos avanzados',
          activo: true,
        },
        {
          id_rol: 'OPERARIO',
          nombre: 'Operario',
          descripcion: 'Operario con permisos básicos de gestión',
          activo: true,
        },
        {
          id_rol: 'CONSULTOR',
          nombre: 'Consultor',
          descripcion: 'Consultor con permisos de solo lectura',
          activo: false,
        },
        {
          id_rol: 'INVITADO',
          nombre: 'Invitado',
          descripcion: 'Usuario con acceso limitado temporal',
          activo: false,
        },
      ].map((r) => ({
        id_rol: r.id_rol || '',
        nombre: r.nombre || '',
        descripcion: r.descripcion || '',
        activo: r.activo ?? false,
        usuarios_count: this.contarUsuarios(r.id_rol),
        permisos_count: this.contarPermisos(r.id_rol),
      }));
      this.dataSource.data = [...this.roles];
      this.tableState = { 
        ...this.tableState, 
        loading: false, 
        empty: this.roles.length === 0,
        filteredEmpty: false
      };
      this.isLoading = false;
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Error al cargar los roles del sistema';
      this.tableState = { ...this.tableState, loading: false, error: true };
      this.isLoading = false;
    }
  }

  cargarEstadisticas(): void {
    this.estadisticas = [
      {
        nombre: 'Total Roles',
        valor: '5',
        descripcion: 'Roles configurados',
        tipo: 'info',
        porcentaje: 25,
      },
      {
        nombre: 'Roles Activos',
        valor: '3',
        descripcion: 'Roles habilitados',
        tipo: 'success',
        porcentaje: 15,
      },
      {
        nombre: 'Usuarios Asignados',
        valor: '12',
        descripcion: 'Usuarios con rol',
        tipo: 'info',
        porcentaje: 8,
      },
      {
        nombre: 'Permisos Total',
        valor: '45',
        descripcion: 'Permisos disponibles',
        tipo: 'warning',
      },
    ];
  }

  aplicarFiltroGeneral(): void {
    const filtro =
      this.filtroGeneralForm.get('busquedaGeneral')?.value?.toLowerCase() || '';

    if (!filtro.trim()) {
      this.dataSource.data = [...this.roles];
      return;
    }

    this.dataSource.data = this.roles.filter(
      (rol) =>
        rol.nombre.toLowerCase().includes(filtro) ||
        rol.descripcion.toLowerCase().includes(filtro) ||
        rol.id_rol.toLowerCase().includes(filtro) ||
        this.getEstadoTexto(rol.activo).toLowerCase().includes(filtro)
    );
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.get('busquedaGeneral')?.setValue('');
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset({
      codigo: '',
      rol: '',
      usuarios: '',
      permisos: '',
      estado: '',
    });
    this.dataSource.data = [...this.roles];
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  formatearCodigo(codigo?: string): string {
    if (!codigo) return 'SIN-COD';
    return codigo.toUpperCase();
  }

  getEstadoTexto(activo: boolean): string {
    return activo ? 'Activo' : 'Inactivo';
  }

  getEstadoBadgeClass(activo: boolean): string {
    return activo ? 'badge-success' : 'badge-error';
  }

  getCardClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      info: 'card-info',
      success: 'card-success',
      warning: 'card-warning',
      error: 'card-error',
    };
    return clases[tipo] || '';
  }

  getTrendClass(tipo: string): string {
    const clases: { [key: string]: string } = {
      info: 'trend-up',
      success: 'trend-up',
      warning: 'trend-stable',
      error: 'trend-down',
    };
    return clases[tipo] || '';
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

  sortData(column: string): void {
    console.log('Ordenando por:', column);
  }

  reintentarCarga(): void {
    this.cargarDatos();
  }

  agregar(): void {
    import('../shared/dialogs/formulario-dialog/formulario-dialog.component').then(({ FormularioDialogComponent }) => {
      import('../shared/configs/roles-config').then(({ RolesConfig }) => {
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '600px',
          disableClose: true,
          data: {
            configuracion: RolesConfig.getConfiguracionFormulario(false),
          },
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado && resultado.accion === 'guardar') {
            console.log('Guardando nuevo rol:', resultado.datos);
            this.guardarRol(resultado.datos).then(() => {
              this.cargarDatos();
            });
          }
        });
      });
    });
  }

  verDetalle(rol: Rol): void {
    import('../shared/dialogs/detalle-dialog/detalle-dialog.component').then(({ DetalleDialogComponent }) => {
      import('../shared/configs/roles-config').then(({ RolesConfig }) => {
        const dialogRef = this.dialog.open(DetalleDialogComponent, {
          width: '800px',
          disableClose: true,
          data: {
            configuracion: RolesConfig.getConfiguracionDetalle(rol),
          },
        });
      });
    });
  }

  editar(rol: Rol): void {
    import('../shared/dialogs/formulario-dialog/formulario-dialog.component').then(({ FormularioDialogComponent }) => {
      import('../shared/configs/roles-config').then(({ RolesConfig }) => {
        const dialogRef = this.dialog.open(FormularioDialogComponent, {
          width: '600px',
          disableClose: true,
          data: {
            configuracion: RolesConfig.getConfiguracionFormulario(true, rol),
          },
        });

        dialogRef.afterClosed().subscribe((resultado) => {
          if (resultado && resultado.accion === 'guardar') {
            console.log('Actualizando rol:', resultado.datos);
            this.actualizarRol(rol.id_rol, resultado.datos).then(() => {
              this.cargarDatos();
            });
          }
        });
      });
    });
  }

  gestionarPermisos(rol: Rol): void {
    import('../shared/dialogs/formulario-dialog/formulario-dialog.component').then(({ FormularioDialogComponent }) => {
      const dialogRef = this.dialog.open(FormularioDialogComponent, {
        width: '800px',
        disableClose: true,
        data: {
          configuracion: {
            titulo: {
              agregar: `Gestionar Permisos - ${rol.nombre}`,
              editar: `Gestionar Permisos - ${rol.nombre}`,
            },
            entidad: 'permisos',
            entidadArticulo: 'los',
            esEdicion: true,
            datosIniciales: {
              id_rol: rol.id_rol,
              nombre_rol: rol.nombre,
              permisos_actuales: this.obtenerPermisosRol(rol.id_rol),
            },
            filas: [
              [
                {
                  key: 'nombre_rol',
                  label: 'Rol',
                  tipo: 'text',
                  obligatorio: false,
                  disabled: true,
                },
              ],
              [
                {
                  key: 'permisos_dashboard',
                  label: 'Dashboard',
                  tipo: 'checkbox-group',
                  obligatorio: false,
                  opciones: [
                    { value: 'dashboard_view', label: 'Ver Dashboard' },
                    { value: 'dashboard_export', label: 'Exportar Dashboard' },
                  ],
                },
              ],
              [
                {
                  key: 'permisos_inventario',
                  label: 'Inventario',
                  tipo: 'checkbox-group',
                  obligatorio: false,
                  opciones: [
                    { value: 'inventario_view', label: 'Ver Inventario' },
                    { value: 'inventario_create', label: 'Crear Materiales' },
                    { value: 'inventario_edit', label: 'Editar Materiales' },
                    { value: 'inventario_delete', label: 'Eliminar Materiales' },
                    { value: 'inventario_export', label: 'Exportar Inventario' },
                  ],
                },
              ],
              [
                {
                  key: 'permisos_almacenes',
                  label: 'Almacenes',
                  tipo: 'checkbox-group',
                  obligatorio: false,
                  opciones: [
                    { value: 'almacenes_view', label: 'Ver Almacenes' },
                    { value: 'almacenes_create', label: 'Crear Almacenes' },
                    { value: 'almacenes_edit', label: 'Editar Almacenes' },
                    { value: 'almacenes_delete', label: 'Eliminar Almacenes' },
                  ],
                },
              ],
              [
                {
                  key: 'permisos_usuarios',
                  label: 'Usuarios y Roles',
                  tipo: 'checkbox-group',
                  obligatorio: false,
                  opciones: [
                    { value: 'usuarios_view', label: 'Ver Usuarios' },
                    { value: 'usuarios_create', label: 'Crear Usuarios' },
                    { value: 'usuarios_edit', label: 'Editar Usuarios' },
                    { value: 'usuarios_delete', label: 'Eliminar Usuarios' },
                    { value: 'roles_manage', label: 'Gestionar Roles' },
                  ],
                },
              ],
              [
                {
                  key: 'permisos_reportes',
                  label: 'Reportes',
                  tipo: 'checkbox-group',
                  obligatorio: false,
                  opciones: [
                    { value: 'reportes_view', label: 'Ver Reportes' },
                    { value: 'reportes_export', label: 'Exportar Reportes' },
                    { value: 'reportes_advanced', label: 'Reportes Avanzados' },
                  ],
                },
              ],
            ],
          },
        },
      });

      dialogRef.afterClosed().subscribe((resultado) => {
        if (resultado && resultado.accion === 'guardar') {
          console.log('Actualizando permisos del rol:', resultado.datos);
          this.actualizarPermisosRol(rol.id_rol, resultado.datos).then(() => {
            this.cargarDatos();
          });
        }
      });
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<Rol> {
    return {
      entidades: this.dataSource.data.length > 0 ? this.dataSource.data : this.roles,
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
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.roles.length,
        cantidadFiltrada: this.dataSource.data.length,
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
      console.log('🔍 Datos en dataSource:', this.dataSource.data.length);
      console.log('🔍 Roles totales:', this.roles.length);
      
      this.dropdownExportAbierto = false;
      
      const config = this.configurarExportacion();
      console.log('⚙️ Configuración de exportación:', config);
      
      this.exportacionService.exportarExcel(config);
      
      console.log(`✅ ${this.dataSource.data.length} roles exportados a Excel`);
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
      
      console.log(`✅ ${this.dataSource.data.length} roles exportados a PDF`);
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

  private obtenerFiltrosActivos(): any {
    return {
      busquedaGeneral:
        this.filtroGeneralForm.get('busquedaGeneral')?.value || '',
    };
  }

  private async guardarRol(datosRol: any): Promise<void> {
    console.log('💾 Guardando nuevo rol:', datosRol);
    
    // Simular guardado en backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí iría la llamada al servicio real
    // return this.rolesService.crearRol(datosRol);
    
    console.log('✅ Rol guardado exitosamente');
  }

  private async actualizarRol(idRol: string, datosRol: any): Promise<void> {
    console.log('📝 Actualizando rol:', idRol, datosRol);
    
    // Simular actualización en backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí iría la llamada al servicio real
    // return this.rolesService.actualizarRol(idRol, datosRol);
    
    console.log('✅ Rol actualizado exitosamente');
  }

  private async eliminarRol(idRol: string): Promise<void> {
    console.log('🗑️ Eliminando rol:', idRol);
    
    // Simular eliminación en backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí iría la llamada al servicio real
    // return this.rolesService.eliminarRol(idRol);
    
    console.log('✅ Rol eliminado exitosamente');
  }

  private obtenerPermisosRol(idRol: string): any {
    // Simular obtención de permisos actuales del rol
    const permisosPorRol: { [key: string]: any } = {
      ADMIN: {
        permisos_dashboard: ['dashboard_view', 'dashboard_export'],
        permisos_inventario: ['inventario_view', 'inventario_create', 'inventario_edit', 'inventario_delete', 'inventario_export'],
        permisos_almacenes: ['almacenes_view', 'almacenes_create', 'almacenes_edit', 'almacenes_delete'],
        permisos_usuarios: ['usuarios_view', 'usuarios_create', 'usuarios_edit', 'usuarios_delete', 'roles_manage'],
        permisos_reportes: ['reportes_view', 'reportes_export', 'reportes_advanced'],
      },
      SUPERVISOR: {
        permisos_dashboard: ['dashboard_view', 'dashboard_export'],
        permisos_inventario: ['inventario_view', 'inventario_create', 'inventario_edit', 'inventario_export'],
        permisos_almacenes: ['almacenes_view', 'almacenes_create', 'almacenes_edit'],
        permisos_usuarios: ['usuarios_view'],
        permisos_reportes: ['reportes_view', 'reportes_export'],
      },
      OPERARIO: {
        permisos_dashboard: ['dashboard_view'],
        permisos_inventario: ['inventario_view', 'inventario_create', 'inventario_edit'],
        permisos_almacenes: ['almacenes_view'],
        permisos_usuarios: [],
        permisos_reportes: ['reportes_view'],
      },
      CONSULTOR: {
        permisos_dashboard: ['dashboard_view'],
        permisos_inventario: ['inventario_view'],
        permisos_almacenes: ['almacenes_view'],
        permisos_usuarios: [],
        permisos_reportes: ['reportes_view'],
      },
    };

    return permisosPorRol[idRol] || {};
  }

  private async actualizarPermisosRol(idRol: string, permisos: any): Promise<void> {
    console.log('🔒 Actualizando permisos del rol:', idRol, permisos);
    
    // Simular actualización en backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí iría la llamada al servicio real
    // return this.rolesService.actualizarPermisos(idRol, permisos);
    
    console.log('✅ Permisos actualizados exitosamente');
  }

  eliminar(rol: Rol): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(({ ConfirmacionDialogComponent }) => {
      import('../shared/configs/roles-config').then(({ RolesConfig }) => {
        const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
          width: '400px',
          disableClose: true,
          data: RolesConfig.eliminarRol(rol),
        });

        dialogRef.afterClosed().subscribe((confirmado) => {
          if (confirmado) {
            console.log('Eliminando rol:', rol);
            this.eliminarRol(rol.id_rol).then(() => {
              this.cargarDatos();
            });
          }
        });
      });
    });
  }

  // Métodos para el DataTable
  handleAction(event: {action: string, item: any}) {
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

  handleSort(event: {column: string, direction: 'asc' | 'desc'}) {
    console.log('Ordenar:', event);
    this.sortData(event.column);
  }

  handleFilters(filters: any) {
    console.log('Filtros aplicados:', filters);
    // Los filtros ya se aplican automáticamente en el DataTable
    this.tableState = {
      ...this.tableState,
      filteredEmpty: this.dataSource.data.length === 0 && this.roles.length > 0
    };
  }
}
