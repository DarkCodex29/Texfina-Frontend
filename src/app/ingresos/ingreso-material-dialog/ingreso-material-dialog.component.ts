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

  esEdicion = false;
  ingresoAEditar?: Ingreso;
  titulo = 'Agregar Ingreso';

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<IngresoMaterialDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
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
    // Configurar modo y datos
    if (this.data) {
      this.esEdicion = this.data.esEdicion || false;
      this.ingresoAEditar = this.data.ingreso;
      this.titulo =
        this.data.titulo ||
        (this.esEdicion ? 'Editar Ingreso' : 'Agregar Ingreso');
    }

    this.cargarDatos();
    this.configurarCalculos();

    // Si es edición, cargar datos del ingreso
    if (this.esEdicion && this.ingresoAEditar) {
      this.cargarDatosEdicion();
    }
  }

  private cargarDatosEdicion(): void {
    if (!this.ingresoAEditar) return;

    const fechaFormateada = this.ingresoAEditar.fecha
      ? new Date(this.ingresoAEditar.fecha).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];

    this.ingresoForm.patchValue({
      id_insumo: this.ingresoAEditar.id_insumo?.toString() || '',
      fecha: fechaFormateada,
      cantidad: this.ingresoAEditar.cantidad || '',
      id_unidad: this.ingresoAEditar.id_unidad || '',
      presentacion: this.ingresoAEditar.presentacion || '',
      id_lote: this.ingresoAEditar.id_lote?.toString() || '',
      precio_unitario_historico:
        this.ingresoAEditar.precio_unitario_historico || 0,
      precio_total_formula: this.ingresoAEditar.precio_total_formula || 0,
      numero_remision: this.ingresoAEditar.numero_remision || '',
      orden_compra: this.ingresoAEditar.orden_compra || '',
      estado: this.ingresoAEditar.estado || 'PENDIENTE',
    });
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
        ...(this.esEdicion &&
          this.ingresoAEditar?.id_ingreso && {
            id_ingreso: this.ingresoAEditar.id_ingreso,
          }),
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

      const operacion$ = this.esEdicion
        ? this.materialService.actualizarIngreso(ingreso)
        : this.materialService.crearIngreso(ingreso);

      operacion$.subscribe({
        next: (resultado) => {
          console.log(
            this.esEdicion ? '✅ Ingreso actualizado:' : '✅ Ingreso creado:',
            resultado
          );
          this.dialogRef.close(resultado);
        },
        error: (error) => {
          console.error(
            `Error al ${this.esEdicion ? 'actualizar' : 'registrar'} ingreso:`,
            error
          );
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
