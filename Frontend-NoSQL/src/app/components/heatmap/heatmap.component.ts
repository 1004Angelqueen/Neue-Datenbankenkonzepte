import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import 'leaflet.heat';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  standalone: true,
  selector: 'app-heatmap',
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.css']
})
export class HeatmapComponent implements OnInit, AfterViewInit {
  private map!: L.Map;
  private visitorData: any[] = [];
  private heatLayer: any;
  private updateTimer: any = null;

  constructor(private http: HttpClient, private wsService: WebsocketService) {}

  ngOnInit(): void {
    // Initialer Datenabruf (optional, falls du auch historische Daten laden willst)
    this.http.get<any[]>('http://localhost:3000/api/heatmap').subscribe(
      data => {
        this.visitorData = data;
        this.addHeatmapLayer();
      },
      err => console.error('Fehler beim Abrufen der Heatmap-Daten', err)
      
    );

    // Abonniere WebSocket-Nachrichten für Echtzeit-Updates
    this.wsService.getMessages().subscribe(
      data => {
        console.log('WebSocket Update:', data);
        // Aktualisiere visitorData und/oder füge den neuen Standort hinzu
        this.visitorData.push(data);
        // Aktualisiere den Heatmap-Layer: Entferne den alten Layer und füge einen neuen hinzu
        if (this.heatLayer) {
          this.map.removeLayer(this.heatLayer);
        }
        this.addHeatmapLayer();
      },
      err => console.error('WebSocket Fehler:', err)
    );

     // WebSocket-Nachrichten abonnieren und throttlen
     this.wsService.getMessages().subscribe(
      data => {
        console.log('WebSocket Update:', data);
        this.visitorData.push(data);
        // Wenn schon ein Timer läuft, tue nichts
        if (this.updateTimer) return;
        // Starte einen Timer, der nach 2 Sekunden den Layer aktualisiert
        this.updateTimer = setTimeout(() => {
          if (this.heatLayer) {
            this.map.removeLayer(this.heatLayer);
          }
          this.addHeatmapLayer();
          this.updateTimer = null;
        }, 2000);
      },
      err => console.error('WebSocket Fehler:', err)
    );
  }

  ngAfterViewInit(): void {
    // Initialisiere die Karte (hier kannst du deinen bevorzugten Tile-Layer verwenden)
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
  }

  addHeatmapLayer(): void {
    // Zeichne das Polygon (Viereck) – optional, falls du den Bereich markieren willst
    const polygonPoints: L.LatLngTuple[] = [
      [48.6977, 10.28908],
      [48.69803, 10.28953],
      [48.69661, 10.29178],
      [48.69611, 10.29117]
    ];
    L.polygon(polygonPoints, {
      color: 'red',
      fillColor: 'orange',
      fillOpacity: 0.2
    }).addTo(this.map);

    // Wenn keine Besucherdaten vorhanden sind, überspringen
    if (!this.visitorData || this.visitorData.length === 0) return;

    // Erzeuge Punkte für die Heatmap
    const points = this.visitorData.map(visitor => {
      const lat = visitor.location.coordinates[1];
      const lng = visitor.location.coordinates[0];
      return [lat, lng, 1];
    });

    // Erzeuge den Heatmap-Layer
    this.heatLayer = (L as any).heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17
    });
    this.heatLayer.addTo(this.map);
  }
}
