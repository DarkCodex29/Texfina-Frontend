import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { MainLayoutComponent } from './layout/main-layout/main-layout';
import { Home } from './home/home';
import { MaterialesComponent } from './materiales/materiales.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'materiales', component: MaterialesComponent },
      // Aquí irán las rutas protegidas, por ejemplo:
      // { path: 'home', component: HomeComponent },
    ],
  },
];
