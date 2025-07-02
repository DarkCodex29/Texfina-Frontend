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
  ],
  templateUrl: './roles.html',
  styleUrls: ['./roles.scss'],
})
export class RolesComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

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
      ];

      this.dataSource.data = [...this.roles];
      this.isLoading = false;
    } catch (error) {
      this.hasError = true;
      this.errorMessage = 'Error al cargar los roles del sistema';
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
}
