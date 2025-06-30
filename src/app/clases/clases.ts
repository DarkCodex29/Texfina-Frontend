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
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
import { CargaMasivaDialogComponent } from '../materiales/carga-masiva-dialog/carga-masiva-dialog.component';
import { Clase } from '../models/insumo.model';
import { EditarClaseDialogComponent } from './editar-clase-dialog/editar-clase-dialog';
import { DetalleClaseDialogComponent } from './detalle-clase-dialog/detalle-clase-dialog';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  delay,
  finalize,
} from 'rxjs';

@Component({
  selector: 'app-clases',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatDialogModule,
    MatSortModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './clases.html',
  styleUrls: ['./clases.scss'],
})
export class ClasesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  clases: Clase[] = [];
  dataSource = new MatTableDataSource<Clase>([]);
  filtroGeneralForm: FormGroup;
  filtrosColumnaForm: FormGroup;
  filtrosExpanded = true;
  filtrosColumnaHabilitados = false;
  filtrosColumnaActivos = false;
  private destroy$ = new Subject<void>();

  isLoading: boolean = false;
  hasError: boolean = false;
  errorMessage: string = '';
  dropdownExportAbierto: boolean = false;

  displayedColumns: string[] = [
    'id_clase',
    'familia',
    'sub_familia',
    'acciones',
  ];

  get clasesFiltradas(): Clase[] {
    return this.dataSource.data;
  }

  get isEmpty(): boolean {
    return !this.isLoading && this.clases.length === 0 && !this.hasError;
  }

  get isFilteredEmpty(): boolean {
    return (
      !this.isLoading &&
      this.dataSource.data.length === 0 &&
      this.clases.length > 0
    );
  }

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialog: MatDialog,
    private exportacionService: ExportacionService,
    private cargaMasivaService: CargaMasivaService
  ) {
    this.filtroGeneralForm = this.fb.group({ busquedaGeneral: [''] });
    this.filtrosColumnaForm = this.fb.group({
      codigo: [''],
      familia: [''],
      sub_familia: [''],
    });
  }

  ngOnInit(): void {
    this.cargarClases();
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

  cargarClases(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    console.log('🔄 Iniciando carga de clases - isLoading:', this.isLoading);

    this.materialService
      .getClases()
      .pipe(
        delay(1500),
        finalize(() => {
          this.isLoading = false;
          console.log('✅ Carga completada - isLoading:', this.isLoading);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (clases) => {
          console.log('📦 Clases cargadas:', clases.length);
          this.clases = clases;
          this.dataSource.data = [...clases];
        },
        error: (error) => {
          console.error('❌ Error al cargar clases:', error);
          this.hasError = true;
          this.errorMessage =
            'Error al cargar las clases. Por favor, intenta nuevamente.';
          this.clases = [];
          this.dataSource.data = [];
        },
      });
  }

  reintentarCarga(): void {
    this.cargarClases();
  }

  aplicarFiltroGeneral(): void {
    const busqueda = this.filtroGeneralForm
      .get('busquedaGeneral')
      ?.value?.trim()
      .toLowerCase();

    if (!busqueda) {
      this.dataSource.data = [...this.clases];
      return;
    }

    const clasesFiltradas = this.clases.filter((clase) => {
      const codigo = clase.id_clase?.toLowerCase() || '';
      const familia = clase.familia?.toLowerCase() || '';
      const subFamilia = clase.sub_familia?.toLowerCase() || '';

      return (
        codigo.includes(busqueda) ||
        familia.includes(busqueda) ||
        subFamilia.includes(busqueda)
      );
    });

    this.dataSource.data = clasesFiltradas;
  }

  aplicarFiltrosColumna(): void {
    const filtros = this.filtrosColumnaForm.value;
    let clasesFiltradas = [...this.clases];

    if (filtros.codigo && filtros.codigo.trim()) {
      clasesFiltradas = clasesFiltradas.filter((clase) =>
        clase.id_clase?.toLowerCase().includes(filtros.codigo.toLowerCase())
      );
    }

    if (filtros.familia && filtros.familia.trim()) {
      clasesFiltradas = clasesFiltradas.filter((clase) =>
        clase.familia?.toLowerCase().includes(filtros.familia.toLowerCase())
      );
    }

    if (filtros.sub_familia && filtros.sub_familia.trim()) {
      clasesFiltradas = clasesFiltradas.filter((clase) =>
        clase.sub_familia
          ?.toLowerCase()
          .includes(filtros.sub_familia.toLowerCase())
      );
    }

    this.dataSource.data = clasesFiltradas;
  }

  limpiarFiltroGeneral(): void {
    this.filtroGeneralForm.reset();
    this.dataSource.data = [...this.clases];
  }

  limpiarFiltrosColumna(): void {
    this.filtrosColumnaForm.reset();
    this.dataSource.data = [...this.clases];
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
      if (this.sort.active === column) {
        this.sort.direction = this.sort.direction === 'asc' ? 'desc' : 'asc';
      } else {
        this.sort.active = column;
        this.sort.direction = 'asc';
      }
      this.sort.sortChange.emit({
        active: this.sort.active,
        direction: this.sort.direction,
      });
    }
  }

  private configurarExportacion(): ConfiguracionExportacion<Clase> {
    return {
      entidades: this.dataSource.data,
      nombreArchivo: 'clases',
      nombreEntidad: 'Clases',
      columnas: [
        { campo: 'id_clase', titulo: 'Código Clase', formato: 'texto' },
        { campo: 'familia', titulo: 'Familia', formato: 'texto' },
        { campo: 'sub_familia', titulo: 'Subfamilia', formato: 'texto' },
      ],
      filtrosActivos: this.obtenerFiltrosActivos(),
      metadatos: {
        cantidadTotal: this.clases.length,
        cantidadFiltrada: this.dataSource.data.length,
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

  toggleDropdownExport(): void {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  agregar(): void {
    const dialogRef = this.dialog.open(EditarClaseDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarClases();
      }
    });
  }

  editar(clase: Clase): void {
    const dialogRef = this.dialog.open(EditarClaseDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: false, clase: clase },
    });
    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado) {
        this.cargarClases();
      }
    });
  }

  verDetalle(clase: Clase): void {
    this.dialog.open(DetalleClaseDialogComponent, {
      width: '800px',
      disableClose: true,
      data: { clase: clase },
    });
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

export { ClasesComponent as Clases };
