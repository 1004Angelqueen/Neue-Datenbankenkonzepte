import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, MatSnackBarModule],
  template: '<div></div>'
})
export class NotificationComponent implements OnInit, OnDestroy {
  private wsSubscription: Subscription | undefined;

  constructor(
    private wsService: WebsocketService,
    private snackBar: MatSnackBar
  ) {
    console.log('NotificationComponent konstruiert');
  }

  ngOnInit(): void {
    console.log('NotificationComponent initialisiert');
    
    this.wsSubscription = this.wsService.getMessages().subscribe({
      next: (message: any) => {
        console.log('WebSocket Nachricht empfangen:', message);

        // Verarbeite verschiedene Nachrichtentypen
        if (message.type === 'echo' && message.data) {
          // Verarbeite Zone-Status Benachrichtigungen
          if (message.data.zoneId && message.data.currentVisitors !== undefined) {
            const zone = message.data;
            const capacity = (zone.currentVisitors / zone.maxCapacity) * 100;
            
            let notificationType = 'info';
            let notificationMessage = '';

            if (capacity >= 110) {
              notificationType = 'error';
              notificationMessage = `Zone ${zone.zoneId} ist überbelegt! (${zone.currentVisitors}/${zone.maxCapacity})`;
            } else if (capacity === 100) {
              notificationType = 'warning';
              notificationMessage = `Zone ${zone.zoneId} ist voll! (${zone.currentVisitors}/${zone.maxCapacity})`;
            } else if (capacity >= 80) {
              notificationType = 'warning';
              notificationMessage = `Zone ${zone.zoneId} wird bald voll! (${zone.currentVisitors}/${zone.maxCapacity})`;
            }

            if (notificationMessage) {
              this.showNotification(notificationMessage, notificationType);
            }
          }
        } else if (message.notification) {
          // Direkte Benachrichtigungen
          this.showNotification(
            message.notification.message,
            message.notification.type || 'info'
          );
        }
      },
      error: (error) => {
        console.error('WebSocket Fehler:', error);
        this.showNotification('Verbindungsfehler', 'error');
      }
    });
  }

  private showNotification(message: string, type: string = 'info'): void {
    let panelClass = ['notification-snackbar'];
    switch (type) {
      case 'error':
        panelClass.push('error-notification');
        break;
      case 'warning':
        panelClass.push('warning-notification');
        break;
      case 'success':
        panelClass.push('success-notification');
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
  }
}