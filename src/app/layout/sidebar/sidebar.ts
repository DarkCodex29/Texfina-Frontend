import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StyleClassModule } from 'primeng/styleclass';

import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { AvatarModule } from 'primeng/avatar';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DrawerModule,
    ButtonModule,
    AvatarModule,
    RippleModule,
    StyleClassModule,
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  visible = false;

  @Output() close = new EventEmitter<void>();

  // Estado de las secciones del menú
  sections = {
    seguimiento: true,
    pesadoMovimientos: true,
    maestros: true,
    administracion: false
  };

  closeCallback(event: any) {
    this.close.emit();
  }

  onNavClick(event: Event) {
    const target = event.target as HTMLElement;
    if (target.closest('a[routerLink]')) {
      // Cerrar sidebar cuando se hace clic en un enlace
      this.close.emit();
    }
  }

  toggleSection(section: string) {
    this.sections = {
      ...this.sections,
      [section]: !this.sections[section as keyof typeof this.sections]
    };
  }
}
