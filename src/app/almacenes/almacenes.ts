import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MaterialService } from '../services/material.service';
import { Almacen } from '../models/insumo.model';
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { AlmacenesConfig } from '../shared/configs/almacenes-config';
import { ConfirmacionConfig } from '../shared/configs/confirmacion-config';
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
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  delay,
  finalize,
} from 'rxjs';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './almacenes.html',
  styleUrls: ['./almacenes.scss'],
})
export class AlmacenesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  // ============================================================================
  // PROPIEDADES DE DATOS
  // ============================================================================
  almacenes: Almacen[] = [];
  dataSource = new MatTableDataSource<Almacen>([]);

  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosExpanded = true;
  filtrosColumnaHabilitados = false;
  filtrosColumnaActivos = false;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // PROPIEDADES DE ESTADO
  // ============================================================================
  isLoading = false;
  hasError = false;
  errorMessage = '';
  dropdownExportAbierto: boolean = false;

  // ============================================================================
  // CONFIGURACIÓN DE TABLA
  // ============================================================================
  displayedColumns: string[] = [
    'id_almacen',
    'nombre',
    'ubicacion',
    'acciones',
  ];

  get almacenesFiltrados(): Almacen[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.almacenes.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.almacenes.length > 0
    );
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
      idAlmacen: [''],
      nombre: [''],
      ubicacion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarAlmacenes();
    this.configurarFiltroGeneralEnTiempoReal();
    this.configurarFiltrosColumnaEnTiempoReal();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  configurarFiltroGeneralEnTiempoReal(): void {
    this.filtroGeneralForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltroGeneral();
      });
  }

  configurarFiltrosColumnaEnTiempoReal(): void {
    this.filtrosColumnaForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltrosColumna();
      });
  }

  // ============================================================================
  // MÉTODOS DE INICIALIZACIÓN
  // ============================================================================
  cargarAlmacenes(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de almacenes - isLoading:', this.isLoading);

    this.materialService
      .getAlmacenes()
      .pipe(
        delay(1500),
        finalize(() => {
          this.isLoading = false;
          console.log('✅ Carga completada - isLoading:', this.isLoading);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (almacenes) => {
          console.log('📦 Almacenes cargados:', almacenes.length);
          this.almacenes = almacenes;
          this.dataSource.data = [...almacenes];
        },
        error: (error) => {
          console.error('❌ Error al cargar almacenes:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar los almacenes. Por favor, intenta nuevamente.';
          this.almacenes = [];
          this.dataSource.data = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarAlmacenes();
  }

  // ============================================================================
  // MÉTODOS DE FILTROS
  // ============================================================================
  aplicarFiltroGeneral(): void {
    const busqueda = this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.value?.trim()
      .toLowerCase();

    if (!busqueda) {
      this.dataSource.data = [...this.almacenes];
      return;
    }

    const almacenesFiltrados = this.almacenes.filter((almacen) => {
      const id = almacen.id_almacen?.toString() || '';
      const nombre = almacen.nombre?.toLowerCase() || '';
      const ubicacion = almacen.ubicacion?.toLowerCase() || '';

      return (
        id.includes(busqueda) ||
        nombre.includes(busqueda) ||
        ubicacion.includes(busqueda)
      );
    });

    this.dataSource.data = almacenesFiltrados;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let almacenesFiltrados = [...this.almacenes];

    // Filtro por ID Almacén
    if (filtros.idAlmacen && filtros.idAlmacen.toString().trim()) {
      const idFiltro = parseInt(filtros.idAlmacen);
      if (!isNaN(idFiltro)) {
        almacenesFiltrados = almacenesFiltrados.filter(
          (almacen) => almacen.id_almacen === idFiltro
        );
      }
    }

    // Filtro por Nombre
    if (filtros.nombre && filtros.nombre.trim()) {
      almacenesFiltrados = almacenesFiltrados.filter((almacen) =>
        almacen.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    // Filtro por Ubicación
    if (filtros.ubicacion && filtros.ubicacion.trim()) {
      almacenesFiltrados = almacenesFiltrados.filter((almacen) =>
        almacen.ubicacion
          ?.toLowerCase()
          .includes(filtros.ubicacion.toLowerCase())
      );
    }

    this.dataSource.data = almacenesFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.almacenes];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.almacenes];
  }

  toggleFiltrosColumna() {
    this.filtrosColumnaHabilitados = !this.filtrosColumnaHabilitados;
    this.filtrosColumnaActivos = !this.filtrosColumnaActivos;

    if (this.filtrosColumnaHabilitados) {
      if (this.filtrosColumnaActivos) {
        this.limpiarFiltroGeneral();
      } else {
        this.limpiarFiltrosColumna();
      }
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'F3') {
      event.preventDefault();
      this.toggleFiltrosColumna();
    }
  }

  toggleFiltros(): void {
    this.filtrosExpanded = !this.filtrosExpanded;
  }

  // ============================================================================
  // MÉTODOS DE TABLA
  // ============================================================================
  sortData(column: string): void {
    if (this.sort) {
      // Si ya está ordenado por esta columna, cambiar dirección
      if (this.sort.active === column) {
        this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        // Nueva columna, empezar con ascendente
        this.sort.active = column;
        this.sort.direction = 'asc';
      }
      this.sort.sortChange.emit({
        active: this.sort.active,
        direction: this.sort.direction,
      });
    }
  }

  // ============================================================================
  // CONFIGURACIONES SEGÚN REGLA DE ORO
  // ============================================================================
  private configurarExportacion(): ConfiguracionExportacion<Almacen> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'almacenes',
      nombreEntidad: 'Almacenes',
      columnas: [
        { campo: 'id_almacen', titulo: 'ID', formato: 'numero' },
        { campo: 'nombre', titulo: 'Nombre', formato: 'texto' },
        { campo: 'ubicacion', titulo: 'Ubicación', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.almacenes.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Almacen> {
    return {
      tipoEntidad: 'almacenes',
      mapeoColumnas: [
        {
          columnaArchivo: 'Nombre',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Ubicación',
          campoEntidad: 'ubicacion',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El nombre debe tener máximo 100 caracteres',
        },
        {
          campo: 'ubicacion',
          validador: (valor) => valor && valor.length <= 200,
          mensajeError: 'La ubicación debe tener máximo 200 caracteres',
        },
      ],
    };
  }

  private obtenerFiltrosActivos(): any {
    const filtroGeneral = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    const filtrosColumna = this.filtrosColumnaForm.value;

    return {
      busquedaGeneral: filtroGeneral || null,
      ...filtrosColumna,
    };
  }

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN Y CARGA MASIVA
  // ============================================================================
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
  }

  descargarPlantillaCargaMasiva(): void {
    try {
      const config = this.configurarCargaMasiva();
      this.cargaMasivaService.generarPlantilla(config);
    } catch (error) {
      console.error('Error al generar plantilla:', error);
    }
  }

  async procesarArchivoCargaMasiva(archivo: File): Promise<void> {
    try {
      const config = this.configurarCargaMasiva();
      const resultado = await this.cargaMasivaService.procesarArchivo(
        archivo,
        config
      );

      if (resultado.exitosa) {
        await this.guardarAlmacenesMasivos(resultado.entidadesValidas);
        console.log(
          `✅ ${resultado.registrosValidos} registros procesados exitosamente`
        );
        this.cargarAlmacenes();
      } else {
        console.log('❌ Errores en el archivo:', resultado.errores);
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
    }
  }

  private async guardarAlmacenesMasivos(almacenes: Almacen[]): Promise<void> {
    for (const almacen of almacenes) {
      await this.materialService.crearAlmacen(almacen).toPromise();
    }
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  // ============================================================================
  // MÉTODOS CRUD SEGÚN REGLA DE ORO
  // ============================================================================
  agregar(): void {
    const config = AlmacenesConfig.getConfiguracionFormulario(false);
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: config,
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        this.materialService.crearAlmacen(resultado.datos).subscribe(() => {
          this.cargarAlmacenes();
        });
      }
    });
  }

  editar(almacen: Almacen): void {
    const config = AlmacenesConfig.getConfiguracionFormulario(true, almacen);
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: config,
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        const almacenActualizado = {
          ...resultado.datos,
          id_almacen: almacen.id_almacen,
        };
        this.materialService
          .actualizarAlmacen(almacenActualizado)
          .subscribe(() => {
            this.cargarAlmacenes();
          });
      }
    });
  }

  verDetalle(almacen: Almacen): void {
    const config = AlmacenesConfig.getConfiguracionDetalle(almacen);
    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: config,
    });
  }

  eliminar(almacen: Almacen): void {
    const config = ConfirmacionConfig.eliminarAlmacen(almacen);
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      disableClose: true,
      data: config,
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && almacen.id_almacen) {
        this.materialService.eliminarAlmacen(almacen.id_almacen).subscribe({
          next: () => {
            console.log('✅ Almacén eliminado exitosamente');
            this.cargarAlmacenes();
          },
          error: (error: any) => {
            console.error('❌ Error al eliminar almacén:', error);
          },
        });
      }
    });
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }
}

export { AlmacenesComponent as Almacenes };
