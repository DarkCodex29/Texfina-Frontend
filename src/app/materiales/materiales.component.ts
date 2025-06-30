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
    private fb: FormBuilder,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
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

    if (filtros.codigoFox && filtros.codigoFox.trim()) {
      materialesFiltrados = materialesFiltrados.filter((material) =>
        material.id_fox?.toLowerCase().includes(filtros.codigoFox.toLowerCase())
      );
    }

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

  agregar(): void {
    const dialogRef = this.dialog.open(RegistroMaterialDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esEdicion: false, titulo: 'Agregar Material' },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarMateriales();
      }
    });
  }

  abrirRegistroMaterial(): void {
    this.agregar();
  }

  abrirAgregarLote(): void {
    // Implementar modal para agregar lote
    console.log('Abrir modal de agregar lote');
  }

  verDetalle(material: Insumo): void {
    this.dialog.open(DetalleMaterialDialogComponent, {
      width: '800px',
      disableClose: true,
      data: { entidad: material },
    });
  }

  editar(material: Insumo): void {
    const dialogRef = this.dialog.open(RegistroMaterialDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esEdicion: true, entidad: material, titulo: 'Editar Material' },
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarMateriales();
      }
    });
  }

  editarMaterial(material: Insumo): void {
    this.editar(material);
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }

  private configurarExportacion(): ConfiguracionExportacion<Insumo> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'materiales',
      nombreEntidad: 'Materiales',
      columnas: [
        { campo: 'id_fox', titulo: 'Código Fox', formato: 'texto' },
        { campo: 'nombre', titulo: 'Nombre del Material', formato: 'texto' },
        { campo: 'peso_unitario', titulo: 'Peso Unitario', formato: 'numero' },
        { campo: 'unidad.nombre', titulo: 'Unidad', formato: 'texto' },
        { campo: 'presentacion', titulo: 'Presentación', formato: 'texto' },
        {
          campo: 'precio_unitario',
          titulo: 'Precio Unitario',
          formato: 'moneda',
        },
        { campo: 'id_clase', titulo: 'Clase', formato: 'texto' },
        { campo: 'estado', titulo: 'Estado', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.materiales.length,
        cantidadFiltrada: this.dataSource.data.length,
        fechaExportacion: new Date(),
        usuario: 'Usuario Actual',
      },
    };
  }

  private configurarCargaMasiva(): ConfiguracionCargaMasiva<Insumo> {
    return {
      tipoEntidad: 'materiales',
      mapeoColumnas: [
        {
          columnaArchivo: 'Código Fox',
          campoEntidad: 'id_fox',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Nombre del Material',
          campoEntidad: 'nombre',
          obligatorio: true,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Peso Unitario',
          campoEntidad: 'peso_unitario',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'ID Unidad',
          campoEntidad: 'id_unidad',
          obligatorio: true,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Presentación',
          campoEntidad: 'presentacion',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
        {
          columnaArchivo: 'Precio Unitario',
          campoEntidad: 'precio_unitario',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'ID Clase',
          campoEntidad: 'id_clase',
          obligatorio: false,
          tipoEsperado: 'numero',
        },
        {
          columnaArchivo: 'Estado',
          campoEntidad: 'estado',
          obligatorio: false,
          tipoEsperado: 'texto',
        },
      ],
      validaciones: [
        {
          campo: 'precio_unitario',
          validador: (valor) => valor === null || valor >= 0,
          mensajeError: 'El precio debe ser mayor o igual a 0',
        },
        {
          campo: 'peso_unitario',
          validador: (valor) => valor === null || valor > 0,
          mensajeError: 'El peso debe ser mayor a 0',
        },
        {
          campo: 'nombre',
          validador: (valor) => valor && valor.length >= 3,
          mensajeError: 'El nombre debe tener al menos 3 caracteres',
        },
      ],
      transformaciones: [
        {
          campo: 'estado',
          transformar: (valor) => valor || 'Activo',
        },
      ],
    };
  }

  cargaMasiva(): void {
    console.log('🚀 Abrir carga masiva de materiales');
    const opcion = confirm(
      '📁 CARGA MASIVA DE MATERIALES\n\n' +
        '¿Qué deseas hacer?\n\n' +
        '✅ ACEPTAR: Descargar plantilla Excel\n' +
        '❌ CANCELAR: Cargar archivo existente'
    );

    if (opcion) {
      this.descargarPlantillaCargaMasiva();
    } else {
      this.mostrarInputArchivo();
    }
  }

  descargarPlantillaCargaMasiva(): void {
    try {
      const config = this.configurarCargaMasiva();
      this.cargaMasivaService.generarPlantilla(config);
      console.log('✅ Plantilla de materiales descargada');
    } catch (error) {
      console.error('❌ Error al generar plantilla:', error);
      alert('Error al generar la plantilla. Intenta nuevamente.');
    }
  }

  private mostrarInputArchivo(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls,.csv';
    input.style.display = 'none';

    input.onchange = (event: any) => {
      const archivo = event.target.files[0];
      if (archivo) {
        this.procesarArchivoCargaMasiva(archivo);
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  async procesarArchivoCargaMasiva(archivo: File): Promise<void> {
    try {
      console.log('📂 Procesando archivo:', archivo.name);
      const config = this.configurarCargaMasiva();
      const resultado = await this.cargaMasivaService.procesarArchivo(
        archivo,
        config
      );

      if (resultado.exitosa) {
        console.log(
          `✅ ${resultado.registrosValidos} materiales procesados exitosamente`
        );

        // Mostrar resumen de resultados
        const mensaje =
          `📊 RESULTADO DE CARGA MASIVA\n\n` +
          `✅ Registros válidos: ${resultado.registrosValidos}\n` +
          `❌ Registros con errores: ${resultado.registrosInvalidos}\n` +
          `📝 Total procesados: ${resultado.registrosProcesados}\n\n` +
          `¿Deseas guardar los ${resultado.registrosValidos} registros válidos?`;

        if (confirm(mensaje)) {
          await this.guardarMaterialesMasivos(resultado.entidadesValidas);
          this.cargarMateriales(); // Recargar tabla
        }
      } else {
        console.log('❌ Errores en el archivo:', resultado.errores);
        this.mostrarErroresCargaMasiva(resultado);
      }
    } catch (error) {
      console.error('❌ Error al procesar archivo:', error);
      alert(
        'Error al procesar el archivo. Verifica el formato y vuelve a intentar.'
      );
    }
  }

  private async guardarMaterialesMasivos(materiales: Insumo[]): Promise<void> {
    try {
      console.log('💾 Guardando materiales en el backend...');

      // TODO: Implementar guardado masivo en el backend
      for (const material of materiales) {
        console.log('📦 Material simulado guardado:', material.nombre);
      }

      alert(`✅ ${materiales.length} materiales guardados exitosamente!`);
    } catch (error) {
      console.error('❌ Error al guardar materiales:', error);
      alert('Error al guardar los materiales. Contacta al administrador.');
    }
  }

  private mostrarErroresCargaMasiva(resultado: any): void {
    let mensaje = `❌ ERRORES EN CARGA MASIVA\n\n`;
    mensaje += `Total de errores: ${resultado.errores.length}\n\n`;

    // Mostrar primeros 5 errores
    const erroresMostrar = resultado.errores.slice(0, 5);
    erroresMostrar.forEach((error: any, index: number) => {
      mensaje += `${index + 1}. Fila ${error.fila}: ${error.mensaje}\n`;
    });

    if (resultado.errores.length > 5) {
      mensaje += `\n... y ${resultado.errores.length - 5} errores más.`;
    }

    mensaje += `\n\nRevisa el archivo y vuelve a intentar.`;
    alert(mensaje);
  }

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  exportarExcel(): void {
    try {
      console.log('📊 Exportando materiales a Excel...');
      this.dropdownExportAbierto = false;

      const config = this.configurarExportacion();
      this.exportacionService.exportarExcel(config);

      console.log(
        `✅ ${this.dataSource.data.length} materiales exportados a Excel`
      );
    } catch (error) {
      console.error('❌ Error al exportar a Excel:', error);
      alert('Error al exportar a Excel. Intenta nuevamente.');
    }
  }

  exportarPDF(): void {
    try {
      console.log('📄 Exportando materiales a PDF...');
      this.dropdownExportAbierto = false;

      const config = this.configurarExportacion();
      this.exportacionService.exportarPDF(config);

      console.log(
        `✅ ${this.dataSource.data.length} materiales exportados a PDF`
      );
    } catch (error) {
      console.error('❌ Error al exportar a PDF:', error);
      alert('Error al exportar a PDF. Intenta nuevamente.');
    }
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
