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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';

// Material icons for consistency
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface TableColumn {
  key: string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'actions' | 'user' | 'action' | 'module' | 'ip' | 'description';
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

        <!-- Toggle para filtros de columna -->
        <div class="filter-controls">
          <p-button
            *ngIf="showColumnFilters"
            icon="pi pi-filter"
            [text]="true"
            [rounded]="true"
            (onClick)="toggleColumnFilters()"
            [severity]="columnFiltersVisible ? 'primary' : 'secondary'"
          ></p-button>
        </div>
      </div>

      <!-- Tabla principal -->
      <p-table
        #dt
        [value]="data"
        [loading]="state.loading"
        [paginator]="showPagination"
        [rows]="currentRows"
        [rowsPerPageOptions]="[5, 10, 25, 50]"
        [showCurrentPageReport]="true"
        currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} registros"
        [scrollable]="true"
        scrollHeight="600px"
        [resizableColumns]="true"
        [sortMode]="'multiple'"
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
                <div class="column-title-wrapper">
                  <i *ngIf="column.icon" [class]="column.icon" class="column-icon"></i>
                  <span class="column-title">{{ column.title }}</span>
                </div>
                <button
                  class="pin-button"
                  [class.pinned]="column.pinned"
                  (click)="togglePin(column)"
                  [matTooltip]="column.pinned ? 'Desanclar columna' : 'Anclar columna'"
                >
                  <i [class]="column.pinned ? 'pi pi-lock' : 'pi pi-unlock'" class="pin-icon"></i>
                </button>
              </div>
              <p-sortIcon *ngIf="column.sortable" [field]="column.key"></p-sortIcon>
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

                <!-- Tipo text, number o default -->
                <span *ngSwitchDefault class="text-texfina text-secondary">
                  {{ formatCellValue(item, column) }}
                </span>
              </ng-container>
            </td>
            
            <!-- Columna de acciones -->
            <td *ngIf="hasActions" [class.frozen-column]="actionsPinned">
              <div class="action-buttons">
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

        <!-- Loading template -->
        <ng-template pTemplate="loadingbody">
          <tr>
            <td [attr.colspan]="displayedColumnsCount">
              <div class="loading-state">
                <p-progressSpinner [style]="{ width: '30px', height: '30px' }"></p-progressSpinner>
                <span>Cargando datos...</span>
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

  // Eventos
  @Output() actionClicked = new EventEmitter<{ action: string; item: any }>();
  @Output() sortChanged = new EventEmitter<{ column: string; direction: 'asc' | 'desc' }>();
  @Output() filtersChanged = new EventEmitter<any>();
  @Output() retryClicked = new EventEmitter<void>();
  @Output() addNewClicked = new EventEmitter<void>();

  // Propiedades internas
  visibleColumns: TableColumn[] = [];
  hasActions: boolean = false;
  globalFilterValue: string = '';
  columnFiltersVisible: boolean = false;
  globalFilterFields: string[] = [];
  displayedColumnsCount: number = 0;

  // Propiedades de paginación
  currentRows: number = 10;

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
    this.globalFilterFields = this.visibleColumns.map(col => col.key);
    this.displayedColumnsCount = this.visibleColumns.length + (this.hasActions ? 1 : 0);
    this.currentRows = this.pageSize;
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
  }

  onColumnFilter(event: any, field: string) {
    // PrimeNG maneja los filtros automáticamente
  }

  clearAllFilters() {
    // Implementar limpieza de filtros
    this.globalFilterValue = '';
  }

  handleAction(action: string, item: any) {
    this.actionClicked.emit({ action, item });
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['data'] || changes['actions']) {
      this.initializeTable();
    }
  }
}