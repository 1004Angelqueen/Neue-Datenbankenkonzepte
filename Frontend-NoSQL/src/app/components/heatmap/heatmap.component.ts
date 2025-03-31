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
  private polygon: L.Polygon | null = null;
  private markerLayerGroup!: L.LayerGroup;  // Neue LayerGroup für Marker
  private wsSubscription?: Subscription;
  private reloadSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private wsService: WebsocketService,
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.loadZones();
    // Timer starten, der alle 5 Sekunden die Daten neu lädt
    this.reloadSubscription = interval(5000).subscribe(() => {
      this.loadInitialData();
      this.loadZones();
      this.addColoredMarkers(); // Marker hinzufügen
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

  // Methode zum Filtern der Besucherdaten basierend auf der Benutzerrolle
  private filterVisitorData(): any[] {
    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const currentUserId = localStorage.getItem('userId') || '';
    
    if (role === 'eventveranstalter') {
      return this.visitorData;
    } else if (role === 'security') {
      return this.visitorData.filter(v =>
        v.role.toLowerCase() === 'security' || v.role.toLowerCase() === 'visitor'
      );
    } else if (role === 'standbetreiber' || role === 'sanitäter') {
      return this.visitorData.filter(v =>
        v.userId === currentUserId || v.role.toLowerCase() === 'visitor'
      );
    } else if (role === 'visitor') {
      return this.visitorData.filter(v => v.userId === currentUserId);
    }
    return [];
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

  // Methode zum Hinzufügen farbiger Marker basierend auf der Rolle
  private addColoredMarkers(): void {
    // Vorherige Marker aus der Marker-LayerGroup entfernen
    if (this.markerLayerGroup) {
      this.markerLayerGroup.clearLayers();
    }

    // Iteriere über alle Besucher und füge Marker zur LayerGroup hinzu
    this.visitorData.forEach(visitor => {
      if (visitor.location?.coordinates) {
        const lat = visitor.location.coordinates[1];
        const lng = visitor.location.coordinates[0];
        let color = 'blue'; // Standardfarbe für "Besucher"

        // Farbe je nach Rolle anpassen
        switch (visitor.role) {
          case 'Eventveranstalter':
            color = 'green';
            break;
          case 'Security':
            color = 'red';
            break;
          case 'Vierte':
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

        // Erstelle einen CircleMarker und füge ihn der LayerGroup hinzu
        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
        marker.bindPopup(`Rolle: ${visitor.role}`);
        marker.addTo(this.markerLayerGroup);
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

    // Initialisierung der Marker-LayerGroup
    this.markerLayerGroup = L.layerGroup().addTo(this.map);

    // Zonen laden
    this.loadZones();
  }

  loadZones(): void {
    this.http.get<any[]>('http://localhost:3000/api/zones').subscribe(
      zones => {
        console.log('Geladene Zonen:', zones);
        zones.forEach(zone => {
          // Konvertiere GeoJSON-Koordinaten ([lng, lat]) in Leaflet-Koordinaten ([lat, lng])
          const polygonPoints: L.LatLngTuple[] = zone.area.coordinates[0].map((coord: number[]) => {
            return [coord[1], coord[0]];
          });
          let borderColor = 'blue';
          
          // Berechnung der Auslastung
          if (zone.currentVisitors !== undefined && zone.capacity) {
            const percentage = (zone.currentVisitors / zone.capacity) * 100;
            if (percentage >= 90) {
              borderColor = 'red';
            } else if (percentage >= 50) {
              borderColor = 'yellow';
            }
          }
          // Erstelle das Polygon und füge es der Karte hinzu
          const polygon = L.polygon(polygonPoints, {
            color: borderColor,
            fillColor: borderColor,
            fillOpacity: 0
          }).addTo(this.map);
          
          let tooltipText = zone.name;
          if (zone.name.toLowerCase().includes('eingang')) {
            tooltipText = 'Eingang';
          } else if (zone.name.toLowerCase().includes('haupttribüne')) {
            tooltipText = 'Haupttribüne';
          }
          polygon.bindTooltip(tooltipText, { direction: 'top', opacity: 0.8 });
        });
      },
      err => console.error('Fehler beim Laden der Zonen:', err)
    );
  }

  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.reloadSubscription) {
      this.reloadSubscription.unsubscribe();
    }
  }
}
