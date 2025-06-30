import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  finalize,
  delay,
} from 'rxjs';
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
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';
import { Unidad } from '../models/insumo.model';
import { EditarUnidadDialogComponent } from './editar-unidad-dialog/editar-unidad-dialog';
import { DetalleUnidadDialogComponent } from './detalle-unidad-dialog/detalle-unidad-dialog';

@Component({
  selector: 'app-unidades',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDialogModule,
    MatPaginatorModule,
    MatCardModule,
    MatSortModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './unidades.html',
  styleUrls: ['./unidades.scss'],
})
export class UnidadesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  unidades: Unidad[] = [];
  dataSource = new MatTableDataSource<Unidad>([]);
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosExpanded = true;
  filtrosColumnaHabilitados = false;
  filtrosColumnaActivos = false;
  private destroy$ = new Subject<void>();

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  dropdownExportAbierto: boolean = false;

  displayedColumns: string[] = ['id_unidad', 'nombre', 'acciones'];

  get unidadesFiltradas(): Unidad[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.unidades.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.unidades.length > 0
    );
  }

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({ busquedaGeneral: [''] });
    this.filtrosColumnaForm = this.fb.group({
      id_unidad: [''],
      nombre: [''],
    });
  }

  ngOnInit(): void {
    this.cargarUnidades();
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

  cargarUnidades(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de unidades - isLoading:', this.isLoading);

    this.materialService
      .getUnidades()
      .pipe(
        delay(1500),
        finalize(() => {
          this.isLoading = false;
          console.log('✅ Carga completada - isLoading:', this.isLoading);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (unidades) => {
          console.log('📦 Unidades cargadas:', unidades.length);
          this.unidades = unidades;
          this.dataSource.data = [...unidades];
        },
        error: (error) => {
          console.error('❌ Error al cargar unidades:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar las unidades. Por favor, intenta nuevamente.';
          this.unidades = [];
          this.dataSource.data = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarUnidades();
  }

  aplicarFiltroGeneral(): void {
    const busqueda = this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.value?.trim()
      .toLowerCase();

    if (!busqueda) {
      this.dataSource.data = [...this.unidades];
      return;
    }

    const unidadesFiltradas = this.unidades.filter((unidad) => {
      const codigo = unidad.id_unidad?.toLowerCase() || '';
      const nombre = unidad.nombre?.toLowerCase() || '';

      return codigo.includes(busqueda) || nombre.includes(busqueda);
    });

    this.dataSource.data = unidadesFiltradas;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let unidadesFiltradas = [...this.unidades];

    if (filtros.id_unidad && filtros.id_unidad.trim()) {
      unidadesFiltradas = unidadesFiltradas.filter((unidad) =>
        unidad.id_unidad
          ?.toLowerCase()
          .includes(filtros.id_unidad.toLowerCase())
      );
    }

    if (filtros.nombre && filtros.nombre.trim()) {
      unidadesFiltradas = unidadesFiltradas.filter((unidad) =>
        unidad.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    this.dataSource.data = unidadesFiltradas;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.unidades];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.unidades];
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

  sortData(column: string): void {
    if (this.sort) {
      if (this.sort.active === column) {
        this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sort.active = column;
        this.sort.direction = 'asc';
      }
      this.sort.sortChange.emit({
        active: this.sort.active,
        direction: this.sort.direction,
      });
    }
  }

  private configurarExportacion(): ConfiguracionExportacion<Unidad> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'unidades',
      nombreEntidad: 'Unidades',
      columnas: [
        { campo: 'id_unidad', titulo: 'Código', formato: 'texto' },
        { campo: 'nombre', titulo: 'Descripción', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.unidades.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Unidad> {
    return {
      tipoEntidad: 'unidades',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código',
          campoEntidad: 'id_unidad',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Descripción',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'id_unidad',
          validador: (valor) => valor && valor.length <= 50,
          mensajeError: 'El código debe tener máximo 50 caracteres',
        },
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'La descripción debe tener máximo 100 caracteres',
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
        await this.guardarUnidadesMasivas(resultado.entidadesValidas);
        console.log(
          `✅ ${resultado.registrosValidos} registros procesados exitosamente`
        );
        this.cargarUnidades();
      } else {
        console.log('❌ Errores en el archivo:', resultado.errores);
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
    }
  }

  private async guardarUnidadesMasivas(unidades: Unidad[]): Promise<void> {
    for (const unidad of unidades) {
      await this.materialService.crearUnidad(unidad).toPromise();
    }
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  agregar(): void {
    const dialogRef = this.dialog.open(EditarUnidadDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarUnidades();
      }
    });
  }

  editar(unidad: Unidad): void {
    const dialogRef = this.dialog.open(EditarUnidadDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: false, unidad: unidad },
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarUnidades();
      }
    });
  }

  verDetalle(unidad: Unidad): void {
    this.dialog.open(DetalleUnidadDialogComponent, {
      width: '800px',
      disableClose: true,
      data: { unidad: unidad },
    });
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-export')) {
      this.dropdownExportAbierto = false;
    }
  }
}

export { UnidadesComponent as Unidades };
