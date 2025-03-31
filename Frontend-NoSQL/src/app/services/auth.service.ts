import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { WebsocketService } from './websocket.service';

interface AuthResponse {
  token: string;
  userId: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api';
  private userRoleSubject = new BehaviorSubject<string>('');
  public userRole$ = this.userRoleSubject.asObservable();

  constructor(
    private http: HttpClient,
    private wsService: WebsocketService
  ) {
    // Beim Start die gespeicherte Rolle laden
    const savedRole = localStorage.getItem('role');
    if (savedRole) {
      this.userRoleSubject.next(savedRole);
      this.wsService.setUserRole(savedRole);
    }
  }

  // Besucher-Login
  loginVisitor(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login/visitor`,
      { consent: true }
    ).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  // Admin/Security-Login
  loginAdmin(credentials: { userId: string; password: string; role: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login/admin`,
      credentials
    ).pipe(
      tap(response => {
        this.handleAuthResponse(response);
      })
    );
  }

  private handleAuthResponse(response: AuthResponse): void {
      const normalizedRole = response.role.toLowerCase();

    localStorage.setItem('token', response.token);
    localStorage.setItem('userId', response.userId);
    localStorage.setItem('role', response.role);
    
      // Rolle aktualisieren und WebSocket-Service informieren
      this.userRoleSubject.next(normalizedRole);
          this.wsService.setUserRole(normalizedRole);

           console.log('Auth Response verarbeitet:', { 
        userId: response.userId, 
         role: normalizedRole 
           });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    
    // Rolle zurücksetzen und WebSocket-Service informieren
    this.userRoleSubject.next('');
    this.wsService.setUserRole('visitor');
  }

  // Getter für die aktuelle Benutzerrolle
  getUserRole(): string {
    return localStorage.getItem('role') || '';
  }

  // Prüfen ob der Benutzer eingeloggt ist
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  // Prüfen ob der Benutzer Security ist
  isSecurity(): boolean {
  const role = this.getUserRole().toLowerCase();
  return role === 'security';
}

  // Token abrufen
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Benutzer-ID abrufen
  getUserId(): string | null {
    return localStorage.getItem('userId');
  }
  
}