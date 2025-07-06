# DataTable Component - Ejemplo de Uso

## Características Principales

✅ **Componente reutilizable** basado en el diseño exitoso de Materiales  
✅ **Funcionalidad F3** para toggle de filtros  
✅ **Columnas anclables/pin** con sticky positioning  
✅ **Responsive design** con tamaños optimizados  
✅ **Skeleton loading** durante carga  
✅ **Estados visuales** (error, empty, filtered-empty)  
✅ **Filtros por columna** integrados  
✅ **Acciones personalizables** por fila  
✅ **Paginación** incluida  
✅ **Ordenamiento** por columnas  

## Ejemplo de Implementación

```typescript
// logs.component.ts
import { Component } from '@angular/core';
import { DataTableComponent, TableColumn, TableAction, TableState } from '../shared/components/data-table/data-table.component';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [DataTableComponent],
  template: `
    <div class="page-container">
      <div class="page-content">
        <!-- Header -->
        <div class="page-header">
          <div class="header-content">
            <h1 class="page-title text-texfina text-primary">Logs del Sistema</h1>
            <p class="page-subtitle text-texfina text-muted">
              Supervisa la actividad del sistema en tiempo real
            </p>
          </div>
          <div class="header-actions">
            <button class="btn-texfina btn-secondary" (click)="cargaMasiva()">
              Carga Masiva
            </button>
            <button class="btn-texfina btn-primary" (click)="agregar()">
              Agregar Log
            </button>
          </div>
        </div>

        <!-- Filtro General -->
        <div class="filters-card">
          <div class="filters-content">
            <form [formGroup]="filtroGeneralForm" class="filters-form">
              <div class="filters-grid">
                <div class="filter-group">
                  <div class="simple-input-wrapper">
                    <input
                      class="simple-input"
                      formControlName="busquedaGeneral"
                      placeholder="Buscar en acción, descripción, módulo, IP..."
                      type="text"
                    />
                    <button
                      class="btn-limpiar"
                      type="button"
                      (click)="limpiarFiltroGeneral()"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Data Table Reutilizable -->
        <app-data-table
          [columns]="tableColumns"
          [data]="logs"
          [actions]="tableActions"
          [state]="tableState"
          [showColumnFilters]="true"
          [showPagination]="true"
          emptyIcon="description"
          emptyTitle="No hay logs registrados"
          emptySubtitle="Los logs del sistema aparecerán aquí automáticamente"
          emptyActionText="Agregar Primer Log"
          (actionClicked)="handleAction($event)"
          (sortChanged)="handleSort($event)"
          (filtersChanged)="handleFilters($event)"
          (retryClicked)="reintentarCarga()"
          (addNewClicked)="agregar()"
        ></app-data-table>
      </div>
    </div>
  `
})
export class LogsComponent {
  // Configuración de columnas
  tableColumns: TableColumn[] = [
    {
      key: 'id',
      title: 'ID',
      type: 'badge',
      sortable: true,
      filterable: true,
      width: '80px'
    },
    {
      key: 'timestamp',
      title: 'Fecha/Hora',
      type: 'date',
      sortable: true,
      filterable: true,
      width: '140px'
    },
    {
      key: 'usuario',
      title: 'Usuario',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '200px'
    },
    {
      key: 'accion',
      title: 'Acción',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '150px'
    },
    {
      key: 'modulo',
      title: 'Módulo',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '120px'
    },
    {
      key: 'ip_origen',
      title: 'IP Origen',
      type: 'text',
      sortable: true,
      filterable: true,
      width: '120px',
      pinned: false // Cambiar a true para anclar columna
    }
  ];

  // Configuración de acciones
  tableActions: TableAction[] = [
    {
      icon: 'visibility',
      tooltip: 'Ver detalle',
      action: 'view',
      color: 'primary'
    },
    {
      icon: 'delete',
      tooltip: 'Eliminar log',
      action: 'delete',
      color: 'warn'
    }
  ];

  // Estado de la tabla
  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  logs: any[] = [];
  filtroGeneralForm = this.fb.group({ busquedaGeneral: [''] });

  constructor(private fb: FormBuilder) {}

  // Manejar acciones
  handleAction(event: {action: string, item: any}) {
    switch (event.action) {
      case 'view':
        this.verDetalle(event.item);
        break;
      case 'delete':
        this.eliminar(event.item);
        break;
    }
  }

  handleSort(event: {column: string, direction: 'asc' | 'desc'}) {
    console.log('Ordenar:', event);
  }

  handleFilters(filters: any) {
    console.log('Filtros aplicados:', filters);
  }

  reintentarCarga() {
    this.tableState = {...this.tableState, loading: true};
    // Lógica de recarga
  }

  agregar() {
    // Lógica para agregar
  }
}
```

## Funcionalidades Principales

### 1. Tecla F3 para Toggle de Filtros
Presiona **F3** en cualquier momento para mostrar/ocultar los filtros de columna.

### 2. Columnas Ancladas (Pin)
```typescript
{
  key: 'codigo',
  title: 'Código',
  pinned: true, // ← Ancla esta columna al lado izquierdo
  width: '100px'
}
```

### 3. Estados de Carga
```typescript
tableState: TableState = {
  loading: true,    // Muestra skeleton
  error: false,     // Muestra estado de error
  empty: false,     // Muestra estado vacío
  filteredEmpty: false // Muestra "no hay resultados"
};
```

### 4. Acciones Condicionales
```typescript
{
  icon: 'edit',
  tooltip: 'Editar',
  action: 'edit',
  condition: (item) => item.editable // Solo si es editable
}
```

### 5. Tipos de Columna
- `text`: Texto normal
- `badge`: Estilo badge/etiqueta  
- `number`: Números con formato
- `date`: Fechas formateadas
- `actions`: Columna de acciones

## Ventajas del Componente Reutilizable

1. **Consistencia**: Mismo diseño en toda la aplicación
2. **Mantenimiento**: Un solo lugar para cambios
3. **Funcionalidades**: F3, pin, responsive, skeleton automático
4. **Performance**: Optimizado para grandes datasets
5. **Accesibilidad**: Tooltips, keyboard navigation
6. **Responsive**: Se adapta automáticamente a móviles

## Implementación Gradual

Puedes migrar componente por componente:
1. **Logs** ✅ (ejemplo completo arriba)
2. **Auditoría** → Siguiente
3. **Roles** → Siguiente  
4. **Stock** → Siguiente
5. **Materiales** → Siguiente
6. **Proveedores** → Siguiente

Cada migración toma ~15 minutos y mejora significativamente la UX.