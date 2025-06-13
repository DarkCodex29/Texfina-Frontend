import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MaterialService } from '../services/material.service';
import { Proveedor } from '../models/insumo.model';
import { DetalleProveedorDialogComponent } from './detalle-proveedor-dialog/detalle-proveedor-dialog';
import { EditarProveedorDialogComponent } from './editar-proveedor-dialog/editar-proveedor-dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-proveedores',
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
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
    MatSortModule,
  ],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss'],
})
export class ProveedoresComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  proveedores: Proveedor[] = [];
  dataSource = new MatTableDataSource<Proveedor>([]);
  filtrosForm: FormGroup;
  filtrosExpanded: boolean = true;
  private destroy$ = new Subject<void>();

  displayedColumns: string[] = [
    'empresa',
    'ruc',
    'contacto',
    'direccion',
    'acciones',
  ];

  get proveedoresFiltrados(): Proveedor[] {
    return this.dataSource.data;
  }

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      empresa: [''],
      ruc: [''],
      contacto: [''],
      direccion: [''],
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
    this.configurarFiltrosEnTiempoReal();
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  configurarFiltrosEnTiempoReal(): void {
    this.filtrosForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.aplicarFiltros();
      });
  }

  cargarProveedores(): void {
    this.materialService.getProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores;
      this.dataSource.data = [...proveedores];
    });
  }

  aplicarFiltros(): void {
    const filtros = this.filtrosForm.value;
    let proveedoresFiltrados = [...this.proveedores];

    if (filtros.empresa && filtros.empresa.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.empresa?.toLowerCase().includes(filtros.empresa.toLowerCase())
      );
    }

    if (filtros.ruc && filtros.ruc.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.ruc?.toLowerCase().includes(filtros.ruc.toLowerCase())
      );
    }

    if (filtros.contacto && filtros.contacto.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.contacto
          ?.toLowerCase()
          .includes(filtros.contacto.toLowerCase())
      );
    }

    if (filtros.direccion && filtros.direccion.trim()) {
      proveedoresFiltrados = proveedoresFiltrados.filter((proveedor) =>
        proveedor.direccion
          ?.toLowerCase()
          .includes(filtros.direccion.toLowerCase())
      );
    }

    this.dataSource.data = proveedoresFiltrados;
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.dataSource.data = [...this.proveedores];
  }

  toggleFiltros(): void {
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

  formatearCodigo(id?: number): string {
    if (!id) return '00000';
    return id.toString().padStart(5, '0');
  }

  abrirNuevoProveedor(): void {
    const dialogRef = this.dialog.open(EditarProveedorDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { esNuevo: true },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarProveedores();
      }
    });
  }

  verDetalle(proveedor: Proveedor): void {
    this.dialog.open(DetalleProveedorDialogComponent, {
      width: '600px',
      data: proveedor,
    });
  }

  editarProveedor(proveedor: Proveedor): void {
    const dialogRef = this.dialog.open(EditarProveedorDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { proveedor, esNuevo: false },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarProveedores();
      }
    });
  }
}
