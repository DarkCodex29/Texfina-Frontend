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
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MaterialService } from '../services/material.service';
import { Insumo, Proveedor } from '../models/insumo.model';
import { RegistroMaterialDialogComponent } from './registro-material-dialog/registro-material-dialog.component';
import { IngresoMaterialDialogComponent } from './ingreso-material-dialog/ingreso-material-dialog.component';
import { DetalleMaterialDialogComponent } from './detalle-material-dialog/detalle-material-dialog.component';

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
  ],
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss'],
})
export class MaterialesComponent implements OnInit {
  materiales: Insumo[] = [];
  proveedores: Proveedor[] = [];
  filtrosForm: FormGroup;
  displayedColumns: string[] = [
    'lote',
    'descripcion',
    'proveedor',
    'cantidad',
    'unidad',
    'fecha_registro',
    'precio',
    'acciones',
  ];

  constructor(
    private materialService: MaterialService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    this.filtrosForm = this.fb.group({
      codigo: [''],
      descripcion: [''],
      proveedor: [''],
    });
  }

  ngOnInit(): void {
    this.cargarMateriales();
    this.cargarProveedores();
  }

  cargarMateriales(): void {
    this.materialService.getMateriales().subscribe((materiales) => {
      this.materiales = materiales;
    });
  }

  cargarProveedores(): void {
    this.materialService.getProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores;
    });
  }

  buscar(): void {
    const filtros = this.filtrosForm.value;
    this.materialService.buscarMateriales(filtros).subscribe((materiales) => {
      this.materiales = materiales;
    });
  }

  limpiarFiltros(): void {
    this.filtrosForm.reset();
    this.cargarMateriales();
  }

  abrirRegistroMaterial(): void {
    const dialogRef = this.dialog.open(RegistroMaterialDialogComponent, {
      width: '800px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarMateriales();
      }
    });
  }

  abrirIngresoMaterial(): void {
    const dialogRef = this.dialog.open(IngresoMaterialDialogComponent, {
      width: '700px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Actualizar stock o datos necesarios
        console.log('Ingreso registrado:', result);
      }
    });
  }

  abrirAgregarLote(): void {
    // Implementar modal para agregar lote
    console.log('Abrir modal de agregar lote');
  }

  verDetalle(material: Insumo): void {
    this.dialog.open(DetalleMaterialDialogComponent, {
      width: '800px',
      data: material,
    });
  }

  editarMaterial(material: Insumo): void {
    const dialogRef = this.dialog.open(RegistroMaterialDialogComponent, {
      width: '800px',
      data: { material, esEdicion: true },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.cargarMateriales();
      }
    });
  }

  getProveedorNombre(idProveedor?: number): string {
    if (!idProveedor) return '-';
    const proveedor = this.proveedores.find(
      (p) => p.id_proveedor === idProveedor
    );
    return proveedor?.empresa || '-';
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES');
  }
}
