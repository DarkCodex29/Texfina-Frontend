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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, MatSort } from '@angular/material/sort';
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
import { Proveedor } from '../models/insumo.model';
import { DetalleProveedorDialogComponent } from './detalle-proveedor-dialog/detalle-proveedor-dialog';
import { EditarProveedorDialogComponent } from './editar-proveedor-dialog/editar-proveedor-dialog';

@Component({
  selector: 'app-proveedores',
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
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss'],
})
export class ProveedoresComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  proveedores: Proveedor[] = [];
  dataSource = new MatTableDataSource<Proveedor>([]);
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
    'empresa',
    'ruc',
    'contacto',
    'direccion',
    'acciones',
  ];

  get proveedoresFiltrados(): Proveedor[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.proveedores.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.proveedores.length > 0
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
      empresa: [''],
      ruc: [''],
      contacto: [''],
      direccion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
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

  cargarProveedores(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log(
      '🔄 Iniciando carga de proveedores - isLoading:',
      this.isLoading
    );

    this.materialService
      .getProveedores()
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
        next: (proveedores) => {
          console.log('🏢 Proveedores cargados:', proveedores.length);
          this.proveedores = proveedores;
          this.dataSource.data = [...proveedores];
        },
        error: (error) => {
          console.error('❌ Error al cargar proveedores:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar los proveedores. Por favor, intenta nuevamente.';
          this.proveedores = [];
          this.dataSource.data = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarProveedores();
  }

  aplicarFiltroGeneral(): void {
    const busqueda = this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.value?.trim()
      .toLowerCase();

    if (!busqueda) {
      this.dataSource.data = [...this.proveedores];
      return;
    }

    const proveedoresFiltrados = this.proveedores.filter((proveedor) => {
      const empresa = proveedor.empresa?.toLowerCase() || '';
      const ruc = proveedor.ruc?.toLowerCase() || '';
      const contacto = proveedor.contacto?.toLowerCase() || '';
      const direccion = proveedor.direccion?.toLowerCase() || '';

      return (
        empresa.includes(busqueda) ||
        ruc.includes(busqueda) ||
        contacto.includes(busqueda) ||
        direccion.includes(busqueda)
      );
    });

    this.dataSource.data = proveedoresFiltrados;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let proveedoresFiltrados = [...this.proveedores];

    // Filtro por Empresa
    if (filtros.empresa && filtros.empresa.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.empresa?.toLowerCase().includes(filtros.empresa.toLowerCase())
      );
    }

    // Filtro por RUC
    if (filtros.ruc && filtros.ruc.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.ruc?.toLowerCase().includes(filtros.ruc.toLowerCase())
      );
    }

    // Filtro por Contacto
    if (filtros.contacto && filtros.contacto.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.contacto
          ?.toLowerCase()
          .includes(filtros.contacto.toLowerCase())
      );
    }

    // Filtro por Dirección
    if (filtros.direccion && filtros.direccion.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.direccion
          ?.toLowerCase()
          .includes(filtros.direccion.toLowerCase())
      );
    }

    this.dataSource.data = proveedoresFiltrados;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.proveedores];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.proveedores];
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

  abrirNuevoProveedor(): void {
    const dialogRef = this.dialog.open(EditarProveedorDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarProveedores();
      }
    });
  }

  verDetalle(proveedor: Proveedor): void {
    this.dialog.open(DetalleProveedorDialogComponent, {
      width: '600px',
      data: proveedor,
    });
  }

  editarProveedor(proveedor: Proveedor): void {
    const dialogRef = this.dialog.open(EditarProveedorDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { proveedor, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarProveedores();
      }
    });
  }
}
