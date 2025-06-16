import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
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

  recetas: Receta[] = [];
  dataSource = new MatTableDataSource<Receta>([]);
  insumos: Insumo[] = [];
  filtrosForm: FormGroup;
  filtrosExpanded: boolean = true;
  private destroy$ = new Subject<void>();

  // Estados de carga y error
  isLoading: boolean = false;
  isLoadingInsumos: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

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
    this.filtrosForm = this.fb.group({
      codigoReceta: [''],
      nombre: [''],
      ingredientes: [''],
      estado: [''],
    });
  }

  ngOnInit(): void {
    this.cargarRecetas();
    this.cargarInsumos();
    this.configurarFiltrosEnTiempoReal();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  configurarFiltrosEnTiempoReal(): void {
    this.filtrosForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  cargarRecetas(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de recetas - isLoading:', this.isLoading);

    this.materialService
      .getRecetas()
      .pipe(
        // Delay artificial para demostrar el skeleton (remover en producción)
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
        // Delay artificial para demostrar el skeleton (remover en producción)
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

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let recetasFiltradas = [...this.recetas];

    // Filtro por Código Receta
    if (filtros.codigoReceta && filtros.codigoReceta.trim()) {
      recetasFiltradas = recetasFiltradas.filter((receta) =>
        receta.id_receta
          ?.toString()
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
          const count = receta.detalles?.length || 0;
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

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.dataSource.data = [...this.recetas];
  }

  toggleFiltros(): void {
    this.filtrosExpanded = !this.filtrosExpanded;
  }

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

  abrirRegistroReceta(): void {
    console.log('➕ Abriendo formulario para nueva receta');
    // TODO: Implementar dialog para crear nueva receta
    // const dialogRef = this.dialog.open(RegistroRecetaDialogComponent, {
    //   width: '800px',
    //   disableClose: true,
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.cargarRecetas();
    //   }
    // });
  }

  abrirIngresoReceta(): void {
    console.log('📥 Abriendo formulario para ingreso de receta');
    // TODO: Implementar dialog para ingreso de receta
    // const dialogRef = this.dialog.open(IngresoRecetaDialogComponent, {
    //   width: '700px',
    //   disableClose: true,
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     // Actualizar stock o datos necesarios
    //     console.log('Ingreso registrado:', result);
    //   }
    // });
  }

  verDetalle(receta: Receta): void {
    console.log('👁️ Ver detalle de receta:', receta.nombre);
    // TODO: Implementar dialog de detalle de receta
    // this.dialog.open(DetalleRecetaDialogComponent, {
    //   width: '800px',
    //   data: receta,
    // });
  }

  editarReceta(receta: Receta): void {
    console.log('✏️ Editando receta:', receta.nombre);
    // TODO: Implementar dialog de edición de receta
    // const dialogRef = this.dialog.open(RegistroRecetaDialogComponent, {
    //   width: '800px',
    //   data: { receta, esEdicion: true },
    //   disableClose: true,
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result) {
    //     this.cargarRecetas();
    //   }
    // });
  }

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
