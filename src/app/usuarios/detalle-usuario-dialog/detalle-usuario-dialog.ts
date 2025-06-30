import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Usuario, Rol, TipoUsuario } from '../../models/insumo.model';

@Component({
  selector: 'app-detalle-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './detalle-usuario-dialog.html',
  styleUrl: './detalle-usuario-dialog.scss',
})
export class DetalleUsuarioDialogComponent {
  usuario: Usuario;
  roles: Rol[];
  tiposUsuario: TipoUsuario[];

  constructor(
    private dialogRef: MatDialogRef<DetalleUsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      usuario: Usuario;
      roles: Rol[];
      tiposUsuario: TipoUsuario[];
    }
  ) {
    this.usuario = data.usuario;
    this.roles = data.roles;
    this.tiposUsuario = data.tiposUsuario;
    console.log('Data recibida en modal:', this.usuario);
  }

  formatearCodigo(id?: number): string {
    if (!id) return '00001';
    return id.toString().padStart(5, '0');
  }

  formatearTexto(texto?: string): string {
    return texto && texto.trim() ? texto : '-';
  }

  obtenerNombreRol(idRol?: string): string {
    if (!idRol) return '-';
    const rol = this.roles.find((r) => r.id_rol === idRol);
    return rol ? rol.nombre : idRol;
  }

  obtenerNombreTipo(idTipo?: number): string {
    if (!idTipo) return '-';
    const tipo = this.tiposUsuario.find((t) => t.id_tipo_usuario === idTipo);
    return tipo ? tipo.descripcion : '-';
  }

  formatearFecha(fecha?: Date): string {
    if (!fecha) return '-';

    const fechaObj = fecha instanceof Date ? fecha : new Date(fecha);

    if (isNaN(fechaObj.getTime())) return '-';

    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
