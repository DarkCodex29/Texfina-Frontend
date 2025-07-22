import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PrimeDataTableComponent } from '../shared/components/prime-data-table/prime-data-table.component';
import { TableColumn, TableAction, TableButtonConfig, TableState } from '../shared/components/prime-data-table/prime-data-table.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { TexfinaApiService } from '../services/texfina-api.service';
import { BalanzaService } from '../services/balanza.service';
import { PesadoConfig } from '../shared/configs/pesado-config';
import { FormularioDialogComponent } from '../shared/dialogs/formulario-dialog/formulario-dialog.component';
import { DetalleDialogComponent } from '../shared/dialogs/detalle-dialog/detalle-dialog.component';
import { ConfirmacionDialogComponent } from '../shared/dialogs/confirmacion-dialog/confirmacion-dialog.component';

@Component({
  selector: 'app-pesado',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PrimeDataTableComponent
  ],
  providers: [DialogService],
  templateUrl: './pesado.html',
  styleUrls: ['./pesado.scss']
})
export class PesadoComponent implements OnInit {
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
    { key: 'vale', title: 'N° Vale' },
    { key: 'qca', title: 'QCA' },
    { key: 'insumoNombre', title: 'Insumo' },
    { key: 'lote', title: 'Lote' },
    { key: 'cantidadSolicitada', title: 'Cant. Solicitada', type: 'number' },
    { key: 'cantidadPesada', title: 'Cant. Pesada', type: 'number' },
    { key: 'unidad', title: 'Unidad' },
    { key: 'balanza', title: 'Balanza' },
    { key: 'operador', title: 'Operador' },
    { key: 'area', title: 'Área' },
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
      label: 'Nuevo Pesado',
      icon: 'pi pi-plus',
      color: 'primary'
    }
  ];

  globalFilterFields: string[] = ['vale', 'qca', 'insumoNombre', 'lote', 'balanza', 'operador', 'area', 'estado'];

  constructor(
    private api: TexfinaApiService,
    private balanzaService: BalanzaService,
    private dialogService: DialogService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.tableState.loading = true;
    // TODO: Implementar endpoint de pesados en el API
    setTimeout(() => {
      this.data = [
        {
          fecha: '2024-01-15',
          vale: 'VALE-001',
          qca: 'QCA001',
          insumoNombre: 'Colorante Rojo Reactivo',
          lote: 'LOT-2024-001',
          cantidadSolicitada: 25.0,
          cantidadPesada: 24.8,
          unidad: 'KG',
          balanza: 'Mettler MS32001L',
          operador: 'Juan Pérez',
          area: 'Teñido Línea A',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-15',
          vale: 'VALE-002',
          qca: 'QCA002',
          insumoNombre: 'Colorante Azul Naval',
          lote: 'LOT-2024-002',
          cantidadSolicitada: 15.5,
          cantidadPesada: 15.6,
          unidad: 'KG',
          balanza: 'Mettler MS303TS',
          operador: 'María García',
          area: 'Teñido Línea B',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-14',
          vale: 'VALE-003',
          qca: 'QCA003',
          insumoNombre: 'Colorante Verde Brillante',
          lote: 'LOT-2024-003',
          cantidadSolicitada: 8.2,
          cantidadPesada: 8.1,
          unidad: 'KG',
          balanza: 'Mettler MS303TS',
          operador: 'Carlos López',
          area: 'Teñido Línea C',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-14',
          vale: 'VALE-004',
          qca: 'QCA004',
          insumoNombre: 'Colorante Negro Reactivo',
          lote: 'LOT-2024-004',
          cantidadSolicitada: 32.0,
          cantidadPesada: 31.9,
          unidad: 'KG',
          balanza: 'Mettler MS32001L',
          operador: 'Ana Torres',
          area: 'Teñido Línea A',
          estado: 'En Proceso'
        },
        {
          fecha: '2024-01-13',
          vale: 'VALE-005',
          qca: 'QCA005',
          insumoNombre: 'Colorante Amarillo Disperso',
          lote: 'LOT-2024-005',
          cantidadSolicitada: 12.8,
          cantidadPesada: 12.7,
          unidad: 'KG',
          balanza: 'Mettler MS303TS',
          operador: 'Roberto Silva',
          area: 'Teñido Línea B',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-13',
          vale: 'VALE-006',
          qca: 'QCA006',
          insumoNombre: 'Colorante Rosa Fluorescente',
          lote: 'LOT-2024-006',
          cantidadSolicitada: 5.5,
          cantidadPesada: 0.0,
          unidad: 'KG',
          balanza: 'Mettler MS303TS',
          operador: 'Laura Mendoza',
          area: 'Teñido Línea C',
          estado: 'Pendiente'
        },
        {
          fecha: '2024-01-12',
          vale: 'VALE-007',
          qca: 'QCA007',
          insumoNombre: 'Colorante Violeta Básico',
          lote: 'LOT-2024-007',
          cantidadSolicitada: 18.3,
          cantidadPesada: 18.4,
          unidad: 'KG',
          balanza: 'Mettler MS32001L',
          operador: 'Diego Ramírez',
          area: 'Teñido Línea A',
          estado: 'Completado'
        },
        {
          fecha: '2024-01-12',
          vale: 'VALE-008',
          qca: 'QCA008',
          insumoNombre: 'Colorante Naranja Reactivo',
          lote: 'LOT-2024-008',
          cantidadSolicitada: 22.1,
          cantidadPesada: 22.0,
          unidad: 'KG',
          balanza: 'Mettler MS32001L',
          operador: 'Patricia Vega',
          area: 'Teñido Línea B',
          estado: 'Completado'
        }
      ];
      this.tableState.loading = false;
      this.tableState.empty = this.data.length === 0;
    }, 900);
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
        this.editarPesado(item);
        break;
      case 'delete':
        this.eliminarPesado(item);
        break;
    }
  }

  onButtonClick(event: any): void {
    const action = typeof event === 'string' ? event : event.action;
    
    switch (action) {
      case 'add':
        this.nuevoPesado();
        break;
    }
  }

  verDetalle(pesado: any): void {
    const config = PesadoConfig.detalle(pesado);
    
    const dialogRef = this.dialog.open(DetalleDialogComponent, {
      width: '800px',
      disableClose: true,
      data: config,
    });
  }

  editarPesado(pesado: any): void {
    const config = PesadoConfig.formulario(true, pesado);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '1000px',
      disableClose: true,
      data: config,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        console.log('Pesado actualizado:', resultado.datos);
        // TODO: Integrar con API para actualizar
        this.loadData(); // Recargar datos
      }
    });
  }

  eliminarPesado(pesado: any): void {
    const config = PesadoConfig.eliminarPesado(pesado);
    
    const dialogRef = this.dialog.open(ConfirmacionDialogComponent, {
      width: '500px',
      disableClose: true,
      data: config,
    });
    
    dialogRef.afterClosed().subscribe((confirmado) => {
      if (confirmado) {
        console.log('Eliminar pesado:', pesado);
        // TODO: Integrar con API para eliminar
        this.loadData(); // Recargar datos
      }
    });
  }

  nuevoPesado(): void {
    const config = PesadoConfig.formulario(false);
    
    const dialogRef = this.dialog.open(FormularioDialogComponent, {
      width: '1000px',
      disableClose: true,
      data: config,
    });

    dialogRef.afterClosed().subscribe((resultado) => {
      if (resultado?.accion === 'guardar') {
        console.log('Nuevo pesado creado:', resultado.datos);
        console.log('Balanza utilizada:', resultado.datos.balanza);
        console.log('Cantidad pesada:', resultado.datos.cantidadPesada);
        // TODO: Integrar con API para crear
        this.loadData(); // Recargar datos
      }
    });
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