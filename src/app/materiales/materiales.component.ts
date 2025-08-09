import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  Subject,
  takeUntil,
} from 'rxjs';
import { MaterialService } from '../services/material.service';
import { Insumo } from '../models/insumo.model';
// PrimeNG Dialog y ConfirmDialog
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
// Carga masiva
import { CargaMasivaDialogComponent, CargaMasivaDialogData } from '../shared/dialogs/carga-masiva-dialog/carga-masiva-dialog.component';
import { CargaMasivaService, ConfiguracionCargaMasiva } from '../services/carga-masiva.service';
import {
  ExportacionService,
  ConfiguracionExportacion,
} from '../services/exportacion.service';
import { PrimeDataTableComponent, TableColumn, TableAction, TableButtonConfig, TableState } from '../shared/components/prime-data-table/prime-data-table.component';
// Modales
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';
// Configuraciones
import { MaterialesConfig } from '../shared/configs/materiales-config';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    PrimeDataTableComponent,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss'],
})
export class MaterialesComponent implements OnInit, OnDestroy {
  materiales: Insumo[] = [];
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
      key: 'id_fox',
      title: 'ID Fox',
      sortable: true,
      filterable: true,
      width: '100px'
    },
    {
      key: 'codigo_insumo',
      title: 'Código',
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'nombre',
      title: 'Nombre',
      sortable: true,
      filterable: true,
      width: '250px'
    },
    {
      key: 'familia',
      title: 'Familia',
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'subfamilia',
      title: 'Subfamilia',
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'unidad.nombre',
      title: 'Unidad',
      sortable: true,
      filterable: true,
      width: '80px'
    },
    {
      key: 'presentacion',
      title: 'Presentación',
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'proveedor_principal.empresa',
      title: 'Proveedor',
      sortable: true,
      filterable: true,
      width: '150px'
    },
    {
      key: 'created_at',
      title: 'F. Registro',
      sortable: true,
      filterable: false,
      width: '100px',
      type: 'date'
    },
    {
      key: 'updated_at',
      title: 'F. Modificación',
      sortable: true,
      filterable: false,
      width: '100px',
      type: 'date'
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
      label: 'Registro de Insumo',
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
  globalFilterFields: string[] = ['id_fox', 'nombre', 'clase.nombre', 'unidad.nombre', 'presentacion'];

  get isEmpty(): boolean {
    return !this.tableState.loading && this.materiales.length === 0 && !this.tableState.error;
  }


  constructor(
    private materialService: MaterialService,
    private exportacionService: ExportacionService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog,
    private cargaMasivaService: CargaMasivaService
  ) {}

  ngOnInit(): void {
    this.cargarMateriales();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================================================
  // MÉTODOS DE CARGA DE DATOS
  // ============================================================================

  cargarMateriales(): void {
    this.tableState = { ...this.tableState, loading: true, error: false };

    this.materialService
      .getMateriales()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (materiales: Insumo[]) => {
          this.materiales = materiales;
          this.tableState = {
            ...this.tableState,
            loading: false,
            empty: materiales.length === 0,
            filteredEmpty: false
          };
        },
        error: (error: any) => {
          console.error('Error al cargar materiales:', error);
          this.tableState = {
            ...this.tableState,
            loading: false,
            error: true,
            errorMessage: 'Error al cargar los materiales. Intente nuevamente.'
          };
        },
      });
  }

  recargarDatos(): void {
    this.cargarMateriales();
  }

  // ============================================================================
  // MANEJADORES DE ACCIONES DE TABLA
  // ============================================================================

  onTableAction(event: { action: string; item: any }): void {
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

  onTableButtonAction(action: string): void {
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

  async agregar(): Promise<void> {
    const config = MaterialesConfig.formulario(false);
    
    // Cargar opciones dinámicamente
    await this.cargarOpcionesFormulario(config);
    
    // Configurar callbacks para los botones de agregar
    config.filas.forEach((fila: any[]) => {
      fila.forEach((campo: any) => {
        if (campo.key === 'id_proveedor' && campo.conBotonAgregar) {
          campo.onAgregar = () => this.abrirFormularioNuevoProveedor();
        }
        if (campo.key === 'id_clase' && campo.conBotonAgregar) {
          campo.onAgregar = () => this.abrirFormularioNuevaClase();
        }
        if (campo.key === 'id_unidad' && campo.conBotonAgregar) {
          campo.onAgregar = () => this.abrirFormularioNuevaUnidad();
        }
      });
    });
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '800px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado && resultado.accion === 'guardar') {
        this.crear(resultado.datos);
      }
    });
  }
  
  private async abrirFormularioNuevoProveedor(): Promise<void> {
    // Importar dinámicamente la configuración de proveedores
    const { ProveedoresConfig } = await import('../shared/configs/proveedores-config');
    const configProveedor = ProveedoresConfig.formulario(false);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '700px',
      data: {
        ...configProveedor,
        titulo: {
          agregar: 'Registrar Nuevo Proveedor',
          editar: 'Editar Proveedor'
        },
        mensajeAdicional: 'Complete los datos del nuevo proveedor. Una vez registrado, podrá seleccionarlo en el formulario de insumos.'
      },
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(resultadoProveedor => {
      if (resultadoProveedor && resultadoProveedor.accion === 'guardar') {
        // Crear el proveedor
        this.materialService.crearProveedor(resultadoProveedor.datos)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (nuevoProveedor: any) => {
              console.log('Proveedor creado exitosamente:', nuevoProveedor);
              // Mostrar mensaje de éxito
              this.mostrarMensajeExito(`Proveedor "${nuevoProveedor.empresa}" registrado exitosamente. Ya puede seleccionarlo en el formulario.`);
              // Recargar las opciones del formulario si está abierto
              // El formulario se actualizará cuando se vuelva a abrir
            },
            error: (error: any) => {
              console.error('Error al crear proveedor:', error);
              this.mostrarMensajeError('No se pudo crear el proveedor. Por favor, intente nuevamente.');
            }
          });
      }
    });
  }
  
  private mostrarMensajeExito(mensaje: string): void {
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        this.dialog.open(ConfirmacionDialogComponent, {
          width: '500px',
          data: {
            tipo: 'success',
            titulo: 'Éxito',
            mensaje: mensaje,
            textoBotonConfirmar: 'Entendido',
            ocultarCancelar: true
          }
        });
      }
    );
  }
  
  private mostrarMensajeError(mensaje: string): void {
    // Usar el dialog de confirmación como mensaje de error
    import('../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component').then(
      ({ ConfirmacionDialogComponent }) => {
        this.dialog.open(ConfirmacionDialogComponent, {
          width: '500px',
          data: {
            tipo: 'danger',
            titulo: 'Error',
            mensaje: mensaje,
            textoBotonConfirmar: 'Entendido',
            ocultarCancelar: true
          }
        });
      }
    );
  }
  
  private async abrirFormularioNuevaUnidad(): Promise<void> {
    // Importar dinámicamente la configuración de unidades
    const { UnidadesConfig } = await import('../shared/configs/unidades-config');
    const configUnidad = UnidadesConfig.getConfiguracionFormulario(false);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '600px',
      data: {
        ...configUnidad,
        titulo: {
          agregar: 'Registrar Nueva Unidad',
          editar: 'Editar Unidad'
        },
        mensajeAdicional: 'Complete los datos de la nueva unidad de medida. Una vez registrada, podrá seleccionarla en el formulario de insumos.'
      },
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(resultadoUnidad => {
      if (resultadoUnidad && resultadoUnidad.accion === 'guardar') {
        // Crear la unidad
        this.materialService.crearUnidad(resultadoUnidad.datos)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (nuevaUnidad: any) => {
              console.log('Unidad creada exitosamente:', nuevaUnidad);
              // Mostrar mensaje de éxito
              this.mostrarMensajeExito(`Unidad "${nuevaUnidad.nombre}" registrada exitosamente. Ya puede seleccionarla en el formulario.`);
            },
            error: (error: any) => {
              console.error('Error al crear unidad:', error);
              this.mostrarMensajeError('No se pudo crear la unidad. Por favor, intente nuevamente.');
            }
          });
      }
    });
  }
  
  private async abrirFormularioNuevaClase(): Promise<void> {
    // Importar dinámicamente la configuración de clases
    const { ClasesConfig } = await import('../shared/configs/clases-config');
    const configClase = ClasesConfig.getConfiguracionFormulario(false);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '700px',
      data: {
        ...configClase,
        titulo: {
          agregar: 'Registrar Nueva Clase',
          editar: 'Editar Clase'
        },
        mensajeAdicional: 'Complete los datos de la nueva clase. Una vez registrada, podrá seleccionarla en el formulario de insumos.'
      },
      disableClose: true
    });
    
    dialogRef.afterClosed().subscribe(resultadoClase => {
      if (resultadoClase && resultadoClase.accion === 'guardar') {
        // Crear la clase
        this.materialService.crearClase(resultadoClase.datos)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (nuevaClase: any) => {
              console.log('Clase creada exitosamente:', nuevaClase);
              // Mostrar mensaje de éxito
              this.mostrarMensajeExito(`Clase "${nuevaClase.id_clase}" registrada exitosamente. Ya puede seleccionarla en el formulario.`);
              // Recargar las opciones del formulario si está abierto
              // El formulario se actualizará cuando se vuelva a abrir
            },
            error: (error: any) => {
              console.error('Error al crear clase:', error);
              this.mostrarMensajeError('No se pudo crear la clase. Por favor, intente nuevamente.');
            }
          });
      }
    });
  }

  async editar(material: Insumo): Promise<void> {
    const config = MaterialesConfig.formulario(true, material);
    
    // Cargar opciones dinámicamente
    await this.cargarOpcionesFormulario(config);
    
    // Configurar callbacks para los botones de agregar
    config.filas.forEach((fila: any[]) => {
      fila.forEach((campo: any) => {
        if (campo.key === 'id_proveedor' && campo.conBotonAgregar) {
          campo.onAgregar = () => this.abrirFormularioNuevoProveedor();
        }
        if (campo.key === 'id_clase' && campo.conBotonAgregar) {
          campo.onAgregar = () => this.abrirFormularioNuevaClase();
        }
        if (campo.key === 'id_unidad' && campo.conBotonAgregar) {
          campo.onAgregar = () => this.abrirFormularioNuevaUnidad();
        }
      });
    });
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '800px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado && resultado.accion === 'guardar') {
        this.actualizar(material.id_insumo!, resultado.datos);
      }
    });
  }

  async verDetalle(material: Insumo): Promise<void> {
    const config = MaterialesConfig.detalle(material);
    
    const dialogRef = this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      data: config,
      disableClose: true
    });
  }

  cargaMasiva(): void {
    const configuracion = this.crearConfiguracionCargaMasiva();
    
    const dialogData: CargaMasivaDialogData = {
      configuracion,
      onDescargarPlantilla: () => this.descargarPlantillaMateriales(configuracion),
      onProcesarArchivo: (archivo: File) => this.procesarArchivoMateriales(archivo, configuracion)
    };

    const dialogRef = this.dialog.open(CargaMasivaDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(resultado => {
      if (resultado) {
        // Se procesó el archivo exitosamente, recargar datos
        this.cargarMateriales();
      }
    });
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  private configurarExportacion(): ConfiguracionExportacion<Insumo> {
    return {
      entidades: this.materiales,
      nombreArchivo: 'materiales',
      nombreEntidad: 'Materiales',
      columnas: [
        { campo: 'id_fox', titulo: 'Código Fox' },
        { campo: 'nombre', titulo: 'Nombre' },
        { campo: 'clase.nombre', titulo: 'Clase' },
        { campo: 'unidad.nombre', titulo: 'Unidad' },
        { campo: 'presentacion', titulo: 'Presentación' }
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.materiales.length,
        cantidadFiltrada: this.materiales.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
        empresa: 'Texfina'
      }
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

  private obtenerFiltrosActivos(): any {
    // TODO: Implementar obtención de filtros activos de la tabla
    return {};
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
  // MÉTODOS DE CARGA MASIVA
  // ============================================================================

  private crearConfiguracionCargaMasiva(): ConfiguracionCargaMasiva<Insumo> {
    return {
      tipoEntidad: 'materiales',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código Fox',
          campoEntidad: 'id_fox',
          obligatorio: true,
          tipoEsperado: 'texto'
        },
        {
          columnaArchivo: 'Nombre',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto'
        },
        {
          columnaArchivo: 'Clase',
          campoEntidad: 'id_clase',
          obligatorio: true,
          tipoEsperado: 'texto'
        },
        {
          columnaArchivo: 'Unidad',
          campoEntidad: 'id_unidad',
          obligatorio: true,
          tipoEsperado: 'texto'
        },
        {
          columnaArchivo: 'Peso Unitario',
          campoEntidad: 'peso_unitario',
          obligatorio: false,
          tipoEsperado: 'numero'
        },
        {
          columnaArchivo: 'Precio Unitario',
          campoEntidad: 'precio_unitario',
          obligatorio: false,
          tipoEsperado: 'numero'
        },
        {
          columnaArchivo: 'Presentación',
          campoEntidad: 'presentacion',
          obligatorio: false,
          tipoEsperado: 'texto'
        }
      ],
      validaciones: [
        {
          campo: 'id_fox',
          validador: (valor) => valor && valor.length >= 3,
          mensajeError: 'El código Fox debe tener al menos 3 caracteres'
        },
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length >= 5,
          mensajeError: 'El nombre debe tener al menos 5 caracteres'
        },
        {
          campo: 'peso_unitario',
          validador: (valor) => !valor || valor >= 0,
          mensajeError: 'El peso unitario debe ser mayor o igual a 0'
        },
        {
          campo: 'precio_unitario',
          validador: (valor) => !valor || valor >= 0,
          mensajeError: 'El precio unitario debe ser mayor o igual a 0'
        }
      ],
      permitirActualizacion: false
    };
  }

  private descargarPlantillaMateriales(configuracion: ConfiguracionCargaMasiva<Insumo>): void {
    try {
      this.cargaMasivaService.generarPlantilla(configuracion);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      throw error;
    }
  }

  private async procesarArchivoMateriales(archivo: File, configuracion: ConfiguracionCargaMasiva<Insumo>): Promise<void> {
    try {
      // Procesar archivo
      const resultado = await this.cargaMasivaService.procesarArchivo(archivo, configuracion);

      if (!resultado.exitosa) {
        const mensajeError = `Error al procesar archivo:\n${resultado.errores.map(e => `Fila ${e.fila}: ${e.mensaje}`).join('\n')}`;
        throw new Error(mensajeError);
      }

      // Si hay entidades válidas, crearlas en lotes
      if (resultado.entidadesValidas.length > 0) {
        const promesasCreacion = resultado.entidadesValidas.map(material => 
          this.materialService.crearMaterial(material).toPromise()
        );

        await Promise.all(promesasCreacion);

        console.log(`✅ Carga masiva completada: ${resultado.registrosValidos} materiales creados`);
        
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

  eliminar(material: Insumo): void {
    const config = MaterialesConfig.eliminarMaterial(material.nombre);
    
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      data: config,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(confirmado => {
      if (confirmado) {
        this.ejecutarEliminacion(material.id_insumo!);
      }
    });
  }

  private async cargarOpcionesFormulario(config: any): Promise<void> {
    try {
      // Cargar clases, proveedores y unidades en paralelo
      const [clases, proveedores, unidades] = await Promise.all([
        this.materialService.getClases().toPromise(),
        this.materialService.getProveedores().toPromise(),
        this.materialService.getUnidades().toPromise()
      ]);

      // Buscar campos y asignar opciones
      config.filas.forEach((fila: any[]) => {
        fila.forEach((campo: any) => {
          if (campo.key === 'id_clase') {
            campo.opciones = clases?.map((clase: any) => ({
              value: clase.id_clase,
              label: clase.descripcion_completa || `${clase.id_clase} - ${clase.familia} ${clase.sub_familia}`,
              descripcion: `${clase.familia} ${clase.sub_familia}`
            })) || [];
          } else if (campo.key === 'id_proveedor') {
            campo.opciones = proveedores?.map((proveedor: any) => ({
              value: proveedor.id_proveedor,
              label: proveedor.empresa,
              descripcion: `RUC: ${proveedor.ruc} - ${proveedor.contacto || 'Sin contacto'}`,
              email: proveedor.email,
              telefono: proveedor.telefono
            })) || [];
            
            // Si no hay proveedores, agregar mensaje informativo
            if (!campo.opciones || campo.opciones.length === 0) {
              campo.opciones = [{
                value: '',
                label: 'No hay proveedores registrados',
                descripcion: 'Registre proveedores en Maestros > Proveedores'
              }];
            }
          } else if (campo.key === 'id_unidad') {
            campo.opciones = unidades?.map((unidad: any) => ({
              value: unidad.id_unidad,
              label: unidad.nombre
            })) || [];
          }
        });
      });
    } catch (error) {
      console.error('Error al cargar opciones:', error);
    }
  }

  private crear(materialData: any): void {
    this.materialService.crearMaterial(materialData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Material creado:', resultado);
          this.cargarMateriales();
        },
        error: (error: any) => {
          console.error('Error al crear material:', error);
        }
      });
  }

  private actualizar(id: number, materialData: any): void {
    const materialCompleto = { ...materialData, id_insumo: id };
    this.materialService.actualizarMaterial(materialCompleto)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Material actualizado:', resultado);
          this.cargarMateriales();
        },
        error: (error: any) => {
          console.error('Error al actualizar material:', error);
        }
      });
  }

  private ejecutarEliminacion(id: number): void {
    this.materialService.eliminarMaterial(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resultado: any) => {
          console.log('Material eliminado:', resultado);
          this.cargarMateriales();
        },
        error: (error: any) => {
          console.error('Error al eliminar material:', error);
        }
      });
  }
}
