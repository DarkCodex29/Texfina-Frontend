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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
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
import { RecetasConfig } from '../shared/configs/recetas-config';
import {
  PrimeDataTableComponent,
  TableColumn,
  TableAction,
  TableButtonConfig,
} from '../shared/components/prime-data-table/prime-data-table.component';
import {
  ExportacionService,
  ConfiguracionExportacion,
  ColumnaExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
  MapeoColumna,
  ResultadoCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import {
  FormularioDialogComponent,
  ConfiguracionFormulario,
} from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import {
  DetalleDialogComponent,
  ConfiguracionDetalle,
} from '../shared/dialogs/detalle-dialog/detalle-dialog.component';

@Component({
  selector: 'app-recetas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './recetas.html',
  styleUrls: ['./recetas.scss'],
})
export class RecetasComponent implements OnInit, OnDestroy {
  // ============================================================================
  // PROPIEDADES DE DATOS
  // ============================================================================
  recetas: Receta[] = [];
  columns: TableColumn[] = RecetasConfig.getTableColumns();
  actions: TableAction[] = RecetasConfig.getTableActions();
  tableButtons: TableButtonConfig[] = [
    {
      label: 'Agregar Receta',
      icon: 'pi pi-plus',
      action: 'add',
      color: 'primary',
    },
    {
      label: 'Carga Masiva',
      icon: 'pi pi-upload',
      action: 'bulk-upload',
      color: 'secondary',
    },
  ];
  insumos: Insumo[] = [];

  dropdownExportAbierto = false;
  private destroy$ = new Subject<void>();

  // ============================================================================
  // PROPIEDADES DE ESTADO
  // ============================================================================
  isLoading = false;
  isLoadingInsumos = false;
  hasError = false;
  errorMessage = '';

  get isEmpty(): boolean {
    return !this.isLoading && this.recetas.length === 0 && !this.hasError;
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarRecetas();
    this.cargarInsumos();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
        },
        error: (error) => {
          console.error('❌ Error al cargar recetas:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar las recetas. Por favor, intenta nuevamente.';
          this.recetas = [];
        },
      });
  }

  cargarInsumos(): void {
    this.isLoadingInsumos = true;

    this.materialService
      .getMateriales()
      .pipe(
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
  // MÉTODOS DE ACCIONES DE TABLA
  // ============================================================================

  onButtonClick(action: string): void {
    switch (action) {
      case 'add':
        this.agregar();
        break;
      case 'bulk-upload':
        this.cargaMasiva();
        break;
      default:
        console.warn('Acción de botón no reconocida:', action);
    }
  }

  // ============================================================================
  // MÉTODOS DE EXPORTACIÓN
  // ============================================================================
  private configurarExportacion(): ConfiguracionExportacion<Receta> {
    return {
      entidades: this.recetas as any,
      nombreArchivo: 'recetas',
      nombreEntidad: 'Recetas',
      columnas: [
        { campo: 'id_receta', titulo: 'ID Receta', formato: 'numero' },
        { campo: 'nombre', titulo: 'Nombre', formato: 'texto' },
      ],
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: this.recetas.length,
        cantidadFiltrada: this.recetas.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Receta> {
    return {
      tipoEntidad: 'recetas',
      mapeoColumnas: [
        {
          columnaArchivo: 'Nombre',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length <= 200,
          mensajeError: 'El nombre debe tener máximo 200 caracteres',
        },
      ],
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

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarRecetas();
      }
    });
  }

  private descargarPlantillaCargaMasiva(): void {
    const config = this.configurarCargaMasiva();
    this.cargaMasivaService.generarPlantilla(config);
  }

  private procesarArchivoCargaMasiva(archivo: File): void {
    const config = this.configurarCargaMasiva();
    this.cargaMasivaService
      .procesarArchivo(archivo, config)
      .then((resultado: ResultadoCargaMasiva<Receta>) => {
        console.log('Carga masiva procesada:', resultado);
        this.cargarRecetas();
      })
      .catch((error: any) => {
        console.error('Error en carga masiva:', error);
      });
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  onActionClick(event: { action: string; item: Receta }): void {
    switch (event.action) {
      case 'view':
        this.verDetalle(event.item);
        break;
      case 'edit':
        this.editar(event.item);
        break;
      case 'delete':
        this.eliminar(event.item);
        break;
    }
  }


  // ============================================================================
  // MÉTODOS DE ACCIONES CRUD
  // ============================================================================
  agregar(): void {
    const configuracion: ConfiguracionFormulario = {
      titulo: {
        agregar: 'Agregar Receta',
        editar: 'Editar Receta',
      },
      entidad: 'Receta',
      entidadArticulo: 'la receta',
      esEdicion: false,
      filas: [
        [
          {
            key: 'nombre',
            label: 'Nombre',
            tipo: 'text',
            placeholder: 'Ingrese el nombre de la receta',
            maxLength: 200,
            obligatorio: true,
            ancho: 'completo',
          },
        ],
      ],
    };

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        this.materialService.crearReceta(resultado.datos).subscribe({
          next: () => {
            this.cargarRecetas();
          },
          error: (error) => {
            console.error('Error al crear receta:', error);
          },
        });
      }
    });
  }

  editar(receta: Receta): void {
    const configuracion: ConfiguracionFormulario = {
      titulo: {
        agregar: 'Agregar Receta',
        editar: 'Editar Receta',
      },
      entidad: 'Receta',
      entidadArticulo: 'la receta',
      esEdicion: true,
      filas: [
        [
          {
            key: 'nombre',
            label: 'Nombre',
            tipo: 'text',
            placeholder: 'Ingrese el nombre de la receta',
            maxLength: 200,
            obligatorio: true,
            ancho: 'completo',
          },
        ],
      ],
      datosIniciales: {
        nombre: receta.nombre,
      },
    };

    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: configuracion,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar' && receta.id_receta) {
        const recetaActualizada = {
          ...resultado.datos,
          id_receta: receta.id_receta,
        };

        this.materialService.editarReceta(recetaActualizada).subscribe({
          next: () => {
            this.cargarRecetas();
          },
          error: (error) => {
            console.error('Error al editar receta:', error);
          },
        });
      }
    });
  }

  verDetalle(receta: Receta): void {
    const configuracion: ConfiguracionDetalle = {
      entidad: 'Receta',
      entidadArticulo: 'la receta',
      filas: [
        [
          {
            key: 'id_receta',
            label: 'ID Receta',
            tipo: 'text',
            formateo: (id) => this.formatearCodigo(id),
          },
          {
            key: 'nombre',
            label: 'Nombre',
            tipo: 'text',
            formateo: (texto) => this.formatearTexto(texto),
          },
        ],
        [
          {
            key: 'estado',
            label: 'Estado',
            tipo: 'text',
            formateo: () => this.getEstadoReceta(receta),
          },
          {
            key: 'ingredientes',
            label: 'Cantidad Ingredientes',
            tipo: 'number',
            formateo: () => this.getIngredientesCount(receta).toString(),
          },
        ],
      ],
      datos: receta,
    };

    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: configuracion,
    });
  }

  eliminar(receta: Receta): void {
    const confirmacion = confirm(
      `¿Está seguro que desea eliminar la receta ${receta.nombre}?`
    );
    if (confirmacion && receta.id_receta) {
      this.materialService.eliminarReceta(receta.id_receta).subscribe(() => {
        this.cargarRecetas();
      });
    }
  }

  // ============================================================================
  // MÉTODOS UTILITARIOS
  // ============================================================================
  formatearCodigo(id?: number): string {
    if (!id) return 'REC-0000';
    return `REC-${id.toString().padStart(4, '0')}`;
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  getIngredientesCount(receta: Receta): number {
    return receta.detalles?.length || 0;
  }

  getEstadoReceta(receta: Receta): string {
    const count = receta.detalles?.length || 0;
    return count > 0 ? 'Activa' : 'Vacía';
  }
}
