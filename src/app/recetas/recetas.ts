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
import { Receta, Insumo } from '../models/insumo.model';

@Component({
  selector: 'app-recetas',
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
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss'],
})
export class RecetasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  // ============================================================================
  // PROPIEDADES DE DATOS
  // ============================================================================
  recetas: Receta[] = [];
  dataSource = new MatTableDataSource<Receta>([]);
  insumos: Insumo[] = [];

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
  isLoadingInsumos = false;
  hasError = false;
  errorMessage = '';

  // ============================================================================
  // CONFIGURACIÓN DE TABLA
  // ============================================================================
  displayedColumns: string[] = [
    'id_receta',
    'nombre',
    'ingredientes',
    'estado',
    'acciones',
  ];

  get recetasFiltradas(): Receta[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.recetas.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.recetas.length > 0
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
      codigoReceta: [''],
      nombre: [''],
      ingredientes: [''],
      estado: [''],
    });
  }

  ngOnInit(): void {
    this.cargarRecetas();
    this.cargarInsumos();
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
  cargarRecetas(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de recetas - isLoading:', this.isLoading);

    this.materialService
      .getRecetas()
      .pipe(
        delay(1500),
        finalize(() => {
          this.isLoading = false;
          console.log('✅ Carga completada - isLoading:', this.isLoading);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (recetas) => {
          console.log('📋 Recetas cargadas:', recetas.length);
          this.recetas = recetas;
          this.dataSource.data = [...recetas];
        },
        error: (error) => {
          console.error('❌ Error al cargar recetas:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar las recetas. Por favor, intenta nuevamente.';
          this.recetas = [];
          this.dataSource.data = [];
        },
      });
  }

  cargarInsumos(): void {
    this.isLoadingInsumos = true;

    this.materialService
      .getMateriales()
      .pipe(
        delay(1000),
        finalize(() => {
          this.isLoadingInsumos = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (insumos) => {
          this.insumos = insumos;
        },
        error: (error) => {
          console.error('Error al cargar insumos:', error);
          this.insumos = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarRecetas();
    this.cargarInsumos();
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
      this.dataSource.data = [...this.recetas];
      return;
    }

    const recetasFiltradas = this.recetas.filter((receta) => {
      const codigo = this.formatearCodigo(receta.id_receta).toLowerCase();
      const nombre = receta.nombre?.toLowerCase() || '';
      const ingredientesCount = this.getIngredientesCount(receta).toString();
      const estado = this.getEstadoReceta(receta).toLowerCase();

      return (
        codigo.includes(busqueda) ||
        nombre.includes(busqueda) ||
        ingredientesCount.includes(busqueda) ||
        estado.includes(busqueda)
      );
    });

    this.dataSource.data = recetasFiltradas;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let recetasFiltradas = [...this.recetas];

    // Filtro por Código Receta
    if (filtros.codigoReceta && filtros.codigoReceta.trim()) {
      recetasFiltradas = recetasFiltradas.filter((receta) =>
        this.formatearCodigo(receta.id_receta)
          .toLowerCase()
          .includes(filtros.codigoReceta.toLowerCase())
      );
    }

    // Filtro por Nombre
    if (filtros.nombre && filtros.nombre.trim()) {
      recetasFiltradas = recetasFiltradas.filter((receta) =>
        receta.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    // Filtro por Número de Ingredientes
    if (filtros.ingredientes && filtros.ingredientes.toString().trim()) {
      const ingredientesFiltro = parseFloat(filtros.ingredientes);
      if (!isNaN(ingredientesFiltro)) {
        recetasFiltradas = recetasFiltradas.filter((receta) => {
          const count = this.getIngredientesCount(receta);
          return (
            count >= ingredientesFiltro - 0.01 &&
            count <= ingredientesFiltro + 0.01
          );
        });
      }
    }

    // Filtro por Estado
    if (filtros.estado && filtros.estado.trim()) {
      recetasFiltradas = recetasFiltradas.filter((receta) => {
        const estado = this.getEstadoReceta(receta);
        return estado.toLowerCase().includes(filtros.estado.toLowerCase());
      });
    }

    this.dataSource.data = recetasFiltradas;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.recetas];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.recetas];
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
  abrirRegistroReceta(): void {
    console.log('➕ Abriendo formulario para nueva receta');
    // TODO: Implementar dialog para crear nueva receta
  }

  abrirIngresoReceta(): void {
    console.log('📥 Abriendo formulario para ingreso de receta');
    // TODO: Implementar dialog para ingreso de receta
  }

  verDetalle(receta: Receta): void {
    console.log('👁️ Ver detalle de receta:', receta.nombre);
    // TODO: Implementar dialog de detalle de receta
  }

  editarReceta(receta: Receta): void {
    console.log('✏️ Editando receta:', receta.nombre);
    // TODO: Implementar dialog de edición de receta
  }

  // ============================================================================
  // MÉTODOS UTILITARIOS
  // ============================================================================
  formatearCodigo(id?: number): string {
    if (!id) return 'REC-0000';
    return `REC-${id.toString().padStart(4, '0')}`;
  }

  getIngredientesCount(receta: Receta): number {
    return receta.detalles?.length || 0;
  }

  getEstadoReceta(receta: Receta): string {
    const count = receta.detalles?.length || 0;
    return count > 0 ? 'Activa' : 'Vacía';
  }
}
