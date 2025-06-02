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
import { Insumo, Proveedor } from '../../models/insumo.model';

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

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<IngresoMaterialDialogComponent>
  ) {
    this.ingresoForm = this.fb.group({
      stock_actual: ['5 kg'],
      nueva_cantidad: ['', [Validators.required, Validators.min(0)]],
      codigo: ['103832'],
      material: ['Tinte1'],
      proveedor: ['Texfina'],
      lote: ['KN542'],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.materialService.getMateriales().subscribe((materiales) => {
      this.materiales = materiales;
    });

    this.materialService.getProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores;
    });
  }

  onSubmit(): void {
    if (this.ingresoForm.valid) {
      const formValue = this.ingresoForm.value;

      const ingreso = {
        fecha: new Date(),
        cantidad: parseFloat(formValue.nueva_cantidad),
        codigo: formValue.codigo,
        material: formValue.material,
        proveedor: formValue.proveedor,
        lote: formValue.lote,
        stock_actual: formValue.stock_actual,
      };

      this.materialService.registrarIngreso(ingreso as any).subscribe({
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
