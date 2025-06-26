/**
 * Enhanced main application file
 * Now includes HTTP client and video platform functionality
 */

import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

import { NavegacionComponent } from './components/navegacion/navegacion.component';
import { HeroComponent } from './components/hero/hero.component';
import { PersonajesComponent } from './components/personajes/personajes.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { GaleriaComponent } from './components/galeria/galeria.component';
import { VideosComponent } from './components/videos/videos.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * HTTP Interceptor for authentication
 */
const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  // Add auth token to requests if available
  const token = localStorage.getItem('accessToken');
  
  if (token && req.url.includes('/api/')) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }
  
  return next(req);
};

/**
 * HTTP Interceptor for error handling
 */
const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  return next(req).pipe(
    // You can add global error handling here if needed
  );
};

/**
 * Main application component
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavegacionComponent,
    HeroComponent,
    PersonajesComponent,
    TimelineComponent,
    GaleriaComponent,
    VideosComponent,
    FooterComponent
  ],
  template: `
    <div class="app-container">
      <!-- Navigation -->
      <app-navegacion></app-navegacion>
      
      <!-- Main content -->
      <main class="main-content">
        <!-- Hero section -->
        <app-hero></app-hero>
        
        <!-- Characters section -->
        <app-personajes></app-personajes>
        
        <!-- Timeline section -->
        <app-timeline></app-timeline>
        
        <!-- Gallery section -->
        <app-galeria></app-galeria>
        
        <!-- Videos section (initially hidden) -->
        <app-videos style="display: none;"></app-videos>
      </main>
      
      <!-- Footer -->
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .main-content {
      flex: 1;
      position: relative;
    }
  `]
})
export class App {
  title = 'The Last of Us Temporada 2 - Plataforma Multimedia Completa';
}

// Bootstrap application with enhanced providers
bootstrapApplication(App, {
  providers: [
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor, errorInterceptor])
    )
  ]
}).catch(err => console.error('Error al iniciar la aplicación:', err));