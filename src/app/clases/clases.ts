import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MaterialService } from '../services/material.service';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import {
  CargaMasivaService,
  ConfiguracionCargaMasiva,
} from '../services/carga-masiva.service';
import { CargaMasivaDialogComponent } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { Clase } from '../models/insumo.model';
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { PrimeDataTableComponent } from '../shared/components/prime-data-table/prime-data-table.component';
import { ClasesConfig } from '../shared/configs/clases-config';
import { ConfirmacionConfig } from '../shared/configs/confirmacion-config';
import {
  TableColumn,
  TableAction,
  TableButtonConfig,
  TableState,
} from '../shared/components/prime-data-table/prime-data-table.component';
import {
  Subject,
  takeUntil,
  finalize,
} from 'rxjs';

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatTooltipModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './clases.html',
  styleUrls: ['./clases.scss'],
})
export class ClasesComponent implements OnInit, OnDestroy {
  clases: Clase[] = [];
  private destroy$ = new Subject<void>();

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  columns: TableColumn[] = [
    {
      key: 'id_clase',
      title: 'Código',
      sortable: true,
      filterable: true,
      width: '150px',
      type: 'badge'
    },
    {
      key: 'familia',
      title: 'Familia',
      sortable: true,
      filterable: true,
      width: '250px'
    },
    {
      key: 'sub_familia',
      title: 'Subfamilia',
      sortable: true,
      filterable: true,
      width: '250px',
      type: 'badge'
    }
  ];

  actions: TableAction[] = [
    {
      action: 'view',
      tooltip: 'Ver Detalle',
      icon: 'visibility',
      color: 'primary'
    },
    {
      action: 'edit',
      tooltip: 'Editar',
      icon: 'edit',
      color: 'warn'
    },
    {
      action: 'delete',
      tooltip: 'Eliminar',
      icon: 'delete',
      color: 'danger'
    }
  ];

  buttons: TableButtonConfig[] = [
    {
      action: 'add',
      label: 'Agregar Clase',
      icon: 'add',
      color: 'primary'
    },
    {
      action: 'bulk',
      label: 'Carga Masiva',
      icon: 'upload_file',
      color: 'secondary'
    }
  ];

  globalFilterFields: string[] = ['id_clase', 'familia', 'sub_familia'];


  dropdownExportAbierto: boolean = false;

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarClases();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  cargarClases(): void {
    this.tableState.loading = true;
    this.tableState.error = false;
    this.tableState.errorMessage = '';

    this.materialService
      .getClases()
      .pipe(
        finalize(() => {
          this.tableState.loading = false;
          this.updateTableStates();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (clases) => {
          this.clases = clases;
        },
        error: (error) => {
          console.error('❌ Error al cargar clases:', error);
          this.tableState.error = true;
          this.tableState.errorMessage = 'Error al cargar las clases. Por favor, intenta nuevamente.';
          this.clases = [];
        },
      });
  }

  recargarDatos(): void {
    this.cargarClases();
  }

  private updateTableStates(): void {
    this.tableState.empty = this.clases.length === 0;
  }


  onActionClick(event: { action: string; item: any }): void {
    const { action, item } = event;
    switch (action) {
      case 'view':
        this.verDetalle(item);
        break;
      case 'edit':
        this.editar(item);
        break;
      case 'delete':
        this.eliminar(item);
        break;
    }
  }

  onButtonClick(action: string): void {
    switch (action) {
      case 'add':
        this.agregar();
        break;
      case 'bulk':
        this.cargaMasiva();
        break;
    }
  }

  agregar(): void {
    const config = ClasesConfig.getConfiguracionFormulario(false);
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: config,
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        this.materialService.crearClase(resultado.datos).subscribe(() => {
          this.cargarClases();
        });
      }
    });
  }

  editar(clase: Clase): void {
    const config = ClasesConfig.getConfiguracionFormulario(true, clase);
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      disableClose: true,
      data: config,
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        const claseActualizada = {
          ...resultado.datos,
          id_clase: clase.id_clase,
        };
        this.materialService.actualizarClase(claseActualizada).subscribe(() => {
          this.cargarClases();
        });
      }
    });
  }

  verDetalle(clase: Clase): void {
    const config = ClasesConfig.getConfiguracionDetalle(clase);
    this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: config,
    });
  }

  eliminar(clase: Clase): void {
    const config = ConfirmacionConfig.eliminarClase(clase);
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      disableClose: true,
      data: config,
    });

    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado && clase.id_clase) {
        this.materialService.eliminarClase(clase.id_clase).subscribe({
          next: () => {
            console.log('✅ Clase eliminada exitosamente');
            this.cargarClases();
          },
          error: (error: any) => {
            console.error('❌ Error al eliminar clase:', error);
          },
        });
      }
    });
  }

  private configurarExportacion(): ConfiguracionExportacion<Clase> {
    return {
      entidades: this.clases,
      nombreArchivo: 'clases',
      nombreEntidad: 'Clases',
      columnas: [
        { campo: 'id_clase', titulo: 'Código Clase', formato: 'texto' },
        { campo: 'familia', titulo: 'Familia', formato: 'texto' },
        { campo: 'sub_familia', titulo: 'Subfamilia', formato: 'texto' },
      ],
      filtrosActivos: {},
      metadatos: {
        cantidadTotal: this.clases.length,
        cantidadFiltrada: this.clases.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Clase> {
    return {
      tipoEntidad: 'clases',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código Clase',
          campoEntidad: 'id_clase',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Familia',
          campoEntidad: 'familia',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Subfamilia',
          campoEntidad: 'sub_familia',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'id_clase',
          validador: (valor) => valor && valor.length <= 50,
          mensajeError: 'El código debe tener máximo 50 caracteres',
        },
        {
          campo: 'familia',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'La familia debe tener máximo 100 caracteres',
        },
        {
          campo: 'sub_familia',
          validador: (valor) => !valor || valor.length <= 100,
          mensajeError: 'La subfamilia debe tener máximo 100 caracteres',
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

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
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
        await this.guardarClasesMasivas(resultado.entidadesValidas);
        console.log(
          `✅ ${resultado.registrosValidos} registros procesados exitosamente`
        );
        this.cargarClases();
      } else {
        console.log('❌ Errores en el archivo:', resultado.errores);
      }
    } catch (error) {
      console.error('Error al procesar archivo:', error);
    }
  }

  private async guardarClasesMasivas(clases: Clase[]): Promise<void> {
    for (const clase of clases) {
      await this.materialService.crearClase(clase).toPromise();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-export')) {
      this.dropdownExportAbierto = false;
    }
  }

}

export { ClasesComponent as Clases };
