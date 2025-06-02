import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    RouterModule,
  ],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.scss'],
})
export class Toolbar {
  title = 'Inicio';

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateTitle(event.url);
      });

    // Establecer título inicial
    this.updateTitle(this.router.url);
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
