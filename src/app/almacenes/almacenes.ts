import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
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
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  delay,
  finalize,
} from 'rxjs/operators';

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

  almacenes: Almacen[] = [];
  dataSource = new MatTableDataSource<Almacen>([]);
  filtrosForm: FormGroup;
  filtrosExpanded: boolean = true;
  private destroy$ = new Subject<void>();

  // Estados de la aplicación
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  displayedColumns: string[] = [
    'id_almacen',
    'nombre',
    'ubicacion',
    'acciones',
  ];

  get almacenesFiltrados(): Almacen[] {
    return this.dataSource.data;
  }

  // Estados computados
  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.almacenes.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      !this.hasError &&
      this.almacenes.length > 0 &&
      this.dataSource.data.length === 0
    );
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      idAlmacen: [''],
      nombre: [''],
      ubicacion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarAlmacenes();
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

  cargarAlmacenes(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.materialService
      .getAlmacenes()
      .pipe(
        delay(800), // Remover en producción - solo para demostrar skeleton
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (almacenes) => {
          this.almacenes = almacenes;
          this.dataSource.data = [...almacenes];
        },
        error: (error) => {
          console.error('Error al cargar almacenes:', error);
          this.hasError = true;
          this.errorMessage =
            error?.message ||
            'Error al cargar los datos de almacenes. Verifique su conexión e intente nuevamente.';
          this.almacenes = [];
          this.dataSource.data = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarAlmacenes();
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
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

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.dataSource.data = [...this.almacenes];
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

  formatearCodigo(id?: number): string {
    if (!id) return '00000';
    return id.toString().padStart(5, '0');
  }

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
}

export { AlmacenesComponent as Almacenes };
