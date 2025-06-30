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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MaterialService } from '../../services/material.service';
import { Lote, Insumo, LoteFormDto } from '../../models/insumo.model';

interface DialogData {
  lote?: Lote;
  esNuevo: boolean;
  insumos: Insumo[];
}

@Component({
  selector: 'app-editar-lote-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatIconModule,
  ],
  templateUrl: './editar-lote-dialog.html',
  styleUrls: ['./editar-lote-dialog.scss'],
})
export class EditarLoteDialogComponent implements OnInit {
  loteForm: FormGroup;
  esNuevo: boolean;
  insumos: Insumo[];
  cargando = false;

  estadosLote = [
    { valor: 'ACTIVO', nombre: 'Activo' },
    { valor: 'AGOTADO', nombre: 'Agotado' },
    { valor: 'VENCIDO', nombre: 'Vencido' },
    { valor: 'RESERVADO', nombre: 'Reservado' },
  ];

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EditarLoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.esNuevo = data.esNuevo;
    this.insumos = data.insumos;

    this.loteForm = this.fb.group({
      id_insumo: [null, [Validators.required]],
      lote: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          Validators.pattern(/^[A-Z0-9_-]+$/),
        ],
      ],
      ubicacion: ['', [Validators.maxLength(200)]],
      stock_inicial: [null, [Validators.required, Validators.min(0)]],
      stock_actual: [null, [Validators.required, Validators.min(0)]],
      fecha_expiracion: [null],
      precio_total: [null, [Validators.min(0)]],
      estado_lote: ['ACTIVO', [Validators.required]],
    });
  }

  ngOnInit(): void {
    if (!this.esNuevo && this.data.lote) {
      this.cargarDatosLote();
    }

    // Sincronizar stock actual con stock inicial cuando se crea un nuevo lote
    if (this.esNuevo) {
      this.loteForm.get('stock_inicial')?.valueChanges.subscribe((valor) => {
        if (valor !== null && this.loteForm.get('stock_actual')?.pristine) {
          this.loteForm.patchValue({ stock_actual: valor });
        }
      });
    }
  }

  private cargarDatosLote(): void {
    const lote = this.data.lote!;
    this.loteForm.patchValue({
      id_insumo: lote.id_insumo,
      lote: lote.lote,
      ubicacion: lote.ubicacion,
      stock_inicial: lote.stock_inicial,
      stock_actual: lote.stock_actual,
      fecha_expiracion: lote.fecha_expiracion
        ? new Date(lote.fecha_expiracion)
        : null,
      precio_total: lote.precio_total,
      estado_lote: lote.estado_lote || 'ACTIVO',
    });
  }

  onLoteInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.toUpperCase();
    this.loteForm.patchValue({ lote: input.value });
  }

  validarStockActual(): void {
    const stockInicial = this.loteForm.get('stock_inicial')?.value;
    const stockActual = this.loteForm.get('stock_actual')?.value;

    if (stockInicial && stockActual && stockActual > stockInicial) {
      this.loteForm.get('stock_actual')?.setErrors({ stockExcedido: true });
    }
  }

  getInsumoNombre(id_insumo: number): string {
    const insumo = this.insumos.find((i) => i.id_insumo === id_insumo);
    return insumo ? insumo.nombre : '';
  }

  calcularPorcentajeStock(): number {
    const stockInicial = this.loteForm.get('stock_inicial')?.value;
    const stockActual = this.loteForm.get('stock_actual')?.value;

    if (!stockInicial || stockInicial === 0) return 0;
    return Math.round(((stockActual || 0) / stockInicial) * 100);
  }

  getErrorMessage(campo: string): string {
    const control = this.loteForm.get(campo);
    if (!control || !control.errors) return '';

    const errors = control.errors;

    switch (campo) {
      case 'id_insumo':
        if (errors['required']) return 'Debe seleccionar un insumo';
        break;

      case 'lote':
        if (errors['required']) return 'El código de lote es obligatorio';
        if (errors['maxlength'])
          return 'El código no puede exceder 100 caracteres';
        if (errors['pattern'])
          return 'Solo se permiten letras mayúsculas, números, guiones y guiones bajos';
        if (errors['duplicado']) return 'Este código de lote ya existe';
        break;

      case 'ubicacion':
        if (errors['maxlength'])
          return 'La ubicación no puede exceder 200 caracteres';
        break;

      case 'stock_inicial':
        if (errors['required']) return 'El stock inicial es obligatorio';
        if (errors['min']) return 'El stock inicial debe ser mayor o igual a 0';
        break;

      case 'stock_actual':
        if (errors['required']) return 'El stock actual es obligatorio';
        if (errors['min']) return 'El stock actual debe ser mayor o igual a 0';
        if (errors['stockExcedido'])
          return 'El stock actual no puede ser mayor al stock inicial';
        break;

      case 'precio_total':
        if (errors['min']) return 'El precio debe ser mayor o igual a 0';
        break;

      case 'estado_lote':
        if (errors['required']) return 'Debe seleccionar un estado';
        break;
    }

    return 'Campo inválido';
  }

  async guardar(): Promise<void> {
    if (this.loteForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando = true;
    const formData = this.loteForm.value as any;

    try {
      if (this.esNuevo) {
        await this.materialService.crearLote(formData).toPromise();
        this.snackBar.open('Lote creado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      } else {
        const loteActualizado = {
          ...formData,
          id_lote: this.data.lote!.id_lote!,
        };
        await this.materialService.actualizarLote(loteActualizado).toPromise();
        this.snackBar.open('Lote actualizado exitosamente', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar'],
        });
      }

      this.dialogRef.close(true);
    } catch (error: any) {
      console.error('Error al guardar lote:', error);

      if (error.message?.includes('duplicado')) {
        this.loteForm.get('lote')?.setErrors({ duplicado: true });
      }

      this.snackBar.open(
        error.message || 'Error al guardar el lote',
        'Cerrar',
        {
          duration: 5000,
          panelClass: ['error-snackbar'],
        }
      );
    } finally {
      this.cargando = false;
    }
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.loteForm.controls).forEach((key) => {
      this.loteForm.get(key)?.markAsTouched();
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
