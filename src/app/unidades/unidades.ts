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
import { Unidad } from '../models/insumo.model';
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { UnidadesConfig } from '../shared/configs/unidades-config';
import { ConfirmacionConfig } from '../shared/configs/confirmacion-config';
import {
  PrimeDataTableComponent,
  TableColumn,
  TableAction,
  TableButtonConfig,
} from '../shared/components/prime-data-table/prime-data-table.component';

@Component({
  selector: 'app-unidades',
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
  templateUrl: './unidades.html',
  styleUrls: ['./unidades.scss'],
})
export class UnidadesComponent implements OnInit, OnDestroy {
  unidades: Unidad[] = [];
  columns: TableColumn[] = UnidadesConfig.getTableColumns();
  actions: TableAction[] = UnidadesConfig.getTableActions();
  tableButtons: TableButtonConfig[] = [
    {
      label: 'Agregar Unidad',
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
  private destroy$ = new Subject<void>();

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  dropdownExportAbierto: boolean = false;

  get isEmpty(): boolean {
    return !this.isLoading && this.unidades.length === 0 && !this.hasError;
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarUnidades();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  cargarUnidades(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de unidades - isLoading:', this.isLoading);

    this.materialService
      .getUnidades()
      .pipe(
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
        },
        error: (error) => {
          console.error('❌ Error al cargar unidades:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar las unidades. Por favor, intenta nuevamente.';
          this.unidades = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarUnidades();
  }



  private configurarExportacion(): ConfiguracionExportacion<Unidad> {
    return {
      entidades: this.unidades,
      nombreArchivo: 'unidades',
      nombreEntidad: 'Unidades',
      columnas: [
        { campo: 'id_unidad', titulo: 'Código', formato: 'texto' },
        { campo: 'nombre', titulo: 'Descripción', formato: 'texto' },
      ],
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: this.unidades.length,
        cantidadFiltrada: this.unidades.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Unidad> {
    return {
      tipoEntidad: 'unidades',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código',
          campoEntidad: 'id_unidad',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Descripción',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'id_unidad',
          validador: (valor) => valor && valor.length <= 50,
          mensajeError: 'El código debe tener máximo 50 caracteres',
        },
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'La descripción debe tener máximo 100 caracteres',
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
        await this.guardarUnidadesMasivas(resultado.entidadesValidas);
        console.log(
          `✅ ${resultado.registrosValidos} registros procesados exitosamente`
        );
        this.cargarUnidades();
      } else {
        console.log('❌ Errores en el archivo:', resultado.errores);
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
    }
  }

  private async guardarUnidadesMasivas(unidades: Unidad[]): Promise<void> {
    for (const unidad of unidades) {
      await this.materialService.crearUnidad(unidad).toPromise();
    }
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  agregar(): void {
    const config = UnidadesConfig.getConfiguracionFormulario(false);
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: config,
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        this.materialService.crearUnidad(resultado.datos).subscribe(() => {
          this.cargarUnidades();
        });
      }
    });
  }

  editar(unidad: Unidad): void {
    const config = UnidadesConfig.getConfiguracionFormulario(true, unidad);
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: config,
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        const unidadActualizada = { ...resultado.datos };
        this.materialService
          .actualizarUnidad(unidadActualizada)
          .subscribe(() => {
            this.cargarUnidades();
          });
      }
    });
  }

  verDetalle(unidad: Unidad): void {
    const config = UnidadesConfig.getConfiguracionDetalle(unidad);
    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: config,
    });
  }

  eliminar(unidad: Unidad): void {
    const config = ConfirmacionConfig.eliminarUnidad(unidad);
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      disableClose: true,
      data: config,
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && unidad.id_unidad) {
        this.materialService.eliminarUnidad(unidad.id_unidad).subscribe({
          next: () => {
            console.log('✅ Unidad eliminada exitosamente');
            this.cargarUnidades();
          },
          error: (error: any) => {
            console.error('❌ Error al eliminar unidad:', error);
          },
        });
      }
    });
  }

  onActionClick(event: { action: string; item: Unidad }): void {
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

  onButtonClick(action: string): void {
    switch (action) {
      case 'add':
        this.agregar();
        break;
      case 'bulk-upload':
        this.cargaMasiva();
        break;
    }
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-export')) {
      this.dropdownExportAbierto = false;
    }
  }
}

export { UnidadesComponent as Unidades };
