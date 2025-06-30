import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MaterialService } from '../../services/material.service';
import { Receta } from '../../models/insumo.model';

interface DialogData {
  esNuevo: boolean;
  receta?: Receta;
}

@Component({
  selector: 'app-editar-receta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './editar-receta-dialog.html',
  styleUrls: ['./editar-receta-dialog.scss'],
})
export class EditarRecetaDialogComponent {
  recetaForm: FormGroup;
  esNuevo: boolean;
  receta?: Receta;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<EditarRecetaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.esNuevo = data.esNuevo;
    this.receta = data.receta;

    this.recetaForm = this.fb.group({
      nombre: [
        this.receta?.nombre || '',
        [Validators.required, Validators.maxLength(200)],
      ],
    });

    console.log(
      'Modal recetas - esNuevo:',
      this.esNuevo,
      'receta:',
      this.receta
    );
  }

  formatearCodigo(id?: number): string {
    if (!id) return 'REC-0000';
    return `REC-${id.toString().padStart(4, '0')}`;
  }

  onSave(): void {
    if (this.recetaForm.invalid) {
      console.log('❌ Formulario inválido');
      return;
    }

    const recetaData: Receta = {
      ...this.recetaForm.value,
      ...(this.receta?.id_receta && { id_receta: this.receta.id_receta }),
    };

    console.log('💾 Guardando receta:', recetaData);

    if (this.esNuevo) {
      this.materialService.crearReceta(recetaData).subscribe({
        next: (nuevaReceta: Receta) => {
          console.log('✅ Receta creada exitosamente:', nuevaReceta);
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('❌ Error al crear receta:', error);
        },
      });
    } else {
      this.materialService.editarReceta(recetaData).subscribe({
        next: (recetaEditada: Receta) => {
          console.log('✅ Receta editada exitosamente:', recetaEditada);
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('❌ Error al editar receta:', error);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
