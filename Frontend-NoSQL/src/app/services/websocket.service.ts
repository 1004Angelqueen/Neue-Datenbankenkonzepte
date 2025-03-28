import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket;

  constructor() {
    // Verbinde dich mit dem WebSocket-Endpunkt deines Backends
    this.socket = new WebSocket('ws://localhost:3000/ws');
  }

  // Gibt einen Observable zurück, das alle empfangenen Nachrichten liefert
  public getMessages(): Observable<any> {
    return new Observable(observer => {
      this.socket.onmessage = (event) => {
        // Parsen der JSON-Daten
        observer.next(JSON.parse(event.data));
      };

      this.socket.onerror = (error) => {
        observer.error(error);
      };

      // Schließe den Observable, wenn die Verbindung geschlossen wird
      this.socket.onclose = () => {
        observer.complete();
      };
    });
  }
}
