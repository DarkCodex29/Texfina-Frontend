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
      codigo: ['', [Validators.required]],
      descripcion_material: ['', [Validators.required]],
      proveedor: ['', [Validators.required]],
      almacen: ['', [Validators.required]],
      unidad_medida_base: ['', [Validators.required]],
      tipo_material: ['', [Validators.required]],
      codigo_ean1: [''],
      codigo_ean2: [''],
    });
  }

  ngOnInit(): void {
    this.cargarDatos();

    if (this.esEdicion && this.data?.material) {
      this.cargarMaterialParaEdicion(this.data.material);
    } else {
      // Valores por defecto para nuevo material
      this.materialForm.patchValue({
        codigo: '103832',
        descripcion_material: 'Tinte1',
        proveedor: 'Texfina',
        almacen: 'Texfina',
        unidad_medida_base: 'KG',
        tipo_material: 'KG',
        codigo_ean1: '2345678907654',
        codigo_ean2: '432345676543',
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
      codigo: material.id_fox,
      descripcion_material: material.nombre,
      proveedor: 'Texfina', // Aquí debería venir de la relación
      almacen: 'Texfina',
      unidad_medida_base: material.id_unidad,
      tipo_material: material.id_unidad,
      codigo_ean1: '2345678907654',
      codigo_ean2: '432345676543',
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
        id_fox: formValue.codigo,
        nombre: formValue.descripcion_material,
        id_unidad: formValue.unidad_medida_base,
        id_clase: formValue.tipo_material === 'KG' ? 'TINTAS' : 'QUIM',
        peso_unitario: 1.0,
        presentacion: 'Bolsa 25kg',
        precio_unitario: 0,
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
