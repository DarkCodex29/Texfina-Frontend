import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  HostListener,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// PrimeNG imports
import { TableModule, Table } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';

// Material icons for consistency
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions' | 'user' | 'action' | 'module' | 'ip' | 'description' | 'currency';
  align?: 'left' | 'center' | 'right';
  pinned?: boolean;
  visible?: boolean;
  icon?: string;
}

export interface TableAction {
  icon: string;
  tooltip: string;
  action: string;
  color?: 'primary' | 'secondary' | 'warn' | 'danger' | 'success';
  condition?: (item: any) => boolean;
}

export interface TableButtonConfig {
  label: string;
  icon?: string;
  action: string;
  color?: 'primary' | 'secondary' | 'warn' | 'danger' | 'success';
  disabled?: boolean;
}

export interface TableState {
  loading: boolean;
  error: boolean;
  errorMessage?: string;
  empty: boolean;
  filteredEmpty: boolean;
}

@Component({
  selector: 'app-prime-data-table',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ProgressSpinnerModule,
    PaginatorModule,
    SelectModule,
    SkeletonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  template: `
    <div class="prime-table-card texfina-data-table">
      <!-- Header con filtros -->
      <div class="table-header" *ngIf="showGlobalFilter || showColumnFilters">
        <!-- Filtro global -->
        <div class="global-filter" *ngIf="showGlobalFilter">
          <span class="p-input-icon-left">
            <i class="pi pi-search"></i>
            <input
              type="text"
              pInputText
              placeholder="Buscar en toda la tabla..."
              [(ngModel)]="globalFilterValue"
              (input)="onGlobalFilter($event)"
              class="global-filter-input"
            />
          </span>
        </div>

        <!-- Botones personalizados con estilos Texfina -->
        <div class="filter-controls">
          <button
            *ngFor="let button of buttons"
            [class]="getTexfinaButtonClass(button.color)"
            [disabled]="button.disabled"
            (click)="handleButtonClick(button.action)"
            type="button"
          >
            <i *ngIf="button.icon" [class]="button.icon" class="mr-2"></i>
            {{ button.label }}
          </button>
        </div>
      </div>

      <!-- Tabla principal -->
      <p-table
        #dt
        [value]="state.loading ? skeletonData : data"
        [loading]="false"
        [paginator]="showPagination"
        [rows]="currentRows"
        [rowsPerPageOptions]="[5, 10, 25, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        [scrollable]="true"
        scrollHeight="600px"
        [resizableColumns]="true"
        [sortMode]="'single'"
        [globalFilterFields]="globalFilterFields"
        styleClass="p-datatable-striped p-datatable-gridlines"
        responsiveLayout="scroll"
        showGridlines
      >
        <!-- Template para header personalizado -->
        <ng-template pTemplate="header">
          <tr>
            <th 
              *ngFor="let column of visibleColumns; let i = index"
              [style.width]="column.width"
              [class.frozen-column]="column.pinned"
              [pSortableColumn]="column.sortable ? column.key : undefined"
            >
              <div class="column-header">
                <div 
                  class="column-title-wrapper sortable-area"
                  [class.sortable]="column.sortable"
                >
                  <i *ngIf="column.icon" [class]="column.icon" class="column-icon"></i>
                  <span class="column-title">{{ column.title }}</span>
                  <p-sortIcon *ngIf="column.sortable" [field]="column.key"></p-sortIcon>
                </div>
                <button
                  class="pin-button"
                  [class.pinned]="column.pinned"
                  (click)="togglePin(column); $event.stopPropagation()"
                  [matTooltip]="column.pinned ? 'Desanclar columna' : 'Anclar columna'"
                >
                  <i [class]="column.pinned ? 'pi pi-lock' : 'pi pi-unlock'" class="pin-icon"></i>
                </button>
              </div>
            </th>
            <th *ngIf="hasActions" [class.frozen-column]="actionsPinned" style="width: 120px">
              <div class="actions-header">
                <span>ACCIONES</span>
              </div>
            </th>
          </tr>
          
          <!-- Fila de filtros -->
          <tr *ngIf="columnFiltersVisible">
            <th *ngFor="let column of visibleColumns" [class.frozen-column]="column.pinned">
              <input
                *ngIf="column.filterable"
                type="text"
                pInputText
                [placeholder]="'Filtrar ' + column.title + '...'"
                (input)="onColumnFilter($event, column.key)"
                class="column-filter-input"
              />
            </th>
            <th *ngIf="hasActions" [class.frozen-column]="actionsPinned">
              <p-button
                icon="pi pi-filter-slash"
                [text]="true"
                [size]="'small'"
                (onClick)="clearAllFilters()"
              ></p-button>
            </th>
          </tr>
        </ng-template>

        <!-- Template para body -->
        <ng-template pTemplate="body" let-item let-rowIndex="rowIndex">
          <tr>
            <td 
              *ngFor="let column of visibleColumns; let i = index"
              [class.frozen-column]="column.pinned"
            >
              <!-- Mostrar skeleton si está cargando -->
              <ng-container *ngIf="item._skeleton; else normalContent">
                <ng-container [ngSwitch]="column.type">
                  <!-- Skeleton para badge -->
                  <p-skeleton *ngSwitchCase="'badge'" width="80px" height="24px" borderRadius="12px"></p-skeleton>
                  
                  <!-- Skeleton para date -->
                  <div *ngSwitchCase="'date'" class="skeleton-date-container">
                    <p-skeleton width="90px" height="16px" class="mb-2"></p-skeleton>
                    <p-skeleton width="70px" height="14px"></p-skeleton>
                  </div>
                  
                  <!-- Skeleton para user -->
                  <div *ngSwitchCase="'user'" class="skeleton-user-container">
                    <p-skeleton width="180px" height="18px"></p-skeleton>
                  </div>
                  
                  <!-- Skeleton para description -->
                  <div *ngSwitchCase="'description'" class="skeleton-description-container">
                    <p-skeleton width="100%" height="16px" class="mb-1"></p-skeleton>
                    <p-skeleton width="70%" height="14px"></p-skeleton>
                  </div>
                  
                  <!-- Skeleton para text/default -->
                  <p-skeleton *ngSwitchDefault width="120px" height="18px"></p-skeleton>
                </ng-container>
              </ng-container>

              <!-- Contenido normal -->
              <ng-template #normalContent>
                <ng-container [ngSwitch]="column.type">
                  <!-- Tipo badge -->
                  <span *ngSwitchCase="'badge'" class="badge-texfina badge-primary">
                    <i class="pi pi-hashtag"></i>
                    {{ formatCellValue(item, column) }}
                  </span>

                  <!-- Tipo date -->
                  <div *ngSwitchCase="'date'" class="timestamp-cell">
                    <div class="fecha-text">
                      <i class="pi pi-calendar"></i>
                      {{ formatearFecha(getNestedValue(item, column.key)) }}
                    </div>
                    <div class="hora-text">
                      <i class="pi pi-clock"></i>
                      {{ formatearHora(getNestedValue(item, column.key)) }}
                    </div>
                  </div>

                  <!-- Tipo user -->
                  <div *ngSwitchCase="'user'" class="user-cell">
                    <i class="pi pi-user"></i>
                    <span class="user-email">{{ formatCellValue(item, column) }}</span>
                  </div>

                  <!-- Tipo action -->
                  <span *ngSwitchCase="'action'" class="action-cell">
                    <i [class]="getActionIcon(getNestedValue(item, column.key))"></i>
                    <span [class]="getActionClass(getNestedValue(item, column.key))">
                      {{ formatCellValue(item, column) }}
                    </span>
                  </span>

                  <!-- Tipo module -->
                  <span *ngSwitchCase="'module'" class="module-cell">
                    <i [class]="getModuleIcon(getNestedValue(item, column.key))"></i>
                    {{ formatCellValue(item, column) }}
                  </span>

                  <!-- Tipo IP -->
                  <span *ngSwitchCase="'ip'" class="ip-cell">
                    <i class="pi pi-server"></i>
                    {{ formatCellValue(item, column) }}
                  </span>

                  <!-- Tipo description -->
                  <div *ngSwitchCase="'description'" class="description-cell">
                    <i class="pi pi-info-circle"></i>
                    <span class="description-text">{{ formatCellValue(item, column) }}</span>
                  </div>

                  <!-- Tipo currency -->
                  <span *ngSwitchCase="'currency'" class="currency-cell">
                    <i class="pi pi-money-bill"></i>
                    {{ formatCellValue(item, column) }}
                  </span>

                  <!-- Tipo text, number o default -->
                  <span *ngSwitchDefault class="text-texfina text-secondary">
                    {{ formatCellValue(item, column) }}
                  </span>
                </ng-container>
              </ng-template>
            </td>
            
            <!-- Columna de acciones -->
            <td *ngIf="hasActions" [class.frozen-column]="actionsPinned">
              <!-- Skeleton para acciones -->
              <div *ngIf="item._skeleton" class="skeleton-actions-container">
                <p-skeleton *ngFor="let action of actions" width="32px" height="32px" borderRadius="50%" class="mr-1"></p-skeleton>
              </div>
              <!-- Acciones normales -->
              <div *ngIf="!item._skeleton" class="action-buttons">
                <p-button
                  *ngFor="let action of getVisibleActions(item)"
                  [icon]="action.icon"
                  [severity]="getButtonSeverity(action.color)"
                  [text]="true"
                  [rounded]="true"
                  [size]="'small'"
                  (onClick)="handleAction(action.action, item)"
                  class="action-btn"
                ></p-button>
              </div>
            </td>
          </tr>
        </ng-template>

        <!-- Estados vacíos -->
        <ng-template pTemplate="emptymessage">
          <tr>
            <td [attr.colspan]="displayedColumnsCount">
              <div class="empty-state" *ngIf="state.empty">
                <i [class]="'pi pi-' + emptyIcon" class="empty-icon"></i>
                <h3 class="empty-title">{{ emptyTitle }}</h3>
                <p class="empty-subtitle">{{ emptySubtitle }}</p>
                <p-button
                  [label]="emptyActionText"
                  icon="pi pi-plus"
                  (onClick)="addNew()"
                  [size]="'small'"
                ></p-button>
              </div>

              <div class="filtered-empty-state" *ngIf="state.filteredEmpty">
                <i class="pi pi-search-minus empty-icon"></i>
                <h3 class="empty-title">No se encontraron resultados</h3>
                <p class="empty-subtitle">Intenta ajustar los filtros o limpiar la búsqueda</p>
              </div>
            </td>
          </tr>
        </ng-template>

      </p-table>

      <!-- Error state -->
      <div *ngIf="state.error" class="error-state">
        <i class="pi pi-exclamation-triangle error-icon"></i>
        <h3 class="error-title">Error al cargar datos</h3>
        <p class="error-subtitle">{{ state.errorMessage || 'Ha ocurrido un error inesperado' }}</p>
        <p-button
          label="Reintentar"
          icon="pi pi-refresh"
          (onClick)="retry()"
          [size]="'small'"
        ></p-button>
      </div>
    </div>
  `,
  styleUrl: './prime-data-table.component.scss',
})
export class PrimeDataTableComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild('dt') table!: Table;
  
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
  @Input() emptyIcon: string = 'inbox';
  @Input() emptyTitle: string = 'No hay datos registrados';
  @Input() emptySubtitle: string = 'Comienza agregando el primer elemento';
  @Input() emptyActionText: string = 'Agregar Elemento';

  // Configuración de funcionalidades
  @Input() showGlobalFilter: boolean = true;
  @Input() showColumnFilters: boolean = true;
  @Input() showPagination: boolean = true;
  @Input() pageSize: number = 10;
  @Input() actionsPinned: boolean = true;
  @Input() buttons: TableButtonConfig[] = [];
  @Input() globalFilterFields: string[] = [];
  @Input() loading: boolean = false;
  @Input() error: boolean = false;
  @Input() errorMessage: string = '';

  // Eventos
  @Output() actionClick = new EventEmitter<{ action: string; item: any }>();
  @Output() buttonClick = new EventEmitter<string>();
  @Output() sortChanged = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() retryClicked = new EventEmitter<void>();
  @Output() addNewClicked = new EventEmitter<void>();

  // Propiedades internas
  visibleColumns: TableColumn[] = [];
  hasActions: boolean = false;
  globalFilterValue: string = '';
  columnFiltersVisible: boolean = false;
  displayedColumnsCount: number = 0;

  // Propiedades de paginación
  currentRows: number = 10;

  // Skeleton loading
  skeletonRows: number[] = [];
  skeletonData: any[] = [];

  private destroy$ = new Subject<void>();

  constructor() {}

  // Escuchar tecla F3 para toggle de filtros
  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'F3') {
      event.preventDefault();
      this.toggleColumnFilters();
    }
  }

  ngOnInit() {
    this.initializeTable();
  }


  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeTable() {
    this.visibleColumns = this.columns.filter(col => col.visible !== false);
    this.hasActions = this.actions.length > 0;
    if (this.globalFilterFields.length === 0) {
      this.globalFilterFields = this.visibleColumns.map(col => col.key);
    }
    this.displayedColumnsCount = this.visibleColumns.length + (this.hasActions ? 1 : 0);
    
    // Update state based on inputs
    if (this.loading || this.error) {
      this.state = {
        loading: this.loading,
        error: this.error,
        errorMessage: this.errorMessage,
        empty: false,
        filteredEmpty: false
      };
    }
    this.currentRows = this.pageSize;
    // Inicializar skeleton rows (mostrar entre 5-8 filas skeleton)
    this.skeletonRows = Array.from({ length: Math.min(this.pageSize, 8) }, (_, i) => i);
    // Crear datos dummy para skeleton
    this.skeletonData = this.skeletonRows.map(i => {
      const obj: any = { _skeleton: true };
      this.visibleColumns.forEach(col => {
        obj[col.key] = ''; // Valores vacíos para skeleton
      });
      return obj;
    });
  }

  togglePin(column: TableColumn) {
    column.pinned = !column.pinned;
    this.sortChanged.emit({
      column: column.key,
      direction: column.pinned ? ('pinned' as any) : ('unpinned' as any),
    });
  }

  toggleColumnFilters() {
    this.columnFiltersVisible = !this.columnFiltersVisible;
  }

  onGlobalFilter(event: any) {
    this.globalFilterValue = event.target.value;
    if (this.table) {
      this.table.filterGlobal(this.globalFilterValue, 'contains');
    }
  }

  onColumnFilter(event: any, field: string) {
    // PrimeNG maneja los filtros automáticamente
  }

  clearAllFilters() {
    this.globalFilterValue = '';
    if (this.table) {
      this.table.clear();
    }
  }


  handleAction(action: string, item: any) {
    this.actionClick.emit({ action, item });
  }

  handleButtonClick(action: string) {
    this.buttonClick.emit(action);
  }

  getVisibleActions(item: any): TableAction[] {
    return this.actions.filter(action => !action.condition || action.condition(item));
  }

  retry() {
    this.retryClicked.emit();
  }

  addNew() {
    this.addNewClicked.emit();
  }

  getColumnStyle(column: TableColumn): any {
    return {
      width: column.width || 'auto',
      minWidth: '100px',
    };
  }

  getPrimeIcon(materialIcon: string): string {
    const iconMap: { [key: string]: string } = {
      visibility: 'pi pi-eye',
      edit: 'pi pi-pencil',
      delete: 'pi pi-trash',
      more_vert: 'pi pi-ellipsis-v',
      download: 'pi pi-download',
      upload: 'pi pi-upload',
    };
    return iconMap[materialIcon] || 'pi pi-circle';
  }

  formatCellValue(item: any, column: TableColumn): string {
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
      case 'currency':
        return this.formatearMoneda(value);
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

  formatearMoneda(valor: any): string {
    if (!valor || isNaN(valor)) return 'S/ 0.00';
    const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
    return `S/ ${numero.toFixed(2)}`;
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

  getActionIcon(action: string): string {
    const iconMap: { [key: string]: string } = {
      'LOGIN_SUCCESS': 'pi pi-sign-in',
      'LOGIN_FAILED': 'pi pi-sign-in',
      'LOGOUT': 'pi pi-sign-out',
      'CREATE_ALMACEN': 'pi pi-plus-circle',
      'UPDATE_STOCK': 'pi pi-refresh',
      'DELETE_PROVIDER': 'pi pi-trash',
      'GENERATE_REPORT': 'pi pi-file-pdf',
      'CREATE_LOTE': 'pi pi-box',
      'UPDATE_USER': 'pi pi-user-edit',
      'DELETE_USER': 'pi pi-user-minus'
    };
    return iconMap[action] || 'pi pi-bolt';
  }

  getActionClass(action: string): string {
    const classMap: { [key: string]: string } = {
      'LOGIN_SUCCESS': 'success-action',
      'LOGIN_FAILED': 'error-action',
      'LOGOUT': 'neutral-action',
      'CREATE_ALMACEN': 'success-action',
      'UPDATE_STOCK': 'info-action',
      'DELETE_PROVIDER': 'error-action',
      'GENERATE_REPORT': 'info-action',
      'CREATE_LOTE': 'success-action',
      'UPDATE_USER': 'warning-action',
      'DELETE_USER': 'error-action'
    };
    return classMap[action] || 'neutral-action';
  }

  getModuleIcon(module: string): string {
    const iconMap: { [key: string]: string } = {
      'AUTENTICACIÓN': 'pi pi-shield',
      'ALMACENES': 'pi pi-warehouse',
      'MATERIALES': 'pi pi-box',
      'PROVEEDORES': 'pi pi-users',
      'REPORTES': 'pi pi-chart-bar',
      'LOTES': 'pi pi-th-large',
      'USUARIOS': 'pi pi-user',
      'CONFIGURACIÓN': 'pi pi-cog'
    };
    return iconMap[module] || 'pi pi-building';
  }

  getButtonSeverity(color?: string): any {
    const severityMap: { [key: string]: string } = {
      'primary': 'info',
      'secondary': 'secondary', 
      'warn': 'warning',
      'danger': 'danger',
      'success': 'success'
    };
    return severityMap[color || 'secondary'] || 'secondary';
  }

  getTexfinaButtonClass(color?: string): string {
    const baseClass = 'btn-texfina';
    const classMap: { [key: string]: string } = {
      'primary': 'btn-primary',
      'secondary': 'btn-secondary',
      'success': 'btn-success',
      'warning': 'btn-warning',
      'danger': 'btn-outline-secondary',
      'outline': 'btn-outline'
    };
    const colorClass = classMap[color || 'primary'] || 'btn-primary';
    return `${baseClass} ${colorClass}`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['data'] || changes['actions']) {
      this.initializeTable();
    }
  }
}