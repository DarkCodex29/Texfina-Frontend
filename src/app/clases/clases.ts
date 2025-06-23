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
import { Clase } from '../models/insumo.model';
import { EditarClaseDialogComponent } from './editar-clase-dialog/editar-clase-dialog';
import { DetalleClaseDialogComponent } from './detalle-clase-dialog/detalle-clase-dialog';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  delay,
  finalize,
} from 'rxjs';

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
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosExpanded = true;
  filtrosColumnaHabilitados = false;
  filtrosColumnaActivos = false;
  private destroy$ = new Subject<void>();

  // Estados de carga y error
  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  displayedColumns: string[] = [
    'id_clase',
    'familia',
    'sub_familia',
    'acciones',
  ];

  get clasesFiltradas(): Clase[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.clases.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.clases.length > 0
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
      codigo: [''],
      familia: [''],
      sub_familia: [''],
    });
  }

  ngOnInit(): void {
    this.cargarClases();
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

  cargarClases(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de clases - isLoading:', this.isLoading);

    this.materialService
      .getClases()
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
        next: (clases) => {
          console.log('📦 Clases cargadas:', clases.length);
          this.clases = clases;
          this.dataSource.data = [...clases];
        },
        error: (error) => {
          console.error('❌ Error al cargar clases:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar las clases. Por favor, intenta nuevamente.';
          this.clases = [];
          this.dataSource.data = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarClases();
  }

  aplicarFiltroGeneral(): void {
    const busqueda = this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.value?.trim()
      .toLowerCase();

    if (!busqueda) {
      this.dataSource.data = [...this.clases];
      return;
    }

    const clasesFiltradas = this.clases.filter((clase) => {
      const codigo = clase.id_clase?.toLowerCase() || '';
      const familia = clase.familia?.toLowerCase() || '';
      const subfamilia = clase.sub_familia?.toLowerCase() || '';

      return (
        codigo.includes(busqueda) ||
        familia.includes(busqueda) ||
        subfamilia.includes(busqueda)
      );
    });

    this.dataSource.data = clasesFiltradas;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
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

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.clases];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.clases];
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

  toggleFiltros() {
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
