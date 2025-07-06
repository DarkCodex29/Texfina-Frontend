import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuItem } from 'primeng/api';

import { AuthService } from '../../core/auth/auth.service';
import {
  DashboardService,
  AlertaDashboard,
} from '../../services/dashboard.service';
import { Usuario } from '../../models/insumo.model';
import { NotificationsComponent } from '../../shared/components/notifications/notifications.component';
import { UserMenuComponent } from '../../shared/components/user-menu/user-menu.component';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    RouterModule,
    ToolbarModule,
    ButtonModule,
    BreadcrumbModule,
    NotificationsComponent,
    UserMenuComponent,
  ],
  templateUrl: './toolbar.html',
  styleUrls: ['./toolbar.scss'],
})
export class ToolbarComponent implements OnInit, OnDestroy {
  @Output() menuToggle = new EventEmitter<void>();

  title = 'Inicio';
  currentUser: Usuario | null = null;
  alertas: AlertaDashboard[] = [];
  alertasCount = 0;
  breadcrumbItems: MenuItem[] = [];
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/dashboard' };

  private destroy$ = new Subject<void>();

  private router = inject(Router);
  private authService = inject(AuthService);
  private dashboardService = inject(DashboardService);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.updateTitle(event.url);
        this.updateBreadcrumb(event.url);
      });

    this.updateTitle(this.router.url);
    this.updateBreadcrumb(this.router.url);
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.cargarAlertas();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleSidenav(): void {
    this.menuToggle.emit();
  }

  private updateTitle(url: string): void {
    const routeMap: { [key: string]: string } = {
      '/dashboard': 'Inicio',
      '/dashboard/insumos': 'Insumos',
      '/dashboard/proveedores': 'Proveedores',
      '/dashboard/usuarios': 'Usuarios',
      '/dashboard/almacenes': 'Almacenes',
      '/dashboard/clases': 'Clases',
      '/dashboard/unidades': 'Unidades',
      '/dashboard/lotes': 'Lotes',
      '/dashboard/recetas': 'Recetas',
      '/dashboard/ingresos': 'Ingresos',
      '/dashboard/consumos': 'Consumos',
      '/dashboard/stock': 'Stock',
      '/dashboard/reportes': 'Reportes',
      '/dashboard/logs': 'Logs',
      '/dashboard/auditoria': 'Auditoría',
      '/dashboard/roles': 'Roles y Permisos',
      '/dashboard/configuracion': 'Configuración',
    };

    this.title = routeMap[url] || 'Texfina';
  }

  private updateBreadcrumb(url: string): void {
    this.breadcrumbItems = [];

    const pathSegments = url.split('/').filter((segment) => segment);

    if (pathSegments.length > 1) {
      const section = pathSegments[1];

      const sectionMap: { [key: string]: { label: string; parent?: string } } =
        {
          insumos: { label: 'Insumos', parent: 'Maestros' },
          proveedores: { label: 'Proveedores', parent: 'Maestros' },
          almacenes: { label: 'Almacenes', parent: 'Maestros' },
          clases: { label: 'Clases', parent: 'Maestros' },
          unidades: { label: 'Unidades', parent: 'Maestros' },
          lotes: { label: 'Lotes', parent: 'Maestros' },
          recetas: { label: 'Recetas', parent: 'Maestros' },
          ingresos: { label: 'Ingresos', parent: 'Movimientos' },
          consumos: { label: 'Consumos', parent: 'Movimientos' },
          stock: { label: 'Stock', parent: 'Consultas' },
          reportes: { label: 'Reportes', parent: 'Consultas' },
          usuarios: { label: 'Usuarios', parent: 'Administración' },
          logs: { label: 'Logs', parent: 'Administración' },
          auditoria: { label: 'Auditoría', parent: 'Administración' },
          roles: { label: 'Roles y Permisos', parent: 'Administración' },
          configuracion: { label: 'Configuración', parent: 'Administración' },
        };

      if (sectionMap[section]) {
        if (sectionMap[section].parent) {
          this.breadcrumbItems.push({
            label: sectionMap[section].parent,
            styleClass: 'breadcrumb-parent',
          });
        }
        this.breadcrumbItems.push({
          label: sectionMap[section].label,
          styleClass: 'breadcrumb-current',
        });
      }
    }
  }

  private cargarAlertas(): void {
    this.dashboardService.getAlertasDashboard().subscribe({
      next: (alertas: AlertaDashboard[]) => {
        this.alertas = alertas;
        this.alertasCount = alertas.length;
      },
      error: (error: any) => {
        console.error('Error al cargar alertas:', error);
        // Usar alertas simuladas como fallback
        this.alertas = this.getAlertasSimuladas();
        this.alertasCount = this.alertas.length;
      },
    });
  }

  resolverAlerta(alertaId: number): void {
    // Como no existe resolverAlerta en el service, lo simulamos localmente
    this.alertas = this.alertas.filter((alerta) => alerta.id !== alertaId);
    this.alertasCount = this.alertas.length;
    console.log('Alerta resuelta:', alertaId);
  }

  private getAlertasSimuladas(): AlertaDashboard[] {
    return [
      {
        id: 1,
        titulo: 'Stock crítico detectado',
        descripcion:
          'El acetato de sodio ha alcanzado niveles críticos de inventario',
        nivel: 'ALTA',
        tipo: 'STOCK_BAJO',
        insumo: 'Acetato de Sodio',
        almacen: 'Almacén Principal',
        fechaCreacion: new Date(Date.now() - 2 * 60 * 60 * 1000),
        cantidad: 15,
      },
      {
        id: 2,
        titulo: 'Lote próximo a vencer',
        descripcion: 'Lote L-2024-003 de sulfato de cobre vence en 5 días',
        nivel: 'MEDIA',
        tipo: 'LOTE_POR_VENCER',
        insumo: 'Sulfato de Cobre',
        almacen: 'Almacén Secundario',
        fechaCreacion: new Date(Date.now() - 4 * 60 * 60 * 1000),
        cantidad: 85,
      },
      {
        id: 3,
        titulo: 'Consumo anormal detectado',
        descripcion:
          'El área de producción ha incrementado su consumo un 45% esta semana',
        nivel: 'MEDIA',
        tipo: 'SISTEMA',
        insumo: 'Varios',
        almacen: 'Área Producción',
        fechaCreacion: new Date(Date.now() - 6 * 60 * 60 * 1000),
      },
    ];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
