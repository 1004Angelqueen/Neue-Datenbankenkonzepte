import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Besucher-Login: sendet { consent: true } und erhält ein Token, userId und role
  loginVisitor(): Observable<{ token: string; userId: string; role: string }> {
    return this.http.post<{ token: string; userId: string; role: string }>(
      `${this.apiUrl}/login/visitor`,
      { consent: true }
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('role', response.role);
      })
    );
  }

  // Admin-Login: benötigt userId, password und role
  loginAdmin(credentials: { userId: string; password: string; role: string }): Observable<{ token: string; userId: string; role: string }> {
    return this.http.post<{ token: string; userId: string; role: string }>(
      `${this.apiUrl}/login/admin`,
      credentials
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userId', response.userId);
        localStorage.setItem('role', response.role);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
  }
}
