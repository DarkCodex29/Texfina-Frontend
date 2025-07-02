import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CampoFormulario {
  key: string;
  label: string;
  tipo: 'text' | 'number' | 'select';
  placeholder?: string;
  maxLength?: number;
  step?: number;
  min?: number;
  obligatorio?: boolean;
  ancho?: 'normal' | 'completo';
  opciones?: { value: any; label: string }[];
}

export interface ConfiguracionFormulario {
  titulo: {
    agregar: string;
    editar: string;
  };
  entidad: string;
  entidadArticulo: string;
  esEdicion: boolean;
  filas: CampoFormulario[][];
  datosIniciales?: any;
}

@Component({
  selector: 'app-formulario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './formulario-dialog.component.html',
  styleUrls: ['./formulario-dialog.component.scss'],
})
export class FormularioDialogComponent implements OnInit {
  formulario!: FormGroup;
  config: ConfiguracionFormulario;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<FormularioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfiguracionFormulario
  ) {
    this.config = data;
  }

  ngOnInit(): void {
    this.crearFormulario();
    if (this.config.datosIniciales) {
      this.formulario.patchValue(this.config.datosIniciales);
    }
  }

  private crearFormulario(): void {
    const controles: any = {};

    this.config.filas.forEach((fila) => {
      fila.forEach((campo) => {
        const validators = [];
        if (campo.obligatorio) {
          validators.push(Validators.required);
        }
        if (campo.maxLength) {
          validators.push(Validators.maxLength(campo.maxLength));
        }

        controles[campo.key] = ['', validators];
      });
    });

    this.formulario = this.fb.group(controles);
  }

  onSubmit(): void {
    if (this.formulario.valid) {
      this.dialogRef.close({
        accion: 'guardar',
        datos: this.formulario.value,
      });
    } else {
      this.marcarCamposComoTocados();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.formulario.controls).forEach((key) => {
      this.formulario.get(key)?.markAsTouched();
    });
  }
}
