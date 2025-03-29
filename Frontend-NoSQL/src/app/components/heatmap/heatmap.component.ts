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
    // Timer starten, der alle 5 Sekunden die Daten neu lädt
    this.reloadSubscription = interval(5000).subscribe(() => {
      this.loadInitialData();
      this.loadZones();

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

    // Punkte für die Heatmap erstellen
    if (this.visitorData && this.visitorData.length > 0) {
      const points = this.visitorData
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
// Füge oben noch den HttpClient für die Zones hinzu – der HttpClient ist bereits vorhanden
loadZones(): void {
  this.http.get<any[]>('http://localhost:3000/api/zones').subscribe(
    zones => {
      console.log('Geladene Zonen:', zones);
      zones.forEach(zone => {
        // Das Feld "area.coordinates" ist laut unserem Modell ein Array von Ringen.
        // Wir gehen davon aus, dass du nur einen Ring pro Zone hast.
        // GeoJSON-Koordinaten haben die Reihenfolge [lng, lat].
        // Für Leaflet brauchen wir [lat, lng].
        const polygonPoints: L.LatLngTuple[] = zone.area.coordinates[0].map((coord: number[]) => {
          return [coord[1], coord[0]];
        });
        L.polygon(polygonPoints, {
          color: 'blue',       // Rahmenfarbe der Zone
          fillColor: 'blue',   // Füllfarbe der Zone
          fillOpacity: 0.1     // Transparenz
        }).addTo(this.map);
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