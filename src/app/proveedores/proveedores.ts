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
import { CargaMasivaDialogComponent, CargaMasivaDialogData } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
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

@Component({
  selector: 'app-proveedores',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    PrimeDataTableComponent,
  ],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss'],
})
export class ProveedoresComponent implements OnInit, OnDestroy {
  proveedores: Proveedor[] = [];
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
      key: 'empresa',
      title: 'Empresa',
      sortable: true,
      filterable: true,
      width: '250px'
    },
    {
      key: 'ruc',
      title: 'RUC',
      sortable: true,
      filterable: true,
      width: '150px'
    },
    {
      key: 'contacto',
      title: 'Contacto',
      sortable: true,
      filterable: true,
      width: '200px'
    },
    {
      key: 'direccion',
      title: 'Dirección',
      sortable: true,
      filterable: true,
      width: '250px'
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
      color: 'primary'
    },
    {
      tooltip: 'Eliminar',
      icon: 'pi pi-trash',
      action: 'delete',
      color: 'warn'
    }
  ];
  buttons: TableButtonConfig[] = [
    {
      label: 'Agregar Proveedor',
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
  globalFilterFields: string[] = ['empresa', 'ruc', 'contacto', 'direccion'];

  get isEmpty(): boolean {
    return !this.tableState.loading && this.proveedores.length === 0 && !this.tableState.error;
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarProveedores();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ============================================================================

  cargarProveedores(): void {
    this.tableState = { ...this.tableState, loading: true, error: false };

    this.materialService
      .getProveedores()
      .pipe(
        delay(1500),
        finalize(() => {
          this.tableState = { ...this.tableState, loading: false };
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (proveedores: Proveedor[]) => {
          this.proveedores = proveedores;
          this.tableState = {
            ...this.tableState,
            loading: false,
            empty: proveedores.length === 0,
            filteredEmpty: false
          };
        },
        error: (error: any) => {
          console.error('Error al cargar proveedores:', error);
          this.tableState = {
            ...this.tableState,
            loading: false,
            error: true,
            errorMessage: 'Error al cargar los proveedores. Intente nuevamente.'
          };
        },
      });
  }

  recargarDatos(): void {
    this.cargarProveedores();
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






  private configurarExportacion(): ConfiguracionExportacion<Proveedor> {
    return {
      entidades: this.proveedores,
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
        cantidadFiltrada: this.proveedores.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
        empresa: 'Texfina'
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
    // TODO: Implementar obtención de filtros activos de la tabla
    return {};
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
        this.cargarProveedores();
      }
    });
  }

  private descargarPlantillaCargaMasiva(configuracion: ConfiguracionCargaMasiva<Proveedor>): void {
    try {
      this.cargaMasivaService.generarPlantilla(configuracion);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      throw error;
    }
  }

  private async procesarArchivoCargaMasiva(archivo: File, configuracion: ConfiguracionCargaMasiva<Proveedor>): Promise<void> {
    try {
      // Procesar archivo
      const resultado = await this.cargaMasivaService.procesarArchivo(archivo, configuracion);

      if (!resultado.exitosa) {
        const mensajeError = `Error al procesar archivo:\n${resultado.errores.map(e => `Fila ${e.fila}: ${e.mensaje}`).join('\n')}`;
        throw new Error(mensajeError);
      }

      // Si hay entidades válidas, crearlas en lotes
      if (resultado.entidadesValidas.length > 0) {
        const promesasCreacion = resultado.entidadesValidas.map(proveedor => 
          this.materialService.crearProveedor(proveedor).toPromise()
        );

        await Promise.all(promesasCreacion);

        console.log(`✅ Carga masiva completada: ${resultado.registrosValidos} proveedores creados`);
        
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

  private crear(proveedorData: any): void {
    this.materialService.crearProveedor(proveedorData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Proveedor creado:', resultado);
          this.cargarProveedores();
        },
        error: (error: any) => {
          console.error('Error al crear proveedor:', error);
        }
      });
  }

  private actualizar(id: number, proveedorData: any): void {
    const proveedorCompleto = { ...proveedorData, id_proveedor: id };
    this.materialService.actualizarProveedor(proveedorCompleto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Proveedor actualizado:', resultado);
          this.cargarProveedores();
        },
        error: (error: any) => {
          console.error('Error al actualizar proveedor:', error);
        }
      });
  }

  agregar(): void {
    const config = ProveedoresConfig.formulario(false);
    
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

  editar(proveedor: Proveedor): void {
    const config = ProveedoresConfig.formulario(true, proveedor);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado && resultado.accion === 'guardar') {
        this.actualizar(proveedor.id_proveedor!, resultado.datos);
      }
    });
  }

  verDetalle(proveedor: Proveedor): void {
    const config = ProveedoresConfig.detalle(proveedor);
    
    const dialogRef = this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      data: config,
      disableClose: true
    });
  }

  eliminar(proveedor: Proveedor): void {
    const empresa = proveedor.empresa || `Proveedor ${proveedor.id_proveedor}`;
    const config = ProveedoresConfig.eliminarProveedor(empresa);
    
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.ejecutarEliminacion(proveedor.id_proveedor!);
      }
    });
  }

  private ejecutarEliminacion(id: number): void {
    this.materialService.eliminarProveedor(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Proveedor eliminado:', resultado);
          this.cargarProveedores();
        },
        error: (error: any) => {
          console.error('Error al eliminar proveedor:', error);
        }
      });
  }
}
