import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  ],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  visible = false;

  @Output() close = new EventEmitter<void>();

  maestros = [
    { label: 'Materiales', icon: 'pi pi-box', route: '/materiales' },
    { label: 'Clases', icon: 'pi pi-tags', route: '/clases' },
    { label: 'Unidades', icon: 'pi pi-sitemap', route: '/unidades' },
    { label: 'Proveedores', icon: 'pi pi-truck', route: '/proveedores' },
    { label: 'Almacenes', icon: 'pi pi-warehouse', route: '/almacenes' },
    { label: 'Lotes', icon: 'pi pi-th-large', route: '/lotes' },
    { label: 'Recetas', icon: 'pi pi-list', route: '/recetas' },
    { label: 'Ingresos', icon: 'pi pi-plus', route: '/ingresos' },
    { label: 'Logs', icon: 'pi pi-file-o', route: '/logs' },
    { label: 'Auditoría', icon: 'pi pi-file-o', route: '/auditoria' },
    { label: 'Configuración', icon: 'pi pi-cog', route: '/configuracion' },
  ];

  closeCallback(event: any) {
    this.close.emit();
  }
}
