// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Besucher-Login: sendet { consent: true } und erhält ein Token
  loginVisitor(): Observable<{ token: string; userId: string; role: string }> {
    return this.http.post<{ token: string; userId: string; role: string }>(
      `${this.apiUrl}/login/visitor`,
      { consent: true }
    );
  }

  // Admin-Login: benötigt userId, password und role
  loginAdmin(credentials: { userId: string; password: string; role: string }): Observable<{ token: string; userId: string; role: string }> {
    return this.http.post<{ token: string; userId: string; role: string }>(
      `${this.apiUrl}/login/admin`,
      credentials
    );
  }
  logout(): void {
    // Entferne alle gespeicherten Daten, z. B. aus Local Storage
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    //this.currentUser = null;
    // Falls du Tracking-Abonnements hast, kannst du diese hier beenden.
  }
}
