import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService implements OnDestroy {
  private socket!: WebSocket;
  private messageSubject = new Subject<any>();

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    try {
      this.socket = new WebSocket('ws://localhost:3000/ws');
      
      this.socket.onopen = () => {
        console.log('WebSocket Verbindung hergestellt');
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket Nachricht empfangen:', data);
          this.messageSubject.next(data);
        } catch (error) {
          console.error('Fehler beim Parsen der WebSocket-Nachricht:', error);
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket Fehler:', error);
      };

      this.socket.onclose = () => {
        console.log('WebSocket Verbindung geschlossen');
        // Automatische Wiederverbindung nach 3 Sekunden
        setTimeout(() => this.connectWebSocket(), 3000);
      };
    } catch (error) {
      console.error('Fehler beim Aufbau der WebSocket-Verbindung:', error);
      setTimeout(() => this.connectWebSocket(), 3000);
    }
  }

  public getMessages(): Observable<any> {
    return this.messageSubject.asObservable().pipe(
      retry(3)
    );
  }

  ngOnDestroy() {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
    this.messageSubject.complete();
  }
}