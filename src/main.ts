/**
 * Archivo principal de bootstrap para la aplicación Angular
 * The Last of Us Temporada 2 - Experiencia Web Inmersiva
 * Ahora incluye la nueva sección de Videos
 */

import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';

import { NavegacionComponent } from './components/navegacion/navegacion.component';
import { HeroComponent } from './components/hero/hero.component';
import { PersonajesComponent } from './components/personajes/personajes.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { GaleriaComponent } from './components/galeria/galeria.component';
import { VideosComponent } from './components/videos/videos.component';
import { FooterComponent } from './components/footer/footer.component';

/**
 * Componente raíz de la aplicación
 * Orquesta todos los componentes principales de la página
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
    <!-- Estructura principal de la página -->
    <div class="app-container">
      <!-- Navegación principal -->
      <app-navegacion></app-navegacion>
      
      <!-- Contenido principal -->
      <main class="main-content">
        <!-- Sección hero/banner -->
        <app-hero></app-hero>
        
        <!-- Sección de personajes -->
        <app-personajes></app-personajes>
        
        <!-- Timeline de eventos con reproductores de audio -->
        <app-timeline></app-timeline>
        
        <!-- Galería de imágenes -->
        <app-galeria></app-galeria>
        
        <!-- Sección de videos (inicialmente oculta) -->
        <app-videos style="display: none;"></app-videos>
      </main>
      
      <!-- Pie de página -->
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
  title = 'The Last of Us Temporada 2 - Plataforma Multimedia';
}

// Bootstrap de la aplicación con animaciones habilitadas
bootstrapApplication(App, {
  providers: [
    provideAnimations() // Habilita las animaciones de Angular
  ]
}).catch(err => console.error('Error al iniciar la aplicación:', err));