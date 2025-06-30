import { Component, Inject } from '@angular/core';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { MaterialService } from '../../services/material.service';
import { Usuario, Rol, TipoUsuario } from '../../models/insumo.model';

@Component({
  selector: 'app-editar-usuario-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
  ],
  templateUrl: './editar-usuario-dialog.html',
  styleUrl: './editar-usuario-dialog.scss',
})
export class EditarUsuarioDialogComponent {
  usuarioForm: FormGroup;
  guardando = false;

  constructor(
    private fb: FormBuilder,
    private materialService: MaterialService,
    private dialogRef: MatDialogRef<EditarUsuarioDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      esEdicion: boolean;
      usuario?: Usuario;
      titulo: string;
      roles: Rol[];
      tiposUsuario: TipoUsuario[];
    }
  ) {
    this.usuarioForm = this.crearFormulario();

    if (this.data.esEdicion && this.data.usuario) {
      this.cargarDatosUsuario();
    }
  }

  private crearFormulario(): FormGroup {
    const form = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.email, Validators.maxLength(100)]],
      id_rol: ['', [Validators.required]],
      id_tipo_usuario: ['', [Validators.required]],
      activo: [true],
    });

    if (!this.data.esEdicion) {
      (form as any).addControl(
        'password',
        this.fb.control('', [Validators.required, Validators.minLength(6)])
      );
      (form as any).addControl(
        'confirmarPassword',
        this.fb.control('', [Validators.required])
      );

      form
        .get('confirmarPassword')
        ?.setValidators([
          Validators.required,
          this.passwordMatchValidator.bind(this),
        ]);
    }

    return form;
  }

  private passwordMatchValidator(control: any) {
    const password = this.usuarioForm?.get('password')?.value;
    const confirmarPassword = control.value;

    if (password !== confirmarPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  private cargarDatosUsuario(): void {
    if (this.data.usuario) {
      this.usuarioForm.patchValue({
        username: this.data.usuario.username,
        email: this.data.usuario.email,
        id_rol: this.data.usuario.id_rol,
        id_tipo_usuario: this.data.usuario.id_tipo_usuario,
        activo: this.data.usuario.activo,
      });
    }
  }

  guardar(): void {
    if (this.usuarioForm.invalid) {
      this.marcarCamposComoTocados();
      return;
    }

    this.guardando = true;
    const datosUsuario = this.usuarioForm.value;

    if (this.data.esEdicion && this.data.usuario?.id_usuario) {
      this.actualizar(datosUsuario);
    } else {
      this.crear(datosUsuario);
    }
  }

  private crear(datosUsuario: any): void {
    const nuevoUsuario: Usuario = {
      username: datosUsuario.username,
      email: datosUsuario.email,
      password_hash: datosUsuario.password,
      id_rol: datosUsuario.id_rol,
      id_tipo_usuario: parseInt(datosUsuario.id_tipo_usuario),
      activo: datosUsuario.activo,
    };

    // this.materialService.crearUsuario(nuevoUsuario).subscribe({
    //   next: (resultado: any) => {
    //     console.log('Usuario creado exitosamente:', resultado);
    //     this.dialogRef.close(resultado);
    //   },
    //   error: (error: any) => {
    //     console.error('Error al crear usuario:', error);
    //   }
    // });
    console.log('Usuario a crear:', nuevoUsuario);
    this.dialogRef.close(nuevoUsuario);
  }

  private actualizar(datosUsuario: any): void {
    const usuarioActualizado: Usuario = {
      ...this.data.usuario,
      username: datosUsuario.username,
      email: datosUsuario.email,
      id_rol: datosUsuario.id_rol,
      id_tipo_usuario: parseInt(datosUsuario.id_tipo_usuario),
      activo: datosUsuario.activo,
    };

    // this.materialService
    //   .actualizarUsuario(this.data.usuario.id_usuario, usuarioActualizado)
    //   .subscribe({
    //     next: (resultado: any) => {
    //       console.log('Usuario actualizado exitosamente:', resultado);
    //       this.dialogRef.close(resultado);
    //     },
    //     error: (error: any) => {
    //       console.error('Error al actualizar usuario:', error);
    //     },
    //   });
    console.log('Usuario a actualizar:', usuarioActualizado);
    this.dialogRef.close(usuarioActualizado);
  }

  private marcarCamposComoTocados(): void {
    Object.keys(this.usuarioForm.controls).forEach((key) => {
      this.usuarioForm.get(key)?.markAsTouched();
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
