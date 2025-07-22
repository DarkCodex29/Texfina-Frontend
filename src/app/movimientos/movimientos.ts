import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PrimeDataTableComponent } from '../shared/components/prime-data-table/prime-data-table.component';
import { TableColumn, TableAction, TableButtonConfig, TableState } from '../shared/components/prime-data-table/prime-data-table.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TexfinaApiService } from '../services/texfina-api.service';
import { MovimientosConfig } from '../shared/configs/movimientos-config';
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PrimeDataTableComponent
  ],
  providers: [DialogService],
  templateUrl: './movimientos.html',
  styleUrls: ['./movimientos.scss']
})
export class MovimientosComponent implements OnInit {
  data: any[] = [];
  ref: DynamicDialogRef | undefined;
  dropdownExportAbierto = false;

  tableState: TableState = {
    loading: false,
    error: false,
    empty: false,
    filteredEmpty: false
  };

  columns: TableColumn[] = [
    { key: 'fecha', title: 'Fecha', type: 'date' },
    { key: 'tipoMovimiento', title: 'Tipo Movimiento' },
    { key: 'qca', title: 'QCA' },
    { key: 'insumoNombre', title: 'Insumo' },
    { key: 'lote', title: 'Lote' },
    { key: 'cantidad', title: 'Cantidad', type: 'number' },
    { key: 'unidad', title: 'Unidad' },
    { key: 'almacenOrigen', title: 'Almacén Origen' },
    { key: 'almacenDestino', title: 'Almacén Destino' },
    { key: 'responsable', title: 'Responsable' },
    { key: 'estado', title: 'Estado' }
  ];

  actions: TableAction[] = [
    {
      icon: 'pi pi-eye',
      tooltip: 'Ver',
      action: 'view',
      color: 'secondary'
    },
    {
      icon: 'pi pi-pencil',
      tooltip: 'Editar',
      action: 'edit',
      color: 'primary'
    },
    {
      icon: 'pi pi-trash',
      tooltip: 'Eliminar',
      action: 'delete',
      color: 'danger'
    }
  ];

  buttons: TableButtonConfig[] = [
    {
      action: 'add',
      label: 'Nuevo Movimiento',
      icon: 'pi pi-plus',
      color: 'primary'
    }
  ];

  globalFilterFields: string[] = ['tipoMovimiento', 'qca', 'insumoNombre', 'lote', 'responsable', 'estado'];

  constructor(
    private api: TexfinaApiService,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.tableState.loading = true;
    // TODO: Implementar endpoint de movimientos en el API
    setTimeout(() => {
      this.data = [
        {
          fecha: '2024-01-15',
          tipoMovimiento: 'Traslado',
          qca: 'QCA001',
          insumoNombre: 'Colorante Rojo Reactivo',
          lote: 'LOT-2024-001',
          cantidad: 25.5,
          unidad: 'KG',
          almacenOrigen: 'Almacén Principal',
          almacenDestino: 'Almacén Corpac',
          responsable: 'Juan Pérez',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-14',
          tipoMovimiento: 'Transferencia',
          qca: 'QCA002',
          insumoNombre: 'Colorante Azul Naval',
          lote: 'LOT-2024-002',
          cantidad: 50.0,
          unidad: 'KG',
          almacenOrigen: 'Almacén Tránsito',
          almacenDestino: 'Almacén Principal',
          responsable: 'María García',
          estado: 'En Proceso'
        },
        {
          fecha: '2024-01-13',
          tipoMovimiento: 'Reubicación',
          qca: 'QCA003',
          insumoNombre: 'Colorante Verde Brillante',
          lote: 'LOT-2024-003',
          cantidad: 15.8,
          unidad: 'KG',
          almacenOrigen: 'Almacén Principal',
          almacenDestino: 'Almacén Principal',
          responsable: 'Carlos López',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-12',
          tipoMovimiento: 'Traslado',
          qca: 'QCA004',
          insumoNombre: 'Colorante Negro Reactivo',
          lote: 'LOT-2024-004',
          cantidad: 30.2,
          unidad: 'KG',
          almacenOrigen: 'Almacén Corpac',
          almacenDestino: 'Almacén Tránsito',
          responsable: 'Ana Torres',
          estado: 'Pendiente'
        },
        {
          fecha: '2024-01-11',
          tipoMovimiento: 'Transferencia',
          qca: 'QCA005',
          insumoNombre: 'Colorante Amarillo Disperso',
          lote: 'LOT-2024-005',
          cantidad: 40.7,
          unidad: 'KG',
          almacenOrigen: 'Almacén Principal',
          almacenDestino: 'Almacén Corpac',
          responsable: 'Roberto Silva',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-10',
          tipoMovimiento: 'Reubicación',
          qca: 'QCA006',
          insumoNombre: 'Colorante Rosa Fluorescente',
          lote: 'LOT-2024-006',
          cantidad: 12.3,
          unidad: 'KG',
          almacenOrigen: 'Almacén Tránsito',
          almacenDestino: 'Almacén Principal',
          responsable: 'Laura Mendoza',
          estado: 'En Proceso'
        }
      ];
      this.tableState.loading = false;
      this.tableState.empty = this.data.length === 0;
    }, 800);
  }

  recargarDatos(): void {
    this.loadData();
  }

  onActionClick(event: any): void {
    const action = typeof event === 'string' ? event : event.action;
    const item = typeof event === 'string' ? null : (event.data || event.item);
    
    switch (action) {
      case 'view':
        this.verDetalle(item);
        break;
      case 'edit':
        this.editarMovimiento(item);
        break;
      case 'delete':
        this.eliminarMovimiento(item);
        break;
    }
  }

  onButtonClick(event: any): void {
    const action = typeof event === 'string' ? event : event.action;
    
    switch (action) {
      case 'add':
        this.nuevoMovimiento();
        break;
    }
  }

  verDetalle(movimiento: any): void {
    const config = MovimientosConfig.detalle(movimiento);
    
    const dialogRef = this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: config,
    });
  }

  editarMovimiento(movimiento: any): void {
    const config = MovimientosConfig.formulario(true, movimiento);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '900px',
      disableClose: true,
      data: config,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        console.log('Movimiento actualizado:', resultado.datos);
        // TODO: Integrar con API para actualizar
        this.loadData(); // Recargar datos
      }
    });
  }

  eliminarMovimiento(movimiento: any): void {
    const config = MovimientosConfig.eliminarMovimiento(movimiento);
    
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      disableClose: true,
      data: config,
    });
    
    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        console.log('Eliminar movimiento:', movimiento);
        // TODO: Integrar con API para eliminar
        this.loadData(); // Recargar datos
      }
    });
  }

  nuevoMovimiento(): void {
    const config = MovimientosConfig.formulario(false);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '900px',
      disableClose: true,
      data: config,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        console.log('Nuevo movimiento creado:', resultado.datos);
        // TODO: Integrar con API para crear
        this.loadData(); // Recargar datos
      }
    });
  }

  viewMovimiento(movimiento: any) {
    // TODO: Implementar vista de detalle de movimiento
    console.log('Ver movimiento:', movimiento);
  }

  toggleDropdownExport() {
    this.dropdownExportAbierto = !this.dropdownExportAbierto;
  }

  exportarExcel() {
    console.log('Exportar a Excel');
    this.dropdownExportAbierto = false;
  }

  exportarPDF() {
    console.log('Exportar a PDF');
    this.dropdownExportAbierto = false;
  }
}