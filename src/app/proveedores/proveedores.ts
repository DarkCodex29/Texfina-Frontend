import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
} from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MaterialService } from '../services/material.service';
import { Proveedor } from '../models/insumo.model';
import { DetalleProveedorDialogComponent } from './detalle-proveedor-dialog/detalle-proveedor-dialog';
import { EditarProveedorDialogComponent } from './editar-proveedor-dialog/editar-proveedor-dialog';

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
  ],
  templateUrl: './proveedores.html',
  styleUrls: ['./proveedores.scss'],
})
export class ProveedoresComponent implements OnInit {
  proveedores: Proveedor[] = [];
  filtrosForm: FormGroup;
  displayedColumns: string[] = [
    'empresa',
    'ruc',
    'contacto',
    'direccion',
    'acciones',
  ];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      empresa: [''],
      ruc: [''],
      contacto: [''],
    });
  }

  ngOnInit(): void {
    this.cargarProveedores();
  }

  cargarProveedores(): void {
    this.materialService.getProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    this.materialService.buscarProveedores(filtros).subscribe((proveedores) => {
      this.proveedores = proveedores;
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.cargarProveedores();
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
