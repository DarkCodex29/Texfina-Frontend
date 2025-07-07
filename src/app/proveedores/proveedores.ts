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
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { ProveedoresConfig } from '../shared/configs/proveedores-config';
import {
  ExportacionService,
  ConfiguracionExportacion,
  ColumnaExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
  MapeoColumna,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';

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
  dropdownExportAbierto: boolean = false;

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
    private fb: FormBuilder,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
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
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: ProveedoresConfig.formulario(false),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.accion === 'guardar') {
        this.guardarProveedor(result.datos);
      }
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<Proveedor> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'proveedores',
      nombreEntidad: 'Proveedores',
      columnas: [
        { campo: 'id_proveedor', titulo: 'ID', formato: 'numero' },
        { campo: 'empresa', titulo: 'Empresa', formato: 'texto' },
        { campo: 'ruc', titulo: 'RUC', formato: 'texto' },
        { campo: 'contacto', titulo: 'Contacto', formato: 'texto' },
        { campo: 'direccion', titulo: 'Dirección', formato: 'texto' },
        { campo: 'created_at', titulo: 'Fecha Creación', formato: 'fecha' },
        {
          campo: 'updated_at',
          titulo: 'Última Actualización',
          formato: 'fecha',
        },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.proveedores.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Proveedor> {
    return {
      tipoEntidad: 'proveedores',
      mapeoColumnas: [
        {
          columnaArchivo: 'Empresa',
          campoEntidad: 'empresa',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'RUC',
          campoEntidad: 'ruc',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Contacto',
          campoEntidad: 'contacto',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Dirección',
          campoEntidad: 'direccion',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'ruc',
          validador: (valor) => valor && valor.length <= 20,
          mensajeError: 'El RUC debe tener máximo 20 caracteres',
        },
        {
          campo: 'empresa',
          validador: (valor) => valor && valor.length <= 200,
          mensajeError: 'La empresa debe tener máximo 200 caracteres',
        },
        {
          campo: 'contacto',
          validador: (valor) => !valor || valor.length <= 200,
          mensajeError: 'El contacto debe tener máximo 200 caracteres',
        },
        {
          campo: 'direccion',
          validador: (valor) => !valor || valor.length <= 500,
          mensajeError: 'La dirección debe tener máximo 500 caracteres',
        },
      ],
    };
  }

  private obtenerFiltrosActivos(): any {
    const filtroGeneral = this.filtroGeneralForm.get('busquedaGeneral')?.value;
    const filtrosColumna = this.filtrosColumnaForm.value;

    return {
      busquedaGeneral: filtroGeneral || null,
      ...filtrosColumna,
    };
  }

  exportarExcel(): void {
    try {
      const config = this.configurarExportacion();
      this.exportacionService.exportarExcel(config);
      this.dropdownExportAbierto = false;
    } catch (error) {
      console.error('Error al exportar Excel:', error);
    }
  }

  exportarPDF(): void {
    try {
      const config = this.configurarExportacion();
      this.exportacionService.exportarPDF(config);
      this.dropdownExportAbierto = false;
    } catch (error) {
      console.error('Error al exportar PDF:', error);
    }
  }

  cargaMasiva(): void {
    const dialogRef = this.dialog.open(CargaMasivaDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        configuracion: this.configurarCargaMasiva(),
        onDescargarPlantilla: () => this.descargarPlantillaCargaMasiva(),
        onProcesarArchivo: (archivo: File) =>
          this.procesarArchivoCargaMasiva(archivo),
      },
    });
  }

  descargarPlantillaCargaMasiva(): void {
    try {
      const config = this.configurarCargaMasiva();
      this.cargaMasivaService.generarPlantilla(config);
    } catch (error) {
      console.error('Error al generar plantilla:', error);
    }
  }

  async procesarArchivoCargaMasiva(archivo: File): Promise<void> {
    try {
      const config = this.configurarCargaMasiva();
      const resultado = await this.cargaMasivaService.procesarArchivo(
        archivo,
        config
      );

      if (resultado.exitosa) {
        await this.guardarProveedoresMasivos(resultado.entidadesValidas);
        console.log(
          `✅ ${resultado.registrosValidos} registros procesados exitosamente`
        );
        this.cargarProveedores();
      } else {
        console.log('❌ Errores en el archivo:', resultado.errores);
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
    }
  }

  private async guardarProveedoresMasivos(
    proveedores: Proveedor[]
  ): Promise<void> {
    for (const proveedor of proveedores) {
      await this.materialService.crearProveedor(proveedor).toPromise();
    }
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  async guardarProveedor(datos: any): Promise<any> {
    try {
      const resultado = await this.materialService
        .crearProveedor(datos)
        .toPromise();
      this.cargarProveedores();
      return resultado;
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      throw error;
    }
  }

  async actualizarProveedor(id: number, datos: any): Promise<any> {
    try {
      const proveedorActualizado = { ...datos, id_proveedor: id };
      const resultado = await this.materialService
        .actualizarProveedor(proveedorActualizado)
        .toPromise();
      this.cargarProveedores();
      return resultado;
    } catch (error) {
      console.error('Error al actualizar proveedor:', error);
      throw error;
    }
  }

  agregar(): void {
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: ProveedoresConfig.formulario(false),
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        this.guardarProveedor(resultado.datos);
      }
    });
  }

  editar(proveedor: Proveedor): void {
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: ProveedoresConfig.formulario(true, proveedor),
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar' && proveedor.id_proveedor) {
        this.actualizarProveedor(proveedor.id_proveedor, resultado.datos);
      }
    });
  }

  verDetalle(proveedor: Proveedor): void {
    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: ProveedoresConfig.detalle(proveedor),
    });
  }

  eliminar(proveedor: Proveedor): void {
    const empresa = proveedor.empresa || `Proveedor ${proveedor.id_proveedor}`;
    const config = ProveedoresConfig.eliminarProveedor(empresa);

    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '400px',
      disableClose: true,
      data: { config },
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && proveedor.id_proveedor) {
        this.materialService
          .eliminarProveedor(proveedor.id_proveedor)
          .subscribe({
            next: () => {
              console.log('✅ Proveedor eliminado exitosamente');
              this.cargarProveedores();
            },
            error: (error: any) => {
              console.error('❌ Error al eliminar proveedor:', error);
            },
          });
      }
    });
  }
}
