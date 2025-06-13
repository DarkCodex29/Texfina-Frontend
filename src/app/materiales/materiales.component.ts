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
import { Insumo, Proveedor } from '../models/insumo.model';
import { RegistroMaterialDialogComponent } from './registro-material-dialog/registro-material-dialog.component';
import { IngresoMaterialDialogComponent } from './ingreso-material-dialog/ingreso-material-dialog.component';
import { DetalleMaterialDialogComponent } from './detalle-material-dialog/detalle-material-dialog.component';

@Component({
  selector: 'app-materiales',
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
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss'],
})
export class MaterialesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  materiales: Insumo[] = [];
  dataSource = new MatTableDataSource<Insumo>([]);
  proveedores: Proveedor[] = [];
  filtrosForm: FormGroup;
  filtrosExpanded: boolean = true;
  private destroy$ = new Subject<void>();

  // Estados de carga y error
  isLoading: boolean = false;
  isLoadingProveedores: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';

  displayedColumns: string[] = [
    'id_fox',
    'nombre',
    'peso_unitario',
    'id_unidad',
    'presentacion',
    'precio_unitario',
    'acciones',
  ];

  get materialesFiltrados(): Insumo[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.materiales.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.materiales.length > 0
    );
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      codigoFox: [''],
      nombre: [''],
      pesoUnitario: [''],
      unidad: [''],
      presentacion: [''],
      precioUnitario: [''],
    });
  }

  ngOnInit(): void {
    this.cargarMateriales();
    this.cargarProveedores();
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

  cargarMateriales(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log(
      '🔄 Iniciando carga de materiales - isLoading:',
      this.isLoading
    );

    this.materialService
      .getMateriales()
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
        next: (materiales) => {
          console.log('📦 Materiales cargados:', materiales.length);
          this.materiales = materiales;
          this.dataSource.data = [...materiales];
        },
        error: (error) => {
          console.error('❌ Error al cargar materiales:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar los materiales. Por favor, intenta nuevamente.';
          this.materiales = [];
          this.dataSource.data = [];
        },
      });
  }

  cargarProveedores(): void {
    this.isLoadingProveedores = true;

    this.materialService
      .getProveedores()
      .pipe(
        // Delay artificial para demostrar el skeleton (remover en producción)
        delay(1000),
        finalize(() => {
          this.isLoadingProveedores = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (proveedores) => {
          this.proveedores = proveedores;
        },
        error: (error) => {
          console.error('Error al cargar proveedores:', error);
          this.proveedores = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarMateriales();
    this.cargarProveedores();
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let materialesFiltrados = [...this.materiales];

    // Filtro por Código Fox
    if (filtros.codigoFox && filtros.codigoFox.trim()) {
      materialesFiltrados = materialesFiltrados.filter((material) =>
        material.id_fox?.toLowerCase().includes(filtros.codigoFox.toLowerCase())
      );
    }

    // Filtro por Nombre
    if (filtros.nombre && filtros.nombre.trim()) {
      materialesFiltrados = materialesFiltrados.filter((material) =>
        material.nombre?.toLowerCase().includes(filtros.nombre.toLowerCase())
      );
    }

    // Filtro por Peso Unitario
    if (filtros.pesoUnitario && filtros.pesoUnitario.toString().trim()) {
      const pesoFiltro = parseFloat(filtros.pesoUnitario);
      if (!isNaN(pesoFiltro)) {
        materialesFiltrados = materialesFiltrados.filter((material) => {
          const peso = material.peso_unitario || 0;
          return peso >= pesoFiltro - 0.01 && peso <= pesoFiltro + 0.01;
        });
      }
    }

    // Filtro por Unidad
    if (filtros.unidad && filtros.unidad.trim()) {
      materialesFiltrados = materialesFiltrados.filter((material) => {
        const unidadNombre =
          material.unidad?.nombre || material.id_unidad?.toString() || '';
        return unidadNombre
          .toLowerCase()
          .includes(filtros.unidad.toLowerCase());
      });
    }

    // Filtro por Presentación
    if (filtros.presentacion && filtros.presentacion.trim()) {
      materialesFiltrados = materialesFiltrados.filter((material) =>
        material.presentacion
          ?.toLowerCase()
          .includes(filtros.presentacion.toLowerCase())
      );
    }

    // Filtro por Precio Unitario
    if (filtros.precioUnitario && filtros.precioUnitario.toString().trim()) {
      const precioFiltro = parseFloat(filtros.precioUnitario);
      if (!isNaN(precioFiltro)) {
        materialesFiltrados = materialesFiltrados.filter((material) => {
          const precio = material.precio_unitario || 0;
          return precio >= precioFiltro - 0.01 && precio <= precioFiltro + 0.01;
        });
      }
    }

    this.dataSource.data = materialesFiltrados;
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.dataSource.data = [...this.materiales];
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

  abrirRegistroMaterial(): void {
    const dialogRef = this.dialog.open(RegistroMaterialDialogComponent, {
      width: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarMateriales();
      }
    });
  }

  abrirIngresoMaterial(): void {
    const dialogRef = this.dialog.open(IngresoMaterialDialogComponent, {
      width: '700px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Actualizar stock o datos necesarios
        console.log('Ingreso registrado:', result);
      }
    });
  }

  abrirAgregarLote(): void {
    // Implementar modal para agregar lote
    console.log('Abrir modal de agregar lote');
  }

  verDetalle(material: Insumo): void {
    this.dialog.open(DetalleMaterialDialogComponent, {
      width: '800px',
      data: material,
    });
  }

  editarMaterial(material: Insumo): void {
    const dialogRef = this.dialog.open(RegistroMaterialDialogComponent, {
      width: '800px',
      data: { material, esEdicion: true },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarMateriales();
      }
    });
  }

  getProveedoresNombres(material: Insumo): string {
    if (!material.proveedores || material.proveedores.length === 0) return '-';

    const nombres = material.proveedores.map((insumoProveedor) => {
      const proveedor = this.proveedores.find(
        (p) => p.id_proveedor === insumoProveedor.id_proveedor
      );
      return proveedor?.empresa || 'Proveedor desconocido';
    });

    return nombres.join(', ');
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}
