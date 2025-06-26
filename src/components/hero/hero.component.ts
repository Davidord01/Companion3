/**
 * Componente Hero - Sección principal de la página
 * Presenta la información principal con efectos parallax y animaciones
 */

import { Component, OnInit, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hero-section" #heroSection>
      <!-- Fondo con parallax -->
      <div class="hero-background" [style.transform]="'translateY(' + parallaxOffset + 'px)'">
        <div class="hero-overlay"></div>
      </div>

      <!-- Contenido principal -->
      <div class="hero-content">
        <div class="hero-text fade-in-up">
          <h1 class="hero-title">
            <span class="title-line">The Last of Us</span>
            <span class="title-line subtitle">Temporada 2</span>
          </h1>
          
          <p class="hero-description">
            En un mundo donde la naturaleza ha reclamado la civilización y los infectados acechan en cada esquina, 
            sigue la épica historia de supervivencia, venganza y redención de Ellie Williams.
          </p>

          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">20+</span>
              <span class="stat-label">Años después del brote</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">6</span>
              <span class="stat-label">Personajes principales</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">100%</span>
              <span class="stat-label">Inmersión garantizada</span>
            </div>
          </div>

          <div class="hero-actions">
            <button class="btn btn-primario" (click)="scrollToPersonajes()">
              Conoce a los personajes
            </button>
            <button class="btn btn-secundario" (click)="scrollToTimeline()">
              Explora la historia
            </button>
          </div>
        </div>

        <!-- Indicador de scroll -->
        <div class="scroll-indicator" [class.visible]="showScrollIndicator">
          <div class="scroll-arrow"></div>
          <span class="scroll-text">Desliza para explorar</span>
        </div>
      </div>

      <!-- Elementos decorativos con partículas -->
      <div class="floating-elements">
        <div class="spore" 
             *ngFor="let spore of spores; let i = index"
             [style.left]="spore.x + '%'"
             [style.top]="spore.y + '%'"
             [style.animation-delay]="i * 0.5 + 's'">
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero-section {
      position: relative;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      color: var(--color-texto-claro);
    }

    .hero-background {
      position: absolute;
      top: -50px;
      left: 0;
      right: 0;
      bottom: -50px;
      background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)),
                  url('https://i.blogs.es/1d1ee4/the-last-of-us-2-sony-naughty-dog/1366_2000.jpeg') center/cover no-repeat;
      will-change: transform;
    }

    .hero-overlay {
      position: absolute;
      inset: 0;
      background: var(--gradiente-apocaliptico);
      opacity: 0.8;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      text-align: center;
      max-width: 800px;
      padding: var(--espaciado-md);
    }

    .hero-title {
      font-family: var(--fuente-titulo);
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: var(--espaciado-md);
      text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.7);
    }

    .title-line {
      display: block;
      animation: slideInFromLeft 1s ease-out;
    }

    .subtitle {
      color: var(--color-acento);
      font-size: 0.7em;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      animation: slideInFromRight 1s ease-out 0.3s both;
    }

    .hero-description {
      font-size: clamp(1.1rem, 2.5vw, 1.4rem);
      line-height: 1.7;
      margin-bottom: var(--espaciado-lg);
      color: rgba(245, 245, 245, 0.9);
      animation: fadeInUp 1s ease-out 0.6s both;
    }

    .hero-stats {
      display: flex;
      justify-content: center;
      gap: var(--espaciado-md);
      margin-bottom: var(--espaciado-lg);
      flex-wrap: wrap;
    }

    .stat-item {
      text-align: center;
      padding: var(--espaciado-sm);
      border: 1px solid var(--color-acento);
      border-radius: 8px;
      background: rgba(255, 107, 53, 0.1);
      backdrop-filter: blur(5px);
      min-width: 140px;
      transition: all var(--transicion-media);
      animation: fadeInUp 1s ease-out calc(0.9s + var(--i) * 0.2s) both;
    }

    .stat-item:hover {
      transform: translateY(-5px);
      background: rgba(255, 107, 53, 0.2);
      box-shadow: var(--sombra-media);
    }

    .stat-number {
      display: block;
      font-family: var(--fuente-titulo);
      font-size: 2rem;
      font-weight: 900;
      color: var(--color-acento);
      line-height: 1;
    }

    .stat-label {
      display: block;
      font-size: 0.9rem;
      color: rgba(245, 245, 245, 0.8);
      margin-top: var(--espaciado-xs);
    }

    .hero-actions {
      display: flex;
      gap: var(--espaciado-sm);
      justify-content: center;
      flex-wrap: wrap;
      animation: fadeInUp 1s ease-out 1.2s both;
    }

    .scroll-indicator {
      position: absolute;
      bottom: var(--espaciado-md);
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .scroll-indicator.visible {
      opacity: 1;
      animation: fadeInUp 1s ease-out 1.5s both;
    }

    .scroll-arrow {
      width: 2px;
      height: 30px;
      background: var(--color-acento);
      margin: 0 auto var(--espaciado-xs);
      position: relative;
      animation: scrollBounce 2s ease-in-out infinite;
    }

    .scroll-arrow::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: -3px;
      width: 8px;
      height: 8px;
      border: 2px solid var(--color-acento);
      border-top: none;
      border-left: none;
      transform: rotate(45deg);
    }

    .scroll-text {
      font-size: 0.9rem;
      color: rgba(245, 245, 245, 0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .floating-elements {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .spore {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--color-acento);
      border-radius: 50%;
      opacity: 0.3;
      animation: float 6s ease-in-out infinite;
    }

    .spore::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: radial-gradient(circle, var(--color-acento) 0%, transparent 70%);
      border-radius: 50%;
      opacity: 0.5;
    }

    /* Animaciones personalizadas */
    @keyframes scrollBounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(10px);
      }
    }

    @keyframes float {
      0%, 100% {
        transform: translateY(0px) rotate(0deg);
        opacity: 0.3;
      }
      25% {
        transform: translateY(-20px) rotate(90deg);
        opacity: 0.6;
      }
      50% {
        transform: translateY(-10px) rotate(180deg);
        opacity: 0.4;
      }
      75% {
        transform: translateY(-30px) rotate(270deg);
        opacity: 0.7;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .hero-content {
        padding: var(--espaciado-sm);
      }

      .hero-stats {
        gap: var(--espaciado-sm);
      }

      .stat-item {
        min-width: 100px;
        padding: var(--espaciado-xs);
      }

      .stat-number {
        font-size: 1.5rem;
      }

      .hero-actions {
        flex-direction: column;
        align-items: center;
      }

      .btn {
        width: 100%;
        max-width: 250px;
      }
    }

    @media (max-width: 480px) {
      .hero-stats {
        flex-direction: column;
        align-items: center;
      }

      .stat-item {
        width: 100%;
        max-width: 200px;
      }
    }
  `]
})
export class HeroComponent implements OnInit {
  parallaxOffset = 0;
  showScrollIndicator = true;
  spores: Array<{x: number, y: number}> = [];

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.generateSpores();
    this.checkScrollIndicator();
  }

  /**
   * Escucha eventos de scroll para efectos parallax
   */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset;
    this.parallaxOffset = scrollTop * 0.5; // Factor de parallax
    this.checkScrollIndicator();
  }

  /**
   * Genera partículas flotantes aleatorias
   */
  private generateSpores() {
    for (let i = 0; i < 15; i++) {
      this.spores.push({
        x: Math.random() * 100,
        y: Math.random() * 100
      });
    }
  }

  /**
   * Controla la visibilidad del indicador de scroll
   */
  private checkScrollIndicator() {
    this.showScrollIndicator = window.pageYOffset < 100;
  }

  /**
   * Navegación suave a la sección de personajes
   */
  scrollToPersonajes() {
    const personajesSection = document.querySelector('.personajes-section');
    if (personajesSection) {
      personajesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  /**
   * Navegación suave a la sección de timeline
   */
  scrollToTimeline() {
    const timelineSection = document.querySelector('.timeline-section');
    if (timelineSection) {
      timelineSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
}