// src/app/guards/role.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const allowedRoles = route.data['allowedRoles'] as string[];
    const userRole = this.authService.currentUser?.role;
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    } else {
      // Optionale Umleitung bei fehlender Berechtigung
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
}
