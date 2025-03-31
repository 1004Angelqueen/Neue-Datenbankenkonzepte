import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, timer, Subject, EMPTY, BehaviorSubject } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError, filter } from 'rxjs/operators';

interface WebSocketMessage {
  type: string;
  message: any;
  timestamp?: string;
  notificationType?: string;
  incident?: {
    type: string;
    zone: string;
    message: string;
  };
  notification?: {
    type: string;
    zone: string;
    message: string;
    requiresAction?: boolean;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket$: WebSocketSubject<any> | null = null;
  private messagesSubject = new Subject<WebSocketMessage>();
  private connectionStatus$ = new BehaviorSubject<boolean>(false);
  private reconnectionAttempts = 0;
  private readonly RECONNECTION_ATTEMPTS = 10;
  private readonly RECONNECTION_DELAY = 2000;
  private readonly PING_INTERVAL = 30000; // 30 Sekunden
  private pingInterval: any;
  private readonly wsUrl = 'ws://localhost:3000/ws';
  private userRole: string = 'visitor'; // Standardrolle

  constructor() {
    // Versuchen Sie die Benutzerrolle aus dem localStorage oder einem anderen Service zu bekommen
    this.userRole = localStorage.getItem('userRole') || 'visitor';
    this.connect();
    this.setupPing();
  }

  // Methode zum Setzen der Benutzerrolle
  public setUserRole(role: string): void {
    this.userRole = role;
    // Verbindung neu aufbauen mit neuer Rolle
    this.disconnect();
    this.connect();
  }

  private setupPing(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      this.sendMessage({ 
        type: 'ping', 
        timestamp: new Date().toISOString(),
        role: this.userRole // Rolle mit dem Ping senden
      });
    }, this.PING_INTERVAL);
  }

  private connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      // URL mit Rolle als Query-Parameter
      const wsUrlWithRole = `${this.wsUrl}?role=${this.userRole}`;
      
      this.socket$ = webSocket({
        url: wsUrlWithRole,
        openObserver: {
          next: () => {
            console.log('WebSocket Verbindung geöffnet');
            this.connectionStatus$.next(true);
            this.reconnectionAttempts = 0;
            // Initial die Rolle senden
            this.sendMessage({ 
              type: 'init', 
              role: this.userRole,
              timestamp: new Date().toISOString() 
            });
          }
        },
        closeObserver: {
          next: () => {
            console.log('WebSocket Verbindung geschlossen');
            this.connectionStatus$.next(false);
            this.socket$ = null;
            this.reconnect();
          }
        }
      });

      this.socket$.pipe(
        catchError(error => {
          console.log('WebSocket Fehler:', error);
          return EMPTY;
        })
      ).subscribe({
        next: (message: WebSocketMessage) => {
          // Ping-Nachrichten ignorieren
          if (message.type !== 'ping') {
            // Prüfen, ob es sich um eine Security-Benachrichtigung handelt
            if (message.notification?.requiresAction && this.userRole !== 'security') {
              // Für Nicht-Security-Benutzer: requiresAction-Flag entfernen
              const modifiedMessage = {
                ...message,
                notification: {
                  ...message.notification,
                  requiresAction: false
                }
              };
              this.messagesSubject.next(modifiedMessage);
            } else {
              this.messagesSubject.next(message);
            }
          }
        },
        error: (error) => {
          console.error('WebSocket Fehler:', error);
          this.connectionStatus$.next(false);
          this.reconnect();
        }
      });
    }
  }

  private reconnect(): void {
    if (this.reconnectionAttempts < this.RECONNECTION_ATTEMPTS) {
      this.reconnectionAttempts++;
      console.log(`Versuche Wiederverbindung ${this.reconnectionAttempts}/${this.RECONNECTION_ATTEMPTS}`);
      
      setTimeout(() => {
        this.connect();
      }, this.RECONNECTION_DELAY);
    } else {
      console.log('Maximale Anzahl an Wiederverbindungsversuchen erreicht');
      this.messagesSubject.next({
        type: 'error',
        message: 'Verbindung zum Server konnte nicht hergestellt werden',
        notificationType: 'error'
      });
    }
  }

  public getMessages(): Observable<WebSocketMessage> {
    return this.messagesSubject.asObservable().pipe(
      filter(message => message !== null)
    );
  }

  public getConnectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }

  public sendMessage(message: any): void {
    if (this.socket$ && !this.socket$.closed) {
      try {
        this.socket$.next({
          ...message,
          role: this.userRole, // Rolle bei jeder Nachricht mitsenden
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('Fehler beim Senden der Nachricht:', error);
        this.reconnect();
      }
    } else {
      console.log('Keine aktive WebSocket-Verbindung');
      this.reconnect();
    }
  }

  public disconnect(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    if (this.socket$) {
      this.socket$.complete();
      this.socket$ = null;
    }
    
    this.connectionStatus$.next(false);
  }

  ngOnDestroy() {
    this.disconnect();
  }

  // Hilfsmethode um die aktuelle Benutzerrolle zu erhalten
  public getUserRole(): string {
    return this.userRole;
  }
}