import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { Usuario } from '../../models/insumo.model';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    RouterModule,
  ],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  title = 'Inicio';
  currentUser: Usuario | null = null;
  private destroy$ = new Subject<void>();

  constructor(private router: Router, private authService: AuthService) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateTitle(event.url);
      });

    // Establecer título inicial
    this.updateTitle(this.router.url);
  }

  ngOnInit(): void {
    // Obtener usuario actual
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    this.authService.logout();
  }

  private updateTitle(url: string): void {
    if (url === '/home' || url === '/') {
      this.title = 'Inicio';
    } else if (url === '/materiales') {
      this.title = 'Registro de materiales';
    } else if (url === '/proveedores') {
      this.title = 'Proveedores';
    } else if (url.includes('/materiales')) {
      this.title = 'Gestión de materiales';
    } else {
      this.title = 'Texfina Web';
    }
  }
}
