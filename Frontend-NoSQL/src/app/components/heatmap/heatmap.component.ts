import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet.heat';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription, interval } from 'rxjs';

@Component({
  standalone: true,
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private visitorData: any[] = [];
  private heatLayer: any;
  private polygon: L.Polygon | null = null;  // Polygon-Referenz hinzugefügt
  private wsSubscription?: Subscription;
  private reloadSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private wsService: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.loadZones();
    // Timer starten, der alle 60 Sekunden die Daten neu lädt
    this.reloadSubscription = interval(5000).subscribe(() => {
      this.loadInitialData();
      this.loadZones();
      this.addColoredMarkers(); 
      this.updateVisitorCounts(); 


    });
  }
  private updateVisitorCounts(): void {
    // Aktualisiere die Besucherzahlen für alle Zonen
    const counts = new Map<string, number>();
    
    this.visitorData.forEach(visitor => {
      if (visitor.zone) {
        const count = counts.get(visitor.zone) || 0;
        counts.set(visitor.zone, count + 1);
      }
    });
  
    // Debug-Ausgabe der Besucherzahlen
    counts.forEach((count, zoneName) => {
      console.log(`Zone ${zoneName}: ${count} Besucher`);
    });
  }
  private loadInitialData(): void {
    this.http.get<any[]>('http://localhost:3000/api/heatmap').subscribe({
      next: (data) => {
        console.log('Neue Daten geladen:', data);
        this.visitorData = data;
        this.updateHeatmap();
      },
      error: (err) => console.error('Fehler beim Laden der Daten:', err)
    });
  }
  private filterVisitorData(): any[] {
    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const currentUserId = localStorage.getItem('userId') || '';
    
    console.log('Aktuelle Rolle:', role);
    console.log('Aktueller User:', currentUserId);
  
    switch(role) {
      case 'eventveranstalter':
        // Eventveranstalter sieht alle
        return this.visitorData;
        
      case 'security':
        // Security sieht sich selbst und alle Besucher
        return this.visitorData.filter(v => 
          v.role.toLowerCase() === 'security' || 
          v.role.toLowerCase() === 'besucher'||
          v.role.toLowerCase() === 'visitor'

        );
        
      case 'sanitäter':
        // Sanitäter sieht sich selbst und alle Besucher
        return this.visitorData.filter(v => 
          v.role.toLowerCase() === 'sanitäter' || 
            v.role.toLowerCase() === 'besucher'||
          v.role.toLowerCase() === 'visitor'
        );
        
      case 'standbetreiber':
        // Standbetreiber sieht sich selbst und alle Besucher
        return this.visitorData.filter(v => 
          v.role.toLowerCase() === 'standbetreiber' || 
            v.role.toLowerCase() === 'besucher'||
          v.role.toLowerCase() === 'visitor'
        );
        
      case 'besucher':
        // Besucher sieht NUR sich selbst
        return this.visitorData.filter(v => v.userId === currentUserId);
        
      default:
        // Wenn keine Rolle oder unbekannte Rolle, sieht man nichts
        return [];
    }
  }
  private updateHeatmap(): void {
    if (!this.map) return;

    // Existierenden Heatmap-Layer und Polygon entfernen
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }
    if (this.polygon) {
      this.map.removeLayer(this.polygon);
    }

    // Polygon-Punkte definieren
    const polygonPoints: L.LatLngTuple[] = [
      [48.6977, 10.28908],
      [48.69803, 10.28953],
      [48.69661, 10.29178],
      [48.69611, 10.29117]
    ];

    // Neues Polygon erstellen und zur Karte hinzufügen
    this.polygon = L.polygon(polygonPoints, {
      color: 'red',
      fillColor: 'orange',
      fillOpacity: 0.2
    }).addTo(this.map);

      // Besucherdaten filtern
      const filteredData = this.filterVisitorData();
    // Punkte für die Heatmap erstellen
      // Punkte für die Heatmap erstellen
      if (filteredData && filteredData.length > 0) {
        const points = filteredData
          .map(visitor => {
            if (visitor.location?.coordinates) {
              return [
                visitor.location.coordinates[1],
                visitor.location.coordinates[0],
                1
              ];
            }
            return null;
          })
          .filter(point => point !== null);

      // Neuen Heatmap-Layer erstellen
      this.heatLayer = (L as any).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17
      });
      this.heatLayer.addTo(this.map);
    }
  }
// NEU: Methode zum Hinzufügen farbiger Marker basierend auf der Rolle
private addColoredMarkers(): void {
  // Zuerst alle bestehenden Marker entfernen
  this.map.eachLayer((layer: any) => {
    if (layer instanceof L.CircleMarker) {
      this.map.removeLayer(layer);
    }
  });

  // Gefilterte Daten verwenden statt direkt visitorData
  const filteredData = this.filterVisitorData();
  
  // Iteriere über die gefilterten Daten
  filteredData.forEach(visitor => {
    if (visitor.location?.coordinates) {
      const lat = visitor.location.coordinates[1];
      const lng = visitor.location.coordinates[0];
      let color = 'blue'; // Standardfarbe für "Besucher"

      // Anpassung der Farbe je nach Rolle
      switch (visitor.role) {
        case 'Eventveranstalter':
          color = 'green';
          break;
        case 'Security':
          color = 'red';
          break;
        case 'Sanitäter':
          color = 'yellow';
          break;
        case 'Standbetreiber':
          color = 'orange';
          break;
        case 'Besucher':
        default:
          color = 'blue';
          break;
      }

      let radius = 8;

      if (visitor.currentVisitors !== undefined && visitor.currentVisitors > 0) {
        radius = 4;
      }

      const marker = L.circleMarker([lat, lng], {
        radius: radius,
        fillColor: color,
        color: '#000',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(this.map);

      // Erweiterte Popup-Info
      marker.bindPopup(`Rolle: ${visitor.role}<br>ID: ${visitor.userId}`);
    }
  });
}

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([48.6977, 10.28908], 16);

    L.tileLayer(
      'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=bKrev0TvOOhVo2RwAAqE',
      {
        tileSize: 512,
        zoomOffset: -1,
        minZoom: 1,
        crossOrigin: true,
        attribution:
          'Map data © <a href="https://www.maptiler.com/">MapTiler</a> ' +
          '© <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
      }
    ).addTo(this.map);
    
    (window as any)['map'] = this.map;

      // Rufe die Methode zum Laden und Zeichnen der Zonen auf:
  this.loadZones();
  }
  loadZones(): void {
    // Besucherzählung pro Zone
    const visitorsPerZone = new Map<string, number>();
    this.visitorData.forEach(visitor => {
      if (visitor.zone) {
        visitorsPerZone.set(visitor.zone, (visitorsPerZone.get(visitor.zone) || 0) + 1);
      }
    });
  
    // Debug: Zeige Besucherzahlen
    visitorsPerZone.forEach((count, zone) => {
      console.log(`${zone}: ${count} Besucher`);
    });
  
    this.http.get<any[]>('http://localhost:3000/api/zones').subscribe(
      zones => {
        console.log('Geladene Zonen:', zones);
        
        // Bestehende Polygone entfernen
        if (this.map) {
          this.map.eachLayer((layer: any) => {
            if (layer instanceof L.Polygon && layer !== this.polygon) {
              this.map.removeLayer(layer);
            }
          });
        }
  
        zones.forEach(zone => {
          // Konvertiere GeoJSON-Koordinaten
          const polygonPoints: L.LatLngTuple[] = zone.area.coordinates[0].map((coord: number[]) => {
            return [coord[1], coord[0]];
          });
  
          // Aktuelle Besucherzahl aus der Map holen
          const currentVisitors = visitorsPerZone.get(zone.name) || 0;
  
          // Standardfarbe ist blau
          let borderColor = 'blue';
          
          // Auslastung berechnen und Farbe setzen
          if (zone.capacity) {
            const percentage = (currentVisitors / zone.capacity) * 100;
            
            if (percentage >= 90) {
              borderColor = 'red';    // Zone ist voll
            } else if (percentage >= 50) {
              borderColor = 'yellow'; // Zone ist halb voll
            }
          }
  
          // Polygon erstellen
          const polygon = L.polygon(polygonPoints, {
            color: borderColor,     // Rahmenfarbe der Zone
            fillColor: borderColor, // Füllfarbe der Zone
            fillOpacity: 0.2,      // Leichte Transparenz
            weight: 2              // Liniendicke
          }).addTo(this.map);
          
          // Tooltip-Text mit Besucherzahlen
          let tooltipText = zone.name;
          if (zone.capacity) {
            tooltipText += `\n${currentVisitors}/${zone.capacity} Besucher`;
          }
          
          // Name vereinfachen falls gewünscht
          if (zone.name.toLowerCase().includes('eingang')) {
            tooltipText = `Eingang\n${currentVisitors}/${zone.capacity} Besucher`;
          } else if (zone.name.toLowerCase().includes('haupttribüne')) {
            tooltipText = `Haupttribüne\n${currentVisitors}/${zone.capacity} Besucher`;
          }
          
          // Tooltip an das Polygon binden - nur beim Hover sichtbar
          polygon.bindTooltip(tooltipText, { 
            direction: 'top', 
            opacity: 0.9,
            permanent: false // Tooltip nur beim Hover sichtbar
          });
        });
      },
      err => console.error('Fehler beim Laden der Zonen:', err)
    );
  }
  
  ngOnDestroy() {
    // Aufräumen
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.reloadSubscription) {
      this.reloadSubscription.unsubscribe();
    }
  }
}