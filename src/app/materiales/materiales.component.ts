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
import { Insumo } from '../models/insumo.model';
import { RegistroMaterialDialogComponent } from './registro-material-dialog/registro-material-dialog.component';
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
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosExpanded = true;
  filtrosColumnaHabilitados = false;
  filtrosColumnaActivos = false;
  dropdownExportAbierto = false;
  private destroy$ = new Subject<void>();

  // Estados de carga y error
  isLoading: boolean = false;
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
    this.filtroGeneralForm = this.fb.group({
      busquedaGeneral: [''],
    });

    this.filtrosColumnaForm = this.fb.group({
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

  reintentarCarga(): void {
    this.cargarMateriales();
  }

  aplicarFiltroGeneral(): void {
    const busqueda = this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.value?.trim()
      .toLowerCase();

    if (!busqueda) {
      this.dataSource.data = [...this.materiales];
      return;
    }

    const materialesFiltrados = this.materiales.filter((material) => {
      const codigo = material.id_fox?.toLowerCase() || '';
      const nombre = material.nombre?.toLowerCase() || '';
      const unidad =
        material.unidad?.nombre?.toLowerCase() ||
        material.id_unidad?.toString().toLowerCase() ||
        '';
      const presentacion = material.presentacion?.toLowerCase() || '';
      const precio = material.precio_unitario?.toString() || '';
      const peso = material.peso_unitario?.toString() || '';

      return (
        codigo.includes(busqueda) ||
        nombre.includes(busqueda) ||
        unidad.includes(busqueda) ||
        presentacion.includes(busqueda) ||
        precio.includes(busqueda) ||
        peso.includes(busqueda)
      );
    });

    this.dataSource.data = materialesFiltrados;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
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

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.materiales];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.materiales];
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

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  // ============================================================================
  // MÉTODOS PARA CARGA MASIVA Y EXPORTACIÓN
  // ============================================================================

  abrirCargaMasiva(): void {
    console.log('🚀 Abrir carga masiva de insumos');
    // TODO: Implementar diálogo de carga masiva
    alert(
      'Funcionalidad de carga masiva próximamente disponible.\n\nPermitirá importar múltiples insumos desde Excel.'
    );
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  exportarExcel(): void {
    console.log('📊 Exportando a Excel...');
    this.dropdownExportAbierto = false;

    const datosExportacion = {
      materiales: this.materialesFiltrados,
      timestamp: new Date(),
      filtros: this.obtenerFiltrosActivos(),
    };

    console.log('Datos para exportar a Excel:', datosExportacion);
    alert(
      `📊 Exportando ${this.materialesFiltrados.length} insumos a Excel.\n\nFuncionalidad completa próximamente.`
    );
  }

  exportarPDF(): void {
    console.log('📄 Exportando a PDF...');
    this.dropdownExportAbierto = false;

    const datosExportacion = {
      materiales: this.materialesFiltrados,
      timestamp: new Date(),
      filtros: this.obtenerFiltrosActivos(),
    };

    console.log('Datos para exportar a PDF:', datosExportacion);
    alert(
      `📄 Exportando ${this.materialesFiltrados.length} insumos a PDF.\n\nFuncionalidad completa próximamente.`
    );
  }

  private obtenerFiltrosActivos(): any {
    return {
      busquedaGeneral:
        this.filtroGeneralForm.get('busquedaGeneral')?.value || '',
      filtrosColumna: this.filtrosColumnaForm.value,
      cantidadResultados: this.materialesFiltrados.length,
      cantidadTotal: this.materiales.length,
    };
  }

  // Cerrar dropdown al hacer click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.dropdownExportAbierto) {
      const target = event.target as HTMLElement;
      const dropdownElement = document.querySelector('.dropdown-export');

      if (dropdownElement && !dropdownElement.contains(target)) {
        this.dropdownExportAbierto = false;
      }
    }
  }
}
