import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaterialService } from '../../services/material.service';
import {
  Insumo,
  Proveedor,
  Unidad,
  Lote,
  Ingreso,
} from '../../models/insumo.model';

@Component({
  selector: 'app-ingreso-material-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './ingreso-material-dialog.component.html',
  styleUrls: ['./ingreso-material-dialog.component.scss'],
})
export class IngresoMaterialDialogComponent implements OnInit {
  ingresoForm: FormGroup;
  materiales: Insumo[] = [];
  proveedores: Proveedor[] = [];
  unidades: Unidad[] = [];
  lotes: Lote[] = [];

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<IngresoMaterialDialogComponent>
  ) {
    this.ingresoForm = this.fb.group({
      id_insumo: ['', [Validators.required]],
      fecha: [new Date().toISOString().split('T')[0], [Validators.required]],
      cantidad: ['', [Validators.required, Validators.min(0.01)]],
      id_unidad: [''],
      presentacion: [''],
      id_lote: [''],
      precio_unitario_historico: [0, [Validators.min(0)]],
      precio_total_formula: [0],
      numero_remision: [''],
      orden_compra: [''],
      id_proveedor: [''],
      estado: ['PENDIENTE'],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.configurarCalculos();
  }

  cargarDatos(): void {
    this.materialService.getMateriales().subscribe((materiales) => {
      this.materiales = materiales;
    });

    this.materialService.getProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores;
    });

    this.materialService.getUnidades().subscribe((unidades) => {
      this.unidades = unidades;
    });

    this.materialService.getLotes().subscribe((lotes) => {
      this.lotes = lotes;
    });
  }

  configurarCalculos(): void {
    // Calcular precio total automáticamente
    this.ingresoForm.get('cantidad')?.valueChanges.subscribe(() => {
      this.calcularPrecioTotal();
    });

    this.ingresoForm
      .get('precio_unitario_historico')
      ?.valueChanges.subscribe(() => {
        this.calcularPrecioTotal();
      });
  }

  calcularPrecioTotal(): void {
    const cantidad = this.ingresoForm.get('cantidad')?.value || 0;
    const precioUnitario =
      this.ingresoForm.get('precio_unitario_historico')?.value || 0;
    const precioTotal = cantidad * precioUnitario;

    this.ingresoForm
      .get('precio_total_formula')
      ?.setValue(precioTotal, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.ingresoForm.valid) {
      const formValue = this.ingresoForm.value;

      const ingreso: Ingreso = {
        id_insumo: parseInt(formValue.id_insumo),
        fecha: new Date(formValue.fecha),
        cantidad: parseFloat(formValue.cantidad),
        id_unidad: formValue.id_unidad,
        presentacion: formValue.presentacion,
        id_lote: formValue.id_lote ? parseInt(formValue.id_lote) : undefined,
        precio_unitario_historico: parseFloat(
          formValue.precio_unitario_historico
        ),
        precio_total_formula: parseFloat(formValue.precio_total_formula),
        numero_remision: formValue.numero_remision,
        orden_compra: formValue.orden_compra,
        estado: formValue.estado,
      };

      this.materialService.crearIngreso(ingreso).subscribe({
        next: (resultado) => {
          this.dialogRef.close(resultado);
        },
        error: (error) => {
          console.error('Error al registrar ingreso:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
