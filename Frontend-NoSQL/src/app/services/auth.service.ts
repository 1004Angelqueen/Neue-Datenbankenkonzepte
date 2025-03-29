// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Beispiel: Benutzerobjekt, das beim Login gesetzt wird
  currentUser: { userId: string; role: 'visitor' | 'organizer' | 'security' | 'staff' } | null = null;

  // Beispiel-Methode, um den Benutzer anzumelden (hier nur simuliert)
  login(userId: string, role: 'visitor' | 'organizer' | 'security' | 'staff') {
    this.currentUser = { userId, role };
  }

  logout() {
    this.currentUser = null;
  }
}
