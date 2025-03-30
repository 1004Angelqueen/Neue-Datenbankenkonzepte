import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Observable, timer, Subject, EMPTY, BehaviorSubject } from 'rxjs';
import { retryWhen, tap, delayWhen, switchAll, catchError, filter } from 'rxjs/operators';

interface WebSocketMessage {
  type: string;
  message: any;
  timestamp?: string;
  notificationType?: string;
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
  private wsUrl = 'ws://localhost:3000/ws';

  constructor() {
    this.connect();
    this.setupPing();
  }

  private setupPing(): void {
    // Ping-Intervall aufsetzen
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    
    this.pingInterval = setInterval(() => {
      this.sendMessage({ type: 'ping', timestamp: new Date().toISOString() });
    }, this.PING_INTERVAL);
  }

  private connect(): void {
    if (!this.socket$ || this.socket$.closed) {
      this.socket$ = webSocket({
        url: this.wsUrl,
        openObserver: {
          next: () => {
            console.log('WebSocket Verbindung geöffnet');
            this.connectionStatus$.next(true);
            this.reconnectionAttempts = 0;
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
          // Ignoriere Ping-Nachrichten für den MessageSubject
          if (message.type !== 'ping') {
            this.messagesSubject.next(message);
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
      // Optional: Event auslösen für UI-Benachrichtigung
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

  // Wird beim Zerstören des Services aufgerufen
  ngOnDestroy() {
    this.disconnect();
  }
}