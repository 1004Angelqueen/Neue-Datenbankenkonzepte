import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { WebsocketService } from './services/websocket.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    WebsocketService  // Hier den Service registrieren
  ]
};