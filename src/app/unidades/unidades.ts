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
  filtrosForm: FormGroup;
  filtrosExpanded: boolean = true;
  private destroy$ = new Subject<void>();

  // Estados de carga y error
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

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
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      id_unidad: [''],
      nombre: [''],
    });
  }

  ngOnInit(): void {
    this.cargarUnidades();
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

  cargarUnidades(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de unidades - isLoading:', this.isLoading);

    this.materialService
      .getUnidades()
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

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let unidadesFiltradas = [...this.unidades];

    // Filtro por Código
    if (filtros.id_unidad && filtros.id_unidad.trim()) {
      unidadesFiltradas = unidadesFiltradas.filter((unidad) =>
        unidad.id_unidad
          ?.toLowerCase()
          .includes(filtros.id_unidad.toLowerCase())
      );
    }

    // Filtro por Nombre
    if (filtros.nombre && filtros.nombre.trim()) {
      unidadesFiltradas = unidadesFiltradas.filter((unidad) =>
        unidad.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    this.dataSource.data = unidadesFiltradas;
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.dataSource.data = [...this.unidades];
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

  abrirNuevaUnidad(): void {
    const dialogRef = this.dialog.open(EditarUnidadDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarUnidades();
      }
    });
  }

  verDetalle(unidad: Unidad): void {
    this.dialog.open(DetalleUnidadDialogComponent, {
      width: '500px',
      data: unidad,
    });
  }

  editarUnidad(unidad: Unidad): void {
    const dialogRef = this.dialog.open(EditarUnidadDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { unidad, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarUnidades();
      }
    });
  }
}

export { UnidadesComponent as Unidades };
