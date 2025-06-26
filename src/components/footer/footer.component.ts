/**
 * Componente Footer
 * Pie de página con información adicional y enlaces
 */

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <!-- Contenido principal del footer -->
        <div class="footer-content">
          <!-- Información de la serie -->
          <div class="footer-section">
            <h3 class="footer-title">The Last of Us Temporada 2</h3>
            <p class="footer-description">
              Una experiencia web inmersiva dedicada a explorar el mundo post-apocalíptico 
              de The Last of Us. Conoce a los personajes, revive los momentos clave y 
              sumérgete en esta épica historia de supervivencia.
            </p>
            <div class="footer-stats">
              <div class="stat">
                <span class="stat-number">20+</span>
                <span class="stat-label">Años después</span>
              </div>
              <div class="stat">
                <span class="stat-number">6</span>
                <span class="stat-label">Personajes</span>
              </div>
              <div class="stat">
                <span class="stat-number">8</span>
                <span class="stat-label">Eventos clave</span>
              </div>
            </div>
          </div>

          <!-- Enlaces rápidos -->
          <div class="footer-section">
            <h4 class="section-title">Explorar</h4>
            <ul class="footer-links">
              <li><a href="#inicio" (click)="scrollToSection('inicio', $event)">Inicio</a></li>
              <li><a href="#personajes" (click)="scrollToSection('personajes', $event)">Personajes</a></li>
              <li><a href="#timeline" (click)="scrollToSection('timeline', $event)">Historia</a></li>
              <li><a href="#galeria" (click)="scrollToSection('galeria', $event)">Galería</a></li>
            </ul>
          </div>

          <!-- Información técnica -->
          <div class="footer-section">
            <h4 class="section-title">Tecnología</h4>
            <ul class="footer-links">
              <li><span class="tech-item">Angular 19</span></li>
              <li><span class="tech-item">TypeScript</span></li>
              <li><span class="tech-item">CSS3 Animations</span></li>
              <li><span class="tech-item">Responsive Design</span></li>
            </ul>
            <div class="tech-badges">
              <span class="tech-badge">🅰️ Angular</span>
              <span class="tech-badge">📱 Responsive</span>
              <span class="tech-badge">🎨 CSS3</span>
            </div>
          </div>

          <!-- Contacto y redes -->
          <div class="footer-section">
            <h4 class="section-title">Conecta</h4>
            <p class="contact-text">
              Esta es una página web de demostración creada con fines educativos 
              y de entretenimiento.
            </p>
            <div class="social-links">
              <a href="#" class="social-link" aria-label="GitHub">
                <span class="social-icon">💻</span>
                <span class="social-text">GitHub</span>
              </a>
              <a href="#" class="social-link" aria-label="LinkedIn">
                <span class="social-icon">💼</span>
                <span class="social-text">LinkedIn</span>
              </a>
              <a href="#" class="social-link" aria-label="Portfolio">
                <span class="social-icon">🌐</span>
                <span class="social-text">Portfolio</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Separador -->
        <div class="footer-divider"></div>

        <!-- Información de copyright -->
        <div class="footer-bottom">
          <div class="copyright">
            <p>
              © {{ currentYear }} The Last of Us Temporada 2 - Aplicación Web. 
              Creado con Angular.
            </p>
            <p class="disclaimer">
              Esta página es un proyecto de Companion con fines Académicos. Desarrollado por David Ordoñez y Anthony Narváez.
            </p>
          </div>
          
          <!-- Botón volver arriba -->
          <button 
            class="back-to-top"
            (click)="scrollToTop()"
            [class.visible]="showBackToTop"
            aria-label="Volver al inicio"
          >
            <span class="arrow-up">↑</span>
            <span class="back-text">Inicio</span>
          </button>
        </div>
      </div>

      <!-- Elementos decorativos -->
      <div class="footer-decoration">
        <div class="spore-particle" 
             *ngFor="let spore of decorativeSpores; let i = index"
             [style.left]="spore.x + '%'"
             [style.animation-delay]="i * 0.8 + 's'">
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(135deg, var(--color-fondo-oscuro) 0%, #0d0d0d 100%);
      color: var(--color-texto-claro);
      position: relative;
      overflow: hidden;
      border-top: 2px solid var(--color-acento);
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: var(--espaciado-lg);
      padding: var(--espaciado-xl) 0 var(--espaciado-lg);
    }

    .footer-section {
      animation: fadeInUp 0.6s ease-out;
    }

    .footer-title {
      color: var(--color-acento);
      font-family: var(--fuente-titulo);
      font-size: 1.5rem;
      font-weight: 900;
      margin-bottom: var(--espaciado-sm);
      text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
    }

    .section-title {
      color: var(--color-supervivencia);
      font-family: var(--fuente-titulo);
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: var(--espaciado-sm);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .footer-description {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.6;
      margin-bottom: var(--espaciado-md);
    }

    .footer-stats {
      display: flex;
      gap: var(--espaciado-md);
      flex-wrap: wrap;
    }

    .stat {
      text-align: center;
      padding: var(--espaciado-xs);
      border: 1px solid var(--color-acento);
      border-radius: 8px;
      background: rgba(255, 107, 53, 0.1);
      min-width: 80px;
      transition: all var(--transicion-media);
    }

    .stat:hover {
      background: rgba(255, 107, 53, 0.2);
      transform: translateY(-2px);
    }

    .stat-number {
      display: block;
      font-family: var(--fuente-titulo);
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--color-acento);
    }

    .stat-label {
      display: block;
      font-size: 0.8rem;
      color: rgba(245, 245, 245, 0.7);
      margin-top: 2px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-links li {
      margin-bottom: var(--espaciado-xs);
    }

    .footer-links a {
      color: rgba(245, 245, 245, 0.8);
      text-decoration: none;
      transition: all var(--transicion-rapida);
      display: inline-block;
      position: relative;
    }

    .footer-links a::before {
      content: '→';
      position: absolute;
      left: -20px;
      opacity: 0;
      transition: all var(--transicion-rapida);
      color: var(--color-acento);
    }

    .footer-links a:hover {
      color: var(--color-acento);
      transform: translateX(15px);
    }

    .footer-links a:hover::before {
      opacity: 1;
    }

    .tech-item {
      color: rgba(245, 245, 245, 0.8);
      font-family: var(--fuente-titulo);
      font-weight: 500;
    }

    .tech-badges {
      display: flex;
      gap: var(--espaciado-xs);
      margin-top: var(--espaciado-sm);
      flex-wrap: wrap;
    }

    .tech-badge {
      padding: 4px 8px;
      background: rgba(74, 93, 35, 0.3);
      color: var(--color-supervivencia);
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      border: 1px solid var(--color-supervivencia);
    }

    .contact-text {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.5;
      margin-bottom: var(--espaciado-sm);
      font-size: 0.9rem;
    }

    .social-links {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
    }

    .social-link {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      color: rgba(245, 245, 245, 0.8);
      text-decoration: none;
      padding: var(--espaciado-xs);
      border-radius: 8px;
      transition: all var(--transicion-media);
      border: 1px solid transparent;
    }

    .social-link:hover {
      color: var(--color-acento);
      background: rgba(255, 107, 53, 0.1);
      border-color: var(--color-acento);
      transform: translateX(5px);
    }

    .social-icon {
      font-size: 1.2rem;
    }

    .social-text {
      font-weight: 500;
    }

    .footer-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--color-acento), transparent);
      margin: var(--espaciado-lg) 0;
    }

    .footer-bottom {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--espaciado-md);
      flex-wrap: wrap;
      gap: var(--espaciado-md);
    }

    .copyright {
      flex: 1;
    }

    .copyright p {
      color: rgba(245, 245, 245, 0.6);
      font-size: 0.9rem;
      margin-bottom: var(--espaciado-xs);
    }

    .disclaimer {
      font-size: 0.8rem !important;
      color: rgba(245, 245, 245, 0.5) !important;
    }

    .back-to-top {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: var(--espaciado-sm);
      background: var(--gradiente-apocaliptico);
      border: 2px solid var(--color-acento);
      border-radius: 12px;
      color: var(--color-texto-claro);
      cursor: pointer;
      transition: all var(--transicion-media);
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
    }

    .back-to-top.visible {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    .back-to-top:hover {
      background: var(--color-acento);
      transform: translateY(-3px);
      box-shadow: var(--sombra-media);
    }

    .arrow-up {
      font-size: 1.2rem;
      font-weight: bold;
    }

    .back-text {
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .footer-decoration {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .spore-particle {
      position: absolute;
      top: 20%;
      width: 3px;
      height: 3px;
      background: var(--color-acento);
      border-radius: 50%;
      opacity: 0.2;
      animation: floatUp 8s ease-in-out infinite;
    }

    .spore-particle::before {
      content: '';
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      background: radial-gradient(circle, var(--color-acento) 0%, transparent 70%);
      border-radius: 50%;
      opacity: 0.3;
    }

    @keyframes floatUp {
      0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 0.2;
      }
      90% {
        opacity: 0.2;
      }
      100% {
        transform: translateY(-100px) rotate(360deg);
        opacity: 0;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .footer-content {
        grid-template-columns: 1fr;
        gap: var(--espaciado-md);
        padding: var(--espaciado-lg) 0;
      }

      .footer-stats {
        justify-content: center;
      }

      .footer-bottom {
        flex-direction: column;
        text-align: center;
        gap: var(--espaciado-sm);
      }

      .tech-badges {
        justify-content: center;
      }

      .social-links {
        align-items: center;
      }
    }

    @media (max-width: 480px) {
      .footer-stats {
        flex-direction: column;
        align-items: center;
      }

      .stat {
        width: 100%;
        max-width: 120px;
      }

      .tech-badges {
        flex-direction: column;
        align-items: center;
      }

      .tech-badge {
        text-align: center;
        min-width: 100px;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  showBackToTop = false;
  decorativeSpores: Array<{x: number}> = [];

  constructor() {
    this.generateDecorativeSpores();
    this.checkScrollPosition();
  }

  /**
   * Genera partículas decorativas para el footer
   */
  private generateDecorativeSpores() {
    for (let i = 0; i < 8; i++) {
      this.decorativeSpores.push({
        x: Math.random() * 100
      });
    }
  }

  /**
   * Verifica la posición del scroll para mostrar el botón "volver arriba"
   */
  private checkScrollPosition() {
    window.addEventListener('scroll', () => {
      this.showBackToTop = window.pageYOffset > 500;
    });
  }

  /**
   * Navega suavemente a una sección específica
   * @param sectionId - ID de la sección objetivo
   * @param event - Evento del click
   */
  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    
    const sectionMap: { [key: string]: string } = {
      'inicio': '.hero-section',
      'personajes': '.personajes-section',
      'timeline': '.timeline-section',
      'galeria': '.galeria-section'
    };

    const targetSelector = sectionMap[sectionId];
    if (targetSelector) {
      const targetElement = document.querySelector(targetSelector);
      if (targetElement) {
        const navbarHeight = 80;
        const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }
  }

  /**
   * Navega suavemente al inicio de la página
   */
  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}