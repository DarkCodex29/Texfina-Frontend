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
import { Clase } from '../models/insumo.model';
import { EditarClaseDialogComponent } from './editar-clase-dialog/editar-clase-dialog';
import { DetalleClaseDialogComponent } from './detalle-clase-dialog/detalle-clase-dialog';
import { Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  delay,
  finalize,
} from 'rxjs/operators';

@Component({
  selector: 'app-clases',
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
  templateUrl: './clases.html',
  styleUrls: ['./clases.scss'],
})
export class ClasesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  clases: Clase[] = [];
  dataSource = new MatTableDataSource<Clase>([]);
  filtrosForm: FormGroup;
  filtrosExpanded: boolean = true;
  private destroy$ = new Subject<void>();

  // Estados de la aplicación
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  displayedColumns: string[] = ['codigo', 'familia', 'sub_familia', 'acciones'];

  get clasesFiltradas(): Clase[] {
    return this.dataSource.data;
  }

  // Estados computados
  get isEmpty(): boolean {
    return !this.isLoading && !this.hasError && this.clases.length === 0;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      !this.hasError &&
      this.clases.length > 0 &&
      this.dataSource.data.length === 0
    );
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      codigo: [''],
      familia: [''],
      sub_familia: [''],
    });
  }

  ngOnInit(): void {
    this.cargarClases();
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

  cargarClases(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    this.materialService
      .getClases()
      .pipe(
        delay(800), // Remover en producción - solo para demostrar skeleton
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (clases) => {
          this.clases = clases;
          this.dataSource.data = [...clases];
        },
        error: (error) => {
          console.error('Error al cargar clases:', error);
          this.hasError = true;
          this.errorMessage =
            error?.message ||
            'Error al cargar los datos de clases. Verifique su conexión e intente nuevamente.';
          this.clases = [];
          this.dataSource.data = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarClases();
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let clasesFiltradas = [...this.clases];

    // Filtro por Código
    if (filtros.codigo && filtros.codigo.trim()) {
      clasesFiltradas = clasesFiltradas.filter((clase) =>
        clase.id_clase?.toLowerCase().includes(filtros.codigo.toLowerCase())
      );
    }

    // Filtro por Familia
    if (filtros.familia && filtros.familia.trim()) {
      clasesFiltradas = clasesFiltradas.filter((clase) =>
        clase.familia?.toLowerCase().includes(filtros.familia.toLowerCase())
      );
    }

    // Filtro por Subfamilia
    if (filtros.sub_familia && filtros.sub_familia.trim()) {
      clasesFiltradas = clasesFiltradas.filter((clase) =>
        clase.sub_familia
          ?.toLowerCase()
          .includes(filtros.sub_familia.toLowerCase())
      );
    }

    this.dataSource.data = clasesFiltradas;
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.dataSource.data = [...this.clases];
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

  abrirNuevaClase(): void {
    const dialogRef = this.dialog.open(EditarClaseDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarClases();
      }
    });
  }

  verDetalle(clase: Clase): void {
    this.dialog.open(DetalleClaseDialogComponent, {
      width: '600px',
      data: clase,
    });
  }

  editarClase(clase: Clase): void {
    const dialogRef = this.dialog.open(EditarClaseDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { clase, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarClases();
      }
    });
  }
}

export { ClasesComponent as Clases };
