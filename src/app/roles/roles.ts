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
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';

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
    console.log('Agregar nuevo rol');
  }

  verDetalle(rol: Rol): void {
    console.log('Ver detalle del rol:', rol);
  }

  editar(rol: Rol): void {
    console.log('Editar rol:', rol);
  }

  gestionarPermisos(rol: Rol): void {
    console.log('Gestionar permisos del rol:', rol);
  }

  private configurarExportacion(): ConfiguracionExportacion<Rol> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'roles',
      nombreEntidad: 'Roles',
      columnas: [
        { campo: 'id_rol', titulo: 'Código', formato: 'texto' },
        { campo: 'nombre', titulo: 'Nombre', formato: 'texto' },
        { campo: 'descripcion', titulo: 'Descripción', formato: 'texto' },
        { campo: 'activo', titulo: 'Estado', formato: 'texto' },
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
