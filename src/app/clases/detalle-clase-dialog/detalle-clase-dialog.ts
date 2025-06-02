import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

import { Clase } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-clase-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
  ],
  templateUrl: './detalle-clase-dialog.html',
  styleUrls: ['./detalle-clase-dialog.scss'],
})
export class DetalleClaseDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DetalleClaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public clase: Clase
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}

export { DetalleClaseDialogComponent as DetalleClaseDialog };
