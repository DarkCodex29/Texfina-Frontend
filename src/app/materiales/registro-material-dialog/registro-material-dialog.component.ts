import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaterialService } from '../../services/material.service';
import {
  Insumo,
  Unidad,
  Clase,
  Proveedor,
  Almacen,
} from '../../models/insumo.model';

@Component({
  selector: 'app-registro-material-dialog',
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
  templateUrl: './registro-material-dialog.component.html',
  styleUrls: ['./registro-material-dialog.component.scss'],
})
export class RegistroMaterialDialogComponent implements OnInit {
  materialForm: FormGroup;
  unidades: Unidad[] = [];
  clases: Clase[] = [];
  proveedores: Proveedor[] = [];
  almacenes: Almacen[] = [];
  esEdicion = false;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<RegistroMaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.esEdicion = data?.esEdicion || false;

    this.materialForm = this.fb.group({
      id_fox: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      id_clase: ['', [Validators.required]],
      peso_unitario: [null, [Validators.required, Validators.min(0)]],
      id_unidad: ['', [Validators.required]],
      presentacion: ['', [Validators.required]],
      precio_unitario: [null, [Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();

    if (this.esEdicion && this.data?.material) {
      this.cargarMaterialParaEdicion(this.data.material);
    } else {
      // Valores por defecto para nuevo material
      this.materialForm.patchValue({
        id_fox: 'QUIM003',
        nombre: 'Nuevo Material',
        id_clase: 'QUIM',
        peso_unitario: 1.0,
        id_unidad: 'KG',
        presentacion: 'Bolsa 25kg',
        precio_unitario: 0,
      });
    }
  }

  cargarDatos(): void {
    this.materialService.getUnidades().subscribe((unidades) => {
      this.unidades = unidades;
    });

    this.materialService.getClases().subscribe((clases) => {
      this.clases = clases;
    });

    this.materialService.getProveedores().subscribe((proveedores) => {
      this.proveedores = proveedores;
    });

    this.materialService.getAlmacenes().subscribe((almacenes) => {
      this.almacenes = almacenes;
    });
  }

  cargarMaterialParaEdicion(material: Insumo): void {
    this.materialForm.patchValue({
      id_fox: material.id_fox || '',
      nombre: material.nombre || '',
      id_clase: material.id_clase || '',
      peso_unitario: material.peso_unitario || 0,
      id_unidad: material.id_unidad || '',
      presentacion: material.presentacion || '',
      precio_unitario: material.precio_unitario || 0,
    });
  }

  get tituloModal(): string {
    return this.esEdicion ? 'Editar material' : 'Registro de material';
  }

  get textoBotonPrincipal(): string {
    return this.esEdicion ? 'Guardar' : 'Registrar';
  }

  onSubmit(): void {
    if (this.materialForm.valid) {
      const formValue = this.materialForm.value;

      const material: Insumo = {
        id_fox: formValue.id_fox,
        nombre: formValue.nombre,
        id_clase: formValue.id_clase,
        peso_unitario: formValue.peso_unitario,
        id_unidad: formValue.id_unidad,
        presentacion: formValue.presentacion,
        precio_unitario: formValue.precio_unitario,
      };

      if (this.esEdicion && this.data?.material) {
        material.id_insumo = this.data.material.id_insumo;
        this.materialService.actualizarMaterial(material).subscribe({
          next: (resultado) => {
            this.dialogRef.close(resultado);
          },
          error: (error) => {
            console.error('Error al actualizar material:', error);
          },
        });
      } else {
        this.materialService.crearMaterial(material).subscribe({
          next: (resultado) => {
            this.dialogRef.close(resultado);
          },
          error: (error) => {
            console.error('Error al crear material:', error);
          },
        });
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
