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
import { EditarAlmacenDialogComponent } from './editar-almacen-dialog/editar-almacen-dialog';
import { DetalleAlmacenDialogComponent } from './detalle-almacen-dialog/detalle-almacen-dialog';
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
    private fb: FormBuilder
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
  // MÉTODOS DE ACCIONES
  // ============================================================================
  abrirNuevoAlmacen(): void {
    const dialogRef = this.dialog.open(EditarAlmacenDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarAlmacenes();
      }
    });
  }

  verDetalle(almacen: Almacen): void {
    this.dialog.open(DetalleAlmacenDialogComponent, {
      width: '600px',
      data: almacen,
    });
  }

  editarAlmacen(almacen: Almacen): void {
    const dialogRef = this.dialog.open(EditarAlmacenDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { almacen, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarAlmacenes();
      }
    });
  }

  // ============================================================================
  // MÉTODOS UTILITARIOS
  // ============================================================================
  formatearCodigo(id?: number): string {
    if (!id) return '00000';
    return id.toString().padStart(5, '0');
  }
}

export { AlmacenesComponent as Almacenes };
