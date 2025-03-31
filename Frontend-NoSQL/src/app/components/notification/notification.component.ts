import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

interface WebSocketMessage {
  incident?: {
    type?: string;
    zone?: string;
    message?: string;
  };
  notification?: {
    type?: string;
    zone?: string;
    message?: string;
    requiresAction?: boolean;
  };
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  template: '<div></div>'
})
export class NotificationComponent implements OnInit, OnDestroy {
  private wsSubscription: Subscription | undefined;
  private roleSubscription: Subscription | undefined;
  private userRole: string = '';

  constructor(
    private wsService: WebsocketService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {
    this.userRole = this.authService.getUserRole();
    console.log('NotificationComponent konstruiert, Benutzerrolle:', this.userRole);
  }

  ngOnInit(): void {
    console.log('NotificationComponent initialisiert');
    
    // Abonniere Änderungen der Benutzerrolle
    this.roleSubscription = this.authService.userRole$.subscribe(role => {
      this.userRole = role.toLowerCase(); // Konvertiere zu Kleinbuchstaben für konsistenten Vergleich
      console.log('Benutzerrolle aktualisiert:', this.userRole);
    });
    
    this.wsSubscription = this.wsService.getMessages().subscribe({
      next: (message: WebSocketMessage) => {
        console.log('WebSocket Nachricht empfangen:', message);
        
        // Prüfe auf incident und notification
        if (message.incident || message.notification) {
          const notification = message.notification || {};
          const incident = message.incident || {};
          
          // Verwende die Nachricht aus notification oder incident
          const messageText = notification.message || incident.message || '';
          const notificationType = notification.type || incident.type || 'info';
          
          // Zeige die Snackbar-Benachrichtigung für alle
          if (messageText) {
            console.log('Zeige Notification:', { messageText, notificationType });
            this.showNotification(messageText, notificationType);
          }
          
          // Prüfe ob es sich um eine "full" Benachrichtigung handelt und der Benutzer Security ist
          const isFull = notificationType === 'full';
          const isSecurity = this.userRole.toLowerCase() === 'security';
          
          console.log('Alert-Prüfung:', { isFull, isSecurity, userRole: this.userRole });
          
          if (isFull && isSecurity) {
            console.log('Security Alert wird ausgelöst für:', messageText);
            window.alert(messageText);
          }
        }
      },
      error: (error) => {
        console.error('WebSocket Fehler:', error);
        this.showNotification('Verbindungsfehler', 'error');
      }
    });
  }

  private showNotification(message: string, type: string = 'info'): void {
    console.log(`Zeige Notification: ${message} (Typ: ${type})`);
    let panelClass = ['notification-snackbar'];
    
    switch (type.toLowerCase()) {
      case 'error':
        panelClass.push('error-notification');
        break;
      case 'warning':
        panelClass.push('warning-notification');
        break;
      case 'success':
        panelClass.push('success-notification');
        break;
      case 'full':
        panelClass.push('full-notification');
        break;
      case 'half':
        panelClass.push('warning-notification');
        break;
      default:
        panelClass.push('info-notification');
    }

    this.snackBar.open(message, 'Schließen', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: panelClass
    });
  }

  ngOnDestroy(): void {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.roleSubscription) {
      this.roleSubscription.unsubscribe();
    }
  }
}