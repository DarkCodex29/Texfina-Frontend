import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Consumo } from '../../models/consumo.model';
import { Insumo, Lote } from '../../models/insumo.model';

interface RegistroConsumoData {
  esEdicion: boolean;
  consumo?: Consumo;
  insumos: Insumo[];
  lotes: Lote[];
  titulo: string;
}

@Component({
  selector: 'app-registro-consumo-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './registro-consumo-dialog.component.html',
  styleUrls: ['./registro-consumo-dialog.component.scss'],
})
export class RegistroConsumoDialogComponent implements OnInit {
  consumoForm: FormGroup;
  esEdicion: boolean;
  consumo?: Consumo;
  insumos: Insumo[];
  lotes: Lote[];
  titulo: string;
  subtitulo: string;
  textoBoton: string;
  isSubmitting = false;
  unidadSeleccionada = '';

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RegistroConsumoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: RegistroConsumoData
  ) {
    this.esEdicion = data.esEdicion;
    this.consumo = data.consumo;
    this.insumos = data.insumos || [];
    this.lotes = data.lotes || [];
    this.titulo = data.titulo;

    this.subtitulo = this.esEdicion
      ? 'Modifica los datos del consumo seleccionado'
      : 'Completa los datos para registrar un nuevo consumo';

    this.textoBoton = this.esEdicion
      ? 'Actualizar Consumo'
      : 'Registrar Consumo';

    this.consumoForm = this.fb.group({
      fecha: ['', Validators.required],
      area: ['', Validators.required],
      id_insumo: ['', Validators.required],
      id_lote: [''],
      cantidad: ['', [Validators.required, Validators.min(0.01)]],
      responsable: [''],
      estado: ['PENDIENTE'],
      observaciones: [''],
    });

    console.log('Data recibida en modal registro consumo:', this.data);
  }

  ngOnInit(): void {
    if (this.esEdicion && this.consumo) {
      this.cargarDatosConsumo();
    } else {
      const fechaHoy = new Date().toISOString().split('T')[0];
      this.consumoForm.patchValue({ fecha: fechaHoy });
    }
  }

  private cargarDatosConsumo(): void {
    if (!this.consumo) return;

    const fechaFormateada = this.consumo.fecha
      ? new Date(this.consumo.fecha).toISOString().split('T')[0]
      : '';

    this.consumoForm.patchValue({
      fecha: fechaFormateada,
      area: this.consumo.area || '',
      id_insumo: this.consumo.id_insumo || '',
      id_lote: this.consumo.id_lote || '',
      cantidad: this.consumo.cantidad || '',
      responsable: this.consumo.responsable || '',
      estado: this.consumo.estado || 'PENDIENTE',
      observaciones: this.consumo.observaciones || '',
    });

    this.actualizarUnidadSeleccionada();
  }

  onInsumoChange(): void {
    this.actualizarUnidadSeleccionada();
  }

  private actualizarUnidadSeleccionada(): void {
    const insumoId = this.consumoForm.get('id_insumo')?.value;
    if (insumoId) {
      const insumo = this.insumos.find(
        (i) => i.id_insumo === parseInt(insumoId)
      );
      this.unidadSeleccionada = insumo?.unidad?.nombre || 'Sin unidad';
    } else {
      this.unidadSeleccionada = '';
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.consumoForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  async onSubmit(): Promise<void> {
    if (this.consumoForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      try {
        const formData = this.consumoForm.value;

        const consumoData: Partial<Consumo> = {
          fecha: new Date(formData.fecha),
          area: formData.area,
          id_insumo: parseInt(formData.id_insumo),
          id_lote: formData.id_lote ? parseInt(formData.id_lote) : undefined,
          cantidad: parseFloat(formData.cantidad),
          responsable: formData.responsable || undefined,
          estado: formData.estado,
          observaciones: formData.observaciones || undefined,
        };

        if (this.esEdicion && this.consumo?.id_consumo) {
          consumoData.id_consumo = this.consumo.id_consumo;
        }

        console.log('Datos del consumo a guardar:', consumoData);

        await new Promise((resolve) => setTimeout(resolve, 1000));

        this.dialogRef.close(consumoData);
      } catch (error) {
        console.error('Error al guardar consumo:', error);
      } finally {
        this.isSubmitting = false;
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
