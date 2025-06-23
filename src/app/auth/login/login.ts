import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/auth/auth.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  hasError = false;
  errorMessage = '';

  // Usuarios de ejemplo para demostración
  usuariosEjemplo = [
    { username: 'admin', rol: 'Administrador' },
    { username: 'supervisor', rol: 'Supervisor' },
    { username: 'operario', rol: 'Operario' },
    { username: 'consultor', rol: 'Consultor' },
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      username: ['admin', [Validators.required, Validators.minLength(3)]],
      password: ['123456', [Validators.required, Validators.minLength(6)]],
      remember: [false],
    });
  }

  ngOnInit(): void {
    this.authService.isLoggedIn$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoggedIn) => {
        if (isLoggedIn) {
          this.router.navigate(['/dashboard']);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private mostrarMensajeBienvenida(): void {}

  /**
   * Alternar visibilidad de la contraseña
   */
  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  /**
   * Obtener mensaje de error para el campo usuario
   */
  getUsernameErrorMessage(): string {
    const control = this.loginForm.get('username');
    if (control?.hasError('required')) {
      return 'El usuario corporativo es requerido';
    }
    if (control?.hasError('minlength')) {
      return 'El usuario debe tener al menos 3 caracteres';
    }
    return '';
  }

  /**
   * Obtener mensaje de error para el campo contraseña
   */
  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (control?.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    return '';
  }

  /**
   * Completar automáticamente el formulario con usuario de ejemplo
   */
  usarUsuarioEjemplo(usuario: string): void {
    this.loginForm.patchValue({
      username: usuario,
      password: '123456',
    });
  }

  /**
   * Manejar el envío del formulario
   */
  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.ejecutarLogin();
    } else {
      this.marcarCamposComoTocados();
    }
  }

  /**
   * Ejecutar proceso de login
   */
  private ejecutarLogin(): void {
    this.isLoading = true;
    this.hasError = false;
    this.errorMessage = '';

    const { username, password, remember } = this.loginForm.value;

    this.authService
      .login(username, password)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          this.isLoading = false;
          if (success) {
            this.manejarLoginExitoso(username, remember);
          } else {
            this.manejarErrorLogin('Credenciales inválidas');
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.manejarErrorLogin('Error de conexión con el servidor');
          console.error('Error de login:', error);
        },
      });
  }

  /**
   * Manejar login exitoso
   */
  private manejarLoginExitoso(username: string, remember: boolean): void {
    // Guardar preferencia de recordar sesión
    if (remember) {
      localStorage.setItem('texfina_remember_user', username);
    } else {
      localStorage.removeItem('texfina_remember_user');
    }

    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1000);
  }

  /**
   * Manejar errores de login
   */
  private manejarErrorLogin(mensaje: string): void {
    this.hasError = true;
    this.errorMessage = mensaje;

    this.loginForm.patchValue({ password: '' });
  }

  /**
   * Marcar todos los campos como tocados para mostrar errores
   */
  private marcarCamposComoTocados(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      this.loginForm.get(key)?.markAsTouched();
    });
  }

  /**
   * Obtener estado del botón de login
   */
  get isLoginButtonDisabled(): boolean {
    return this.loginForm.invalid || this.isLoading;
  }

  /**
   * Obtener texto del botón de login
   */
  get loginButtonText(): string {
    if (this.isLoading) {
      return 'Autenticando...';
    }
    return 'Acceder al Sistema';
  }

  /**
   * Obtener clase CSS para el estado del formulario
   */
  get formStateClass(): string {
    if (this.hasError) return 'texfina-form-error';
    if (this.isLoading) return 'texfina-form-loading';
    return 'texfina-form-normal';
  }
}

// Export adicional para compatibilidad con rutas
export { LoginComponent as Login };
