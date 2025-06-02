import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { Home } from './home/home';
import { MaterialesComponent } from './materiales/materiales.component';
import { Proveedores } from './proveedores/proveedores';

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
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/dashboard').then((m) => m.Dashboard),
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
          import('./proveedores/proveedores').then((m) => m.Proveedores),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./usuarios/usuarios').then((m) => m.Usuarios),
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
    ],
  },
];
