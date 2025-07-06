import {
  Component,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ViewChild,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions';
  pinned?: boolean;
  visible?: boolean;
}

export interface TableAction {
  icon: string;
  tooltip: string;
  action: string;
  color?: 'primary' | 'secondary' | 'warn';
  condition?: (item: any) => boolean;
}

export interface TableState {
  loading: boolean;
  error: boolean;
  errorMessage?: string;
  empty: boolean;
  filteredEmpty: boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="table-card">
      <div class="table-with-headers">
        <!-- Encabezados de columnas usando el sistema exitoso -->
        <div class="column-headers">
          <!-- Fila de títulos -->
          <div class="header-row header-titles">
            <div
              *ngFor="let column of visibleColumns; let i = index"
              class="header-col"
              [ngClass]="getColumnClass(column, i + 1)"
            >
              <span>{{ column.title }}</span>
              <button
                class="pin-button"
                [class.pinned]="column.pinned"
                (click)="togglePin(column, i + 1)"
                [matTooltip]="column.pinned ? 'Desanclar columna' : 'Anclar columna'"
              >
                <mat-icon [class.pinned-icon]="column.pinned">{{ column.pinned ? 'push_pin' : 'radio_button_unchecked' }}</mat-icon>
              </button>
            </div>
            <div *ngIf="hasActions" class="header-col acciones-col">
              <span>ACCIONES</span>
            </div>
          </div>

          <!-- Fila de filtros por columna -->
          <div
            class="header-row header-filters"
            *ngIf="showColumnFilters"
            [formGroup]="filtersForm"
          >
            <div
              *ngFor="let column of visibleColumns; let i = index"
              class="header-col"
              [ngClass]="getColumnClass(column, i + 1)"
            >
              <input
                *ngIf="column.filterable"
                class="column-filter-input"
                [formControlName]="column.key"
                [placeholder]="column.title + '...'"
                [type]="getInputType(column.type)"
              />
            </div>
            <div *ngIf="hasActions" class="header-col acciones-col">
              <button
                class="btn-clear-column-filters"
                type="button"
                (click)="clearColumnFilters()"
                matTooltip="Limpiar filtros de columna"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>

        <div class="table-container">
          <!-- Estado de error -->
          <div *ngIf="state.error" class="error-state">
            <mat-icon class="error-icon">error_outline</mat-icon>
            <h3 class="error-title text-texfina text-primary">
              Error al cargar datos
            </h3>
            <p class="error-subtitle text-texfina text-muted">
              {{ state.errorMessage || 'Ha ocurrido un error inesperado' }}
            </p>
            <button class="btn-texfina btn-primary" (click)="retry()">
              <mat-icon>refresh</mat-icon>
              Reintentar
            </button>
          </div>

          <!-- Estado vacío (sin datos) -->
          <div *ngIf="state.empty" class="empty-state">
            <mat-icon class="empty-icon">{{ emptyIcon }}</mat-icon>
            <h3 class="empty-title text-texfina text-primary">
              {{ emptyTitle }}
            </h3>
            <p class="empty-subtitle text-texfina text-muted">
              {{ emptySubtitle }}
            </p>
            <button class="btn-texfina btn-primary" (click)="addNew()">
              <mat-icon>add</mat-icon>
              {{ emptyActionText }}
            </button>
          </div>

          <!-- Estado filtrado vacío -->
          <div *ngIf="state.filteredEmpty" class="filtered-empty-state">
            <mat-icon class="filtered-empty-icon">search_off</mat-icon>
            <h3 class="filtered-empty-title text-texfina text-primary">
              No se encontraron resultados
            </h3>
            <p class="filtered-empty-subtitle text-texfina text-muted">
              Intenta ajustar los filtros o limpiar la búsqueda
            </p>
          </div>

          <!-- Tabla de datos -->
          <table mat-table [dataSource]="dataSource" matSort class="data-table">
            <!-- Columnas dinámicas generadas -->
            <ng-container *ngFor="let column of visibleColumns; let i = index" [matColumnDef]="column.key">
              <td mat-cell *matCellDef="let item" class="table-cell">
                <ng-container [ngSwitch]="column.type">
                  <!-- Tipo badge -->
                  <span *ngSwitchCase="'badge'" class="badge-texfina badge-neutral">
                    {{ formatCellValue(item, column) }}
                  </span>
                  
                  <!-- Tipo date -->
                  <div *ngSwitchCase="'date'" class="timestamp-cell">
                    <div class="fecha-text">{{ formatearFecha(getNestedValue(item, column.key)) }}</div>
                    <div class="hora-text">{{ formatearHora(getNestedValue(item, column.key)) }}</div>
                  </div>
                  
                  <!-- Tipo text, number o default -->
                  <span *ngSwitchDefault class="text-texfina text-secondary">
                    {{ formatCellValue(item, column) }}
                  </span>
                </ng-container>
              </td>
            </ng-container>

            <!-- Columna de acciones -->
            <ng-container *ngIf="hasActions" matColumnDef="acciones">
              <td mat-cell *matCellDef="let item" class="table-cell">
                <div class="action-buttons">
                  <button
                    *ngFor="let action of getVisibleActions(item)"
                    class="btn-action"
                    [ngClass]="'btn-' + (action.color || 'primary')"
                    (click)="handleAction(action.action, item)"
                    [matTooltip]="action.tooltip"
                  >
                    <mat-icon>{{ action.icon }}</mat-icon>
                  </button>
                </div>
              </td>
            </ng-container>

            <!-- Filas de datos -->
            <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
          </table>

          <!-- Skeleton loading overlay -->
          <div *ngIf="state.loading" class="skeleton-overlay">
            <table class="skeleton-table">
              <tr class="skeleton-row" *ngFor="let i of skeletonRows">
                <td
                  *ngFor="let column of visibleColumns"
                  class="table-cell"
                >
                  <div class="skeleton-line" [ngClass]="getSkeletonClass(column.type)"></div>
                </td>
                <td *ngIf="hasActions" class="table-cell">
                  <div class="skeleton-line skeleton-actions"></div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div class="table-footer" *ngIf="showPagination">
        <div class="pagination-info">
          <span class="text-texfina text-muted">{{ paginationInfo }}</span>
        </div>
        <div class="pagination-controls">
          <button
            class="pagination-button"
            [disabled]="currentPage === 1"
            (click)="previousPage()"
          >
            <mat-icon>chevron_left</mat-icon>
          </button>
          <button
            class="pagination-button"
            [disabled]="currentPage === totalPages"
            (click)="nextPage()"
          >
            <mat-icon>chevron_right</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './data-table.component.scss',
})
export class DataTableComponent implements OnInit, OnDestroy, OnChanges {
  @Input() columns: TableColumn[] = [];
  @Input() data: any[] = [];
  @Input() actions: TableAction[] = [];
  @Input() state: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false,
  };

  // Configuración de estados vacíos
  @Input() emptyIcon: string = 'inventory_2';
  @Input() emptyTitle: string = 'No hay datos registrados';
  @Input() emptySubtitle: string = 'Comienza agregando el primer elemento';
  @Input() emptyActionText: string = 'Agregar Elemento';

  // Configuración de funcionalidades
  @Input() showColumnFilters: boolean = false;
  @Input() showPagination: boolean = true;
  @Input() pageSize: number = 10;

  // Eventos
  @Output() actionClicked = new EventEmitter<{action: string, item: any}>();
  @Output() sortChanged = new EventEmitter<{column: string, direction: 'asc' | 'desc'}>();
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() retryClicked = new EventEmitter<void>();
  @Output() addNewClicked = new EventEmitter<void>();

  // Propiedades internas
  dataSource = new MatTableDataSource<any>([]);
  filtersForm!: FormGroup;
  displayedColumns: string[] = [];
  visibleColumns: TableColumn[] = [];
  hasActions: boolean = false;
  currentPage: number = 1;
  totalPages: number = 1;
  skeletonRows = Array(6).fill(0);

  private destroy$ = new Subject<void>();

  constructor(private fb: FormBuilder) {}

  // Escuchar tecla F3 para toggle de filtros
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F3') {
      event.preventDefault();
      this.toggleColumnFilters();
    }
  }

  ngOnInit() {
    console.log('DataTable ngOnInit - columns:', this.columns);
    console.log('DataTable ngOnInit - data:', this.data);
    this.initializeTable();
    this.setupFilters();
    this.updateDataSource();
    this.updateColumnPinning();
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('DataTable ngOnChanges:', changes);
    if (changes['columns'] || changes['data'] || changes['actions']) {
      this.initializeTable();
      this.updateDataSource();
      this.updateColumnPinning();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Limpiar estilos dinámicos
    const styleElement = document.getElementById('dynamic-pin-styles');
    if (styleElement) {
      styleElement.remove();
    }
  }

  private initializeTable() {
    this.visibleColumns = this.columns.filter(col => col.visible !== false);
    this.hasActions = this.actions.length > 0;
    
    this.displayedColumns = [
      ...this.visibleColumns.map(col => col.key),
      ...(this.hasActions ? ['acciones'] : [])
    ];

    console.log('initializeTable - visibleColumns:', this.visibleColumns);
    console.log('initializeTable - displayedColumns:', this.displayedColumns);
    console.log('initializeTable - hasActions:', this.hasActions);

    this.calculatePagination();
  }

  private setupFilters() {
    const filterControls: any = {};
    this.visibleColumns.forEach(column => {
      if (column.filterable) {
        filterControls[column.key] = [''];
      }
    });

    this.filtersForm = this.fb.group(filterControls);

    this.filtersForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(filters => {
        this.applyFilters(filters);
        this.filtersChanged.emit(filters);
      });
  }

  private updateDataSource() {
    this.dataSource.data = [...this.data];
    this.calculatePagination();
  }

  private applyFilters(filters: any) {
    if (!filters || Object.keys(filters).length === 0) {
      this.dataSource.data = [...this.data];
      return;
    }

    const filtered = this.data.filter(item => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key]?.toLowerCase?.() || '';
        if (!filterValue) return true;
        
        const itemValue = this.getNestedValue(item, key)?.toString?.()?.toLowerCase?.() || '';
        return itemValue.includes(filterValue);
      });
    });

    this.dataSource.data = filtered;
    this.calculatePagination();
  }

  private calculatePagination() {
    this.totalPages = Math.ceil(this.dataSource.data.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  toggleColumnFilters() {
    this.showColumnFilters = !this.showColumnFilters;
  }

  togglePin(column: TableColumn, columnIndex: number) {
    column.pinned = !column.pinned;
    
    // Aplicar estilo de pin a la columna correspondiente usando CSS
    this.updateColumnPinning();
    
    // Emitir evento para notificar el cambio
    this.sortChanged.emit({column: column.key, direction: column.pinned ? 'pinned' : 'unpinned'} as any);
  }

  private updateColumnPinning() {
    // Crear estilos dinámicos para columnas ancladas
    const styleId = 'dynamic-pin-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }
    
    let css = '';
    this.visibleColumns.forEach((column, index) => {
      if (column.pinned) {
        const cellIndex = index + 1;
        css += `
          app-data-table .header-col:nth-child(${cellIndex}).pinned,
          app-data-table .mat-mdc-cell:nth-child(${cellIndex}) {
            position: sticky !important;
            left: 0 !important;
            background: white !important;
            z-index: 2 !important;
            box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1) !important;
          }
          
          app-data-table .header-col:nth-child(${cellIndex}).pinned {
            background: #fafafa !important;
            z-index: 3 !important;
          }
          
          app-data-table .mat-mdc-row:hover .mat-mdc-cell:nth-child(${cellIndex}) {
            background: rgba(0, 0, 0, 0.02) !important;
          }
        `;
      }
    });
    
    styleElement.textContent = css;
  }

  clearColumnFilters() {
    this.filtersForm.reset();
  }

  sortData(column: string) {
    this.sortChanged.emit({column, direction: 'asc'});
  }

  handleAction(action: string, item: any) {
    this.actionClicked.emit({action, item});
  }

  getVisibleActions(item: any): TableAction[] {
    return this.actions.filter(action => 
      !action.condition || action.condition(item)
    );
  }

  retry() {
    this.retryClicked.emit();
  }

  addNew() {
    this.addNewClicked.emit();
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  get paginationInfo(): string {
    return `Página ${this.currentPage} de ${this.totalPages}`;
  }

  getColumnClass(column: TableColumn, index?: number): string {
    const baseClass = index ? `${column.key}-col` : column.key;
    const pinnedClass = column.pinned ? ' pinned' : '';
    return `${baseClass}${pinnedClass}`;
  }

  getInputType(type?: string): string {
    switch (type) {
      case 'number': return 'number';
      case 'date': return 'date';
      default: return 'text';
    }
  }

  getSkeletonClass(type?: string): string {
    switch (type) {
      case 'badge': return 'skeleton-badge';
      case 'actions': return 'skeleton-actions';
      default: return 'skeleton-text';
    }
  }

  formatCellValue(item: any, column: any): string {
    const value = this.getNestedValue(item, column.key);
    
    if (value === null || value === undefined) {
      return '—';
    }

    switch (column.type) {
      case 'badge':
        return this.formatearCodigo(value);
      case 'date':
        return new Date(value).toLocaleDateString('es-PE');
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value;
      default:
        return this.formatearTexto(value.toString());
    }
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    if (typeof texto === 'string' && texto.trim().length > 0) {
      return texto;
    }
    return '—';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }

  formatearHora(fecha: string): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  trackByColumn(index: number, column: TableColumn): string {
    return column.key;
  }
}