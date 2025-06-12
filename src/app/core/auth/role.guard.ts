import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const allowedRoles = (route.data['roles'] as string[]) ?? [];

  if (allowedRoles.length === 0 || auth.hasRole(allowedRoles)) {
    return true;
  }

  // No autorizado → redirigir al dashboard o a página 403
  router.navigate(['/dashboard']);
  return false;
};
