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
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PrimeDataTableComponent, TableColumn, TableAction, TableButtonConfig, TableState } from '../shared/components/prime-data-table/prime-data-table.component';

import { MaterialService } from '../services/material.service';
import { Almacen } from '../models/insumo.model';
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
import { AlmacenesConfig } from '../shared/configs/almacenes-config';
import { ConfirmacionConfig } from '../shared/configs/confirmacion-config';
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
import { CargaMasivaDialogComponent, CargaMasivaDialogData } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  delay,
  finalize,
} from 'rxjs';

@Component({
  selector: 'app-almacenes',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './almacenes.html',
  styleUrls: ['./almacenes.scss'],
})
export class AlmacenesComponent implements OnInit, OnDestroy {
  almacenes: Almacen[] = [];
  dropdownExportAbierto = false;
  private destroy$ = new Subject<void>();

  // Estado de la tabla
  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  // Configuración de tabla PrimeNG
  columns: TableColumn[] = [
    {
      key: 'id_almacen',
      title: 'ID',
      sortable: true,
      filterable: true,
      width: '100px',
      type: 'badge'
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      filterable: true,
      width: '250px'
    },
    {
      key: 'ubicacion',
      title: 'Ubicación',
      sortable: true,
      filterable: true,
      width: '300px'
    }
  ];
  actions: TableAction[] = [
    {
      tooltip: 'Ver',
      icon: 'pi pi-eye',
      action: 'view',
      color: 'primary'
    },
    {
      tooltip: 'Editar',
      icon: 'pi pi-pencil',
      action: 'edit',
      color: 'secondary'
    },
    {
      tooltip: 'Eliminar',
      icon: 'pi pi-trash',
      action: 'delete',
      color: 'danger'
    }
  ];
  buttons: TableButtonConfig[] = [
    {
      label: 'Agregar Almacén',
      icon: 'pi pi-plus',
      action: 'add',
      color: 'primary'
    },
    {
      label: 'Carga Masiva',
      icon: 'pi pi-upload',
      action: 'bulk-upload',
      color: 'secondary'
    }
  ];
  globalFilterFields: string[] = ['id_almacen', 'nombre', 'ubicacion'];

  get isEmpty(): boolean {
    return !this.tableState.loading && this.almacenes.length === 0 && !this.tableState.error;
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarAlmacenes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ============================================================================
  cargarAlmacenes(): void {
    this.tableState = { ...this.tableState, loading: true, error: false };

    this.materialService
      .getAlmacenes()
      .pipe(
        delay(1500),
        finalize(() => {
          this.tableState = { ...this.tableState, loading: false };
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (almacenes: Almacen[]) => {
          this.almacenes = almacenes;
          this.tableState = {
            ...this.tableState,
            loading: false,
            empty: almacenes.length === 0,
            filteredEmpty: false
          };
        },
        error: (error: any) => {
          console.error('Error al cargar almacenes:', error);
          this.tableState = {
            ...this.tableState,
            loading: false,
            error: true,
            errorMessage: 'Error al cargar los almacenes. Intente nuevamente.'
          };
        },
      });
  }

  recargarDatos(): void {
    this.cargarAlmacenes();
  }

  // ============================================================================
  // MANEJADORES DE ACCIONES DE TABLA
  // ============================================================================

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
      default:
        console.warn(`Acción no reconocida: ${action}`);
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
      default:
        console.warn(`Acción de botón no reconocida: ${action}`);
    }
  }


  // ============================================================================
  // CONFIGURACIONES SEGÚN REGLA DE ORO
  // ============================================================================
  private configurarExportacion(): ConfiguracionExportacion<Almacen> {
    return {
      entidades: this.almacenes,
      nombreArchivo: 'almacenes',
      nombreEntidad: 'Almacenes',
      columnas: [
        { campo: 'id_almacen', titulo: 'ID', formato: 'numero' },
        { campo: 'nombre', titulo: 'Nombre', formato: 'texto' },
        { campo: 'ubicacion', titulo: 'Ubicación', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.almacenes.length,
        cantidadFiltrada: this.almacenes.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
        empresa: 'Texfina'
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Almacen> {
    return {
      tipoEntidad: 'almacenes',
      mapeoColumnas: [
        {
          columnaArchivo: 'Nombre',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Ubicación',
          campoEntidad: 'ubicacion',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length <= 100,
          mensajeError: 'El nombre debe tener máximo 100 caracteres',
        },
        {
          campo: 'ubicacion',
          validador: (valor) => valor && valor.length <= 200,
          mensajeError: 'La ubicación debe tener máximo 200 caracteres',
        },
      ],
    };
  }

  private obtenerFiltrosActivos(): any {
    // TODO: Implementar obtención de filtros activos de la tabla
    return {};
  }

  // ============================================================================
  // FUNCIONES DE EXPORTACIÓN Y CARGA MASIVA
  // ============================================================================
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
    const configuracion = this.configurarCargaMasiva();
    
    const dialogData: CargaMasivaDialogData = {
      configuracion,
      onDescargarPlantilla: () => this.descargarPlantillaCargaMasiva(configuracion),
      onProcesarArchivo: (archivo: File) => this.procesarArchivoCargaMasiva(archivo, configuracion)
    };

    const dialogRef = this.dialog.open(CargaMasivaDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // Se procesó el archivo exitosamente, recargar datos
        this.cargarAlmacenes();
      }
    });
  }

  private descargarPlantillaCargaMasiva(configuracion: ConfiguracionCargaMasiva<Almacen>): void {
    try {
      this.cargaMasivaService.generarPlantilla(configuracion);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      throw error;
    }
  }

  private async procesarArchivoCargaMasiva(archivo: File, configuracion: ConfiguracionCargaMasiva<Almacen>): Promise<void> {
    try {
      // Procesar archivo
      const resultado = await this.cargaMasivaService.procesarArchivo(archivo, configuracion);

      if (!resultado.exitosa) {
        const mensajeError = `Error al procesar archivo:\n${resultado.errores.map(e => `Fila ${e.fila}: ${e.mensaje}`).join('\n')}`;
        throw new Error(mensajeError);
      }

      // Si hay entidades válidas, crearlas en lotes
      if (resultado.entidadesValidas.length > 0) {
        const promesasCreacion = resultado.entidadesValidas.map(almacen => 
          this.materialService.crearAlmacen(almacen).toPromise()
        );

        await Promise.all(promesasCreacion);

        console.log(`✅ Carga masiva completada: ${resultado.registrosValidos} almacenes creados`);
        
        if (resultado.registrosInvalidos > 0) {
          console.warn(`⚠️  ${resultado.registrosInvalidos} registros fueron omitidos por errores`);
        }
      } else {
        throw new Error('No se encontraron registros válidos para procesar');
      }

    } catch (error) {
      console.error('Error en carga masiva:', error);
      throw error;
    }
  }


  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-export')) {
      this.dropdownExportAbierto = false;
    }
  }

  // ============================================================================
  // MÉTODOS CRUD SEGÚN REGLA DE ORO
  // ============================================================================
  agregar(): void {
    const config = AlmacenesConfig.getConfiguracionFormulario(false);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado && resultado.accion === 'guardar') {
        this.crear(resultado.datos);
      }
    });
  }

  editar(almacen: Almacen): void {
    const config = AlmacenesConfig.getConfiguracionFormulario(true, almacen);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado && resultado.accion === 'guardar') {
        this.actualizar(almacen.id_almacen!, resultado.datos);
      }
    });
  }

  verDetalle(almacen: Almacen): void {
    const config = AlmacenesConfig.getConfiguracionDetalle(almacen);
    
    const dialogRef = this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      data: config,
      disableClose: true
    });
  }

  eliminar(almacen: Almacen): void {
    const config = ConfirmacionConfig.eliminarAlmacen(almacen);
    
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.ejecutarEliminacion(almacen.id_almacen!);
      }
    });
  }

  private crear(almacenData: any): void {
    this.materialService.crearAlmacen(almacenData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Almacén creado:', resultado);
          this.cargarAlmacenes();
        },
        error: (error: any) => {
          console.error('Error al crear almacén:', error);
        }
      });
  }

  private actualizar(id: number, almacenData: any): void {
    const almacenCompleto = { ...almacenData, id_almacen: id };
    this.materialService.actualizarAlmacen(almacenCompleto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Almacén actualizado:', resultado);
          this.cargarAlmacenes();
        },
        error: (error: any) => {
          console.error('Error al actualizar almacén:', error);
        }
      });
  }

  private ejecutarEliminacion(id: number): void {
    this.materialService.eliminarAlmacen(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Almacén eliminado:', resultado);
          this.cargarAlmacenes();
        },
        error: (error: any) => {
          console.error('Error al eliminar almacén:', error);
        }
      });
  }

}

export { AlmacenesComponent as Almacenes };
