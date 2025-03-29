import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Observable<boolean> | Promise<boolean> {
    // Hier holen wir uns die erlaubten Rollen aus den Routen-Daten
    const allowedRoles = route.data['allowedRoles'] as string[];

    // Beispielsweise speichern wir die aktuelle Rolle im Local Storage
    const currentRole = localStorage.getItem('role');

    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    } else {
      // Falls die Rolle nicht passt, navigiere zurück zur Dashboard- oder Login-Seite
      this.router.navigate(['/dashboard']);
      return false;
    }
  }
}
