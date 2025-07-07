import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then(
        (m) => m.MainLayoutComponent
      ),
    data: { roles: ['ADMIN', 'SUPERVISOR', 'OPERARIO', 'CONSULTOR'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'insumos',
        loadComponent: () =>
          import('./materiales/materiales.component').then(
            (m) => m.MaterialesComponent
          ),
      },
      {
        path: 'proveedores',
        loadComponent: () =>
          import('./proveedores/proveedores').then(
            (m) => m.ProveedoresComponent
          ),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./usuarios/usuarios').then((m) => m.UsuariosComponent),
      },
      {
        path: 'almacenes',
        loadComponent: () =>
          import('./almacenes/almacenes').then((m) => m.Almacenes),
      },
      {
        path: 'clases',
        loadComponent: () => import('./clases/clases').then((m) => m.Clases),
      },
      {
        path: 'unidades',
        loadComponent: () =>
          import('./unidades/unidades').then((m) => m.Unidades),
      },
      {
        path: 'lotes',
        loadComponent: () => import('./lotes/lotes').then((m) => m.LotesComponent),
      },
      {
        path: 'recetas',
        loadComponent: () =>
          import('./recetas/recetas').then((m) => m.RecetasComponent),
      },
      {
        path: 'ingresos',
        loadComponent: () =>
          import('./ingresos/ingresos').then((m) => m.IngresosComponent),
      },
      {
        path: 'logs',
        loadComponent: () => import('./logs/logs').then((m) => m.LogsComponent),
      },
      {
        path: 'auditoria',
        loadComponent: () =>
          import('./auditoria/auditoria').then((m) => m.AuditoriaComponent),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./roles/roles').then((m) => m.RolesComponent),
      },
      {
        path: 'configuracion',
        loadComponent: () =>
          import('./configuracion/configuracion').then(
            (m) => m.ConfiguracionComponent
          ),
      },
      {
        path: 'consumos',
        loadComponent: () =>
          import('./consumos/consumos').then((m) => m.ConsumosComponent),
      },
      {
        path: 'stock',
        loadComponent: () =>
          import('./stock/stock').then((m) => m.StockComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./reportes/reportes').then((m) => m.ReportesComponent),
      },
    ],
  },
];
