import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet.heat';
import { WebsocketService } from '../../services/websocket.service';
import { Subscription, interval } from 'rxjs';
import { ExportService } from '../../services/export.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css'],
  imports: [CommonModule]
})
export class HeatmapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: L.Map;
  private visitorData: any[] = [];
  private heatLayer: any;
  private polygon: L.Polygon | null = null;
  private markerLayerGroup!: L.LayerGroup;
  private wsSubscription?: Subscription;
  private reloadSubscription?: Subscription;

  constructor(
    private http: HttpClient,
    private wsService: WebsocketService,
    private exportService: ExportService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.loadZones();
    // Timer, der alle 60 Sekunden die Daten neu lädt
    this.reloadSubscription = interval(60000).subscribe(() => {
      this.loadInitialData();
      this.loadZones();
      this.addColoredMarkers();
      this.updateVisitorCounts();
    });
  }

  private updateVisitorCounts(): void {
    // Besucherzahlen pro Zone aktualisieren
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

  // Filtert die Besucherdaten basierend auf der Benutzerrolle
  private filterVisitorData(): any[] {
    const role = localStorage.getItem('role')?.toLowerCase() || '';
    const currentUserId = localStorage.getItem('userId') || '';

    if (role === 'eventveranstalter') {
      return this.visitorData;
    } else if (role === 'security') {
      return this.visitorData.filter(v =>
        v.role.toLowerCase() === 'security' ||
        v.role.toLowerCase() === 'besucher' ||
        v.role.toLowerCase() === 'visitor'
      );
    } else if (role === 'standbetreiber' || role === 'sanitäter') {
      return this.visitorData.filter(v =>
        v.userId === currentUserId || v.role.toLowerCase() === 'visitor'
      );
    } else if (role === 'visitor' || role === 'besucher') {
      return this.visitorData.filter(v => v.userId === currentUserId);
    }

    // Fallback (sollte eigentlich nie eintreten)
    switch (role) {
      case 'eventveranstalter':
        return this.visitorData;
      case 'security':
        return this.visitorData.filter(v =>
          v.role.toLowerCase() === 'security' ||
          v.role.toLowerCase() === 'besucher' ||
          v.role.toLowerCase() === 'visitor'
        );
      case 'sanitäter':
        return this.visitorData.filter(v =>
          v.role.toLowerCase() === 'sanitäter' ||
          v.role.toLowerCase() === 'besucher' ||
          v.role.toLowerCase() === 'visitor'
        );
      case 'standbetreiber':
        return this.visitorData.filter(v =>
          v.role.toLowerCase() === 'standbetreiber' ||
          v.role.toLowerCase() === 'besucher' ||
          v.role.toLowerCase() === 'visitor'
        );
      case 'besucher':
        return this.visitorData.filter(v => v.userId === currentUserId);
      default:
        return [];
    }
  }

  private updateHeatmap(): void {
    if (!this.map) return;

    // Entferne existierenden Heatmap-Layer und Polygon
    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }
    if (this.polygon) {
      this.map.removeLayer(this.polygon);
    }

    // Definiere Polygon-Punkte (als [lat, lng])
    const polygonPoints: L.LatLngTuple[] = [
      [48.6977, 10.28908],
      [48.69803, 10.28953],
      [48.69661, 10.29178],
      [48.69611, 10.29117]
    ];

    // Erstelle das Polygon und füge es zur Karte hinzu
    this.polygon = L.polygon(polygonPoints, {
      color: 'red',
      fillColor: 'orange',
      fillOpacity: 0.2
    }).addTo(this.map);

    // Filtere die Besucherdaten
    const filteredData = this.filterVisitorData();

    // Erstelle Punkte für den Heatmap-Layer
    if (filteredData && filteredData.length > 0) {
      const points = filteredData
        .map(visitor => {
          if (visitor.location?.coordinates) {
            // Annahme: Im Backend wird GeoJSON ([lng, lat]) gespeichert,
            // hier für Leaflet als [lat, lng] umkehren
            return [
              visitor.location.coordinates[1],
              visitor.location.coordinates[0],
              1
            ];
          }
          return null;
        })
        .filter(point => point !== null);

      // Erstelle und füge den neuen Heatmap-Layer hinzu
      this.heatLayer = (L as any).heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17
      });
      this.heatLayer.addTo(this.map);
    }
  }

  // Fügt farbige Marker basierend auf der Rolle hinzu
  private addColoredMarkers(): void {
    // Vorherige Marker aus der Marker-LayerGroup entfernen
    if (this.markerLayerGroup) {
      this.markerLayerGroup.clearLayers();
    }

    // Verwende die gefilterten Besucherdaten
    const filteredData = this.filterVisitorData();
    filteredData.forEach(visitor => {
      if (visitor.location?.coordinates) {
        const lat = visitor.location.coordinates[1];
        const lng = visitor.location.coordinates[0];
        let color = 'blue'; // Standardfarbe

        // Farbe je nach Rolle anpassen
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

        // Erstelle den CircleMarker und binde ihn an die Marker-LayerGroup
        const marker = L.circleMarker([lat, lng], {
          radius: radius,
          fillColor: color,
          color: '#000',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
        marker.bindPopup(`Rolle: ${visitor.role}<br>ID: ${visitor.userId}`);
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
    // Initialisiere die Marker-LayerGroup
    this.markerLayerGroup = L.layerGroup().addTo(this.map);
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
    // Debug-Ausgabe der Besucherzahlen
    visitorsPerZone.forEach((count, zone) => {
      console.log(`${zone}: ${count} Besucher`);
    });
    // Lade Zonen-Daten
    this.http.get<any[]>('http://localhost:3000/api/zones').subscribe(
      zones => {
        console.log('Geladene Zonen:', zones);
        // Entferne vorhandene Polygone außer dem Hauptpolygon
        if (this.map) {
          this.map.eachLayer((layer: any) => {
            if (layer instanceof L.Polygon && layer !== this.polygon) {
              this.map.removeLayer(layer);
            }
          });
        }
        zones.forEach(zone => {
          // Konvertiere GeoJSON-Koordinaten ([lng, lat]) in Leaflet-Koordinaten ([lat, lng])
          const polygonPoints: L.LatLngTuple[] = zone.area.coordinates[0].map((coord: number[]) => {
            return [coord[1], coord[0]];
          });
          // Hole die aktuelle Besucherzahl
          const currentVisitors = visitorsPerZone.get(zone.name) || 0;
          let borderColor = 'blue';
          if (zone.capacity) {
            const percentage = (currentVisitors / zone.capacity) * 100;
            if (percentage >= 90) {
              borderColor = 'red';
            } else if (percentage >= 50) {
              borderColor = 'yellow';
            }
          }
          // Erstelle das Polygon und füge es hinzu
          const polygon = L.polygon(polygonPoints, {
            color: borderColor,
            fillColor: borderColor,
            fillOpacity: 0.2,
            weight: 2
          }).addTo(this.map);
          // Tooltip-Text mit Besucherzahlen
          let tooltipText = zone.name;
          if (zone.capacity) {
            tooltipText += `\n${currentVisitors}/${zone.capacity} Besucher`;
          }
          if (zone.name.toLowerCase().includes('eingang')) {
            tooltipText = `Eingang\n${currentVisitors}/${zone.capacity} Besucher`;
          } else if (zone.name.toLowerCase().includes('haupttribüne')) {
            tooltipText = `Haupttribüne\n${currentVisitors}/${zone.capacity} Besucher`;
          }
          polygon.bindTooltip(tooltipText, { 
            direction: 'top', 
            opacity: 0.9,
            permanent: false
          });
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

  isEventveranstalter(): boolean {
    const role = localStorage.getItem('role');
    return role?.toLowerCase() === 'eventveranstalter';
  }

  exportData(): void {
    this.http.get('http://localhost:3000/api/export-data')
      .subscribe((data) => {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        link.download = `event-export-${date}.json`;
        link.href = url;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }
}
