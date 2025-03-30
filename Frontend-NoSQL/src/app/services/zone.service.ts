import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export interface ZoneStatus {
  zone: string;
  currentVisitors: number;
  capacity: number;
  type: 'full' | 'half' | 'normal';
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private zoneStatus = new BehaviorSubject<ZoneStatus[]>([]);

  constructor(private wsService: WebsocketService) {
    // Empfange Zone-Updates vom WebSocket
    this.wsService.getMessages().pipe(
      filter(message => message.type === 'zone_status')
    ).subscribe(message => {
      this.updateZoneStatus(message.message);
    });
  }

  getZoneStatus(): Observable<ZoneStatus[]> {
    return this.zoneStatus.asObservable();
  }

  private updateZoneStatus(zoneData: any) {
    const currentTime = new Date().toISOString();
    const currentStatus = this.zoneStatus.value;
    const zoneIndex = currentStatus.findIndex(z => z.zone === zoneData.zone);

    // Bestimme den Typ basierend auf der Auslastung
    const percentage = (zoneData.currentVisitors / zoneData.capacity) * 100;
    let type: 'full' | 'half' | 'normal';
    
    if (percentage >= 90) {
      type = 'full';
    } else if (percentage >= 50) {
      type = 'half';
    } else {
      type = 'normal';
    }

    const newStatus: ZoneStatus = {
      zone: zoneData.zone,
      currentVisitors: zoneData.currentVisitors,
      capacity: zoneData.capacity,
      type: type,
      timestamp: currentTime
    };

    if (zoneIndex === -1) {
      currentStatus.push(newStatus);
    } else {
      currentStatus[zoneIndex] = newStatus;
    }

    this.zoneStatus.next([...currentStatus]);
  }
}