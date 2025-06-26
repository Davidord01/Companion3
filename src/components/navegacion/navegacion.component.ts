/**
 * Componente de navegación principal
 * Maneja la navegación suave entre secciones y efectos de scroll
 * Ahora incluye la nueva sección de Videos y sistema de autenticación
 */

import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService, Usuario } from '../../services/auth.service';
import { FormularioRegistroComponent } from '../formulario-registro/formulario-registro.component';

@Component({
  selector: 'app-navegacion',
  standalone: true,
  imports: [CommonModule, FormularioRegistroComponent],
  template: `
    <nav class="navbar" [class.scrolled]="isScrolled">
      <div class="nav-container">
        <!-- Logo/Marca -->
        <div class="nav-brand">
          <a href="#inicio" (click)="scrollToSection('inicio', $event)">
            <span class="brand-icon">🧟</span>
            <span class="brand-text">TLOU 2 COMPANION</span>
          </a>
        </div>

        <!-- Menú de navegación -->
        <div class="nav-menu" [class.active]="isMenuOpen">
          <ul class="nav-links">
            <li><a href="#inicio" (click)="scrollToSection('inicio', $event)">Inicio</a></li>
            <li><a href="#personajes" (click)="scrollToSection('personajes', $event)">Personajes</a></li>
            <li><a href="#timeline" (click)="scrollToSection('timeline', $event)">Historia</a></li>
            <li><a href="#galeria" (click)="scrollToSection('galeria', $event)">Galería</a></li>
            <li><a href="#videos" (click)="navegarAVideos($event)" class="nav-videos">Videos</a></li>
          </ul>
        </div>

        <!-- Sección de usuario -->
        <div class="user-section">
          <!-- Usuario no autenticado -->
          <div class="auth-actions" *ngIf="!estaAutenticado">
            <button 
              class="btn-login"
              (click)="abrirFormularioRegistro()"
            >
              <span class="login-icon">👤</span>
              <span class="login-text">Iniciar Sesión</span>
            </button>
          </div>

          <!-- Usuario autenticado -->
          <div class="user-info" *ngIf="estaAutenticado && usuario">
            <div class="user-avatar">
              <span class="avatar-icon">🎮</span>
            </div>
            <div class="user-details">
              <span class="user-name">{{ usuario.nombre }}</span>
              <span class="user-status">Superviviente</span>
            </div>
            <button 
              class="btn-logout"
              (click)="cerrarSesion()"
              title="Cerrar sesión"
            >
              <span>🚪</span>
            </button>
          </div>
        </div>

        <!-- Botón del menú móvil -->
        <button 
          class="nav-toggle"
          [class.active]="isMenuOpen"
          (click)="toggleMenu()"
          aria-label="Alternar menú de navegación"
        >
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
          <span class="hamburger-line"></span>
        </button>
      </div>
    </nav>

    <!-- Modal de registro -->
    <app-formulario-registro
      *ngIf="mostrarFormularioRegistro"
      (cerrar)="cerrarFormularioRegistro()"
      (registroCompletado)="onRegistroCompletado()"
    ></app-formulario-registro>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      padding: var(--espaciado-sm) 0;
      background: rgba(26, 26, 26, 0.95);
      backdrop-filter: blur(10px);
      transition: all var(--transicion-media);
      border-bottom: 1px solid transparent;
    }

    .navbar.scrolled {
      background: rgba(26, 26, 26, 0.98);
      border-bottom-color: var(--color-acento);
      box-shadow: var(--sombra-media);
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 var(--espaciado-sm);
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand a {
      display: flex;
      align-items: center;
      color: var(--color-texto-claro);
      text-decoration: none;
      font-family: var(--fuente-titulo);
      font-weight: 900;
      font-size: 1.5rem;
      transition: all var(--transicion-rapida);
    }

    .nav-brand a:hover {
      color: var(--color-acento);
      transform: scale(1.05);
    }

    .brand-icon {
      font-size: 2rem;
      margin-right: var(--espaciado-xs);
      animation: pulso 3s ease-in-out infinite;
    }

    .brand-text {
      letter-spacing: 2px;
    }

    .nav-menu {
      display: flex;
      align-items: center;
    }

    .nav-links {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: var(--espaciado-md);
    }

    .nav-links a {
      color: var(--color-texto-claro);
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      padding: var(--espaciado-xs) var(--espaciado-sm);
      border-radius: 4px;
      transition: all var(--transicion-rapida);
      position: relative;
    }

    .nav-links a::before {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      width: 0;
      height: 2px;
      background: var(--color-acento);
      transition: all var(--transicion-rapida);
      transform: translateX(-50%);
    }

    .nav-links a:hover {
      color: var(--color-acento);
      background: rgba(255, 107, 53, 0.1);
    }

    .nav-links a:hover::before {
      width: 100%;
    }

    .nav-videos {
      background: linear-gradient(135deg, var(--color-acento), #ff8c69) !important;
      color: var(--color-texto-claro) !important;
      border-radius: 20px !important;
      padding: var(--espaciado-xs) var(--espaciado-md) !important;
      font-weight: 700 !important;
      position: relative;
      overflow: hidden;
    }

    .nav-videos::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left var(--transicion-lenta);
    }

    .nav-videos:hover::before {
      left: 100%;
    }

    .nav-videos:hover {
      transform: translateY(-2px);
      box-shadow: var(--sombra-media);
      background: linear-gradient(135deg, #ff8c69, var(--color-acento)) !important;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: var(--espaciado-sm);
    }

    .btn-login {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-xs) var(--espaciado-md);
      background: var(--gradiente-apocaliptico);
      border: 2px solid var(--color-supervivencia);
      border-radius: 25px;
      color: var(--color-texto-claro);
      font-family: var(--fuente-titulo);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all var(--transicion-media);
    }

    .btn-login:hover {
      background: var(--color-supervivencia);
      transform: translateY(-2px);
      box-shadow: var(--sombra-media);
    }

    .login-icon {
      font-size: 1.2rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: var(--espaciado-sm);
      padding: var(--espaciado-xs) var(--espaciado-sm);
      background: rgba(74, 93, 35, 0.2);
      border: 1px solid var(--color-supervivencia);
      border-radius: 25px;
    }

    .user-avatar {
      width: 35px;
      height: 35px;
      background: var(--color-supervivencia);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-icon {
      font-size: 1.2rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .user-name {
      color: var(--color-texto-claro);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-status {
      color: var(--color-supervivencia);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .btn-logout {
      background: transparent;
      border: none;
      color: rgba(245, 245, 245, 0.7);
      cursor: pointer;
      padding: var(--espaciado-xs);
      border-radius: 4px;
      transition: all var(--transicion-rapida);
    }

    .btn-logout:hover {
      color: var(--color-peligro);
      background: rgba(178, 34, 34, 0.2);
    }

    .nav-toggle {
      display: none;
      flex-direction: column;
      justify-content: center;
      width: 30px;
      height: 30px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      gap: 4px;
    }

    .hamburger-line {
      width: 100%;
      height: 3px;
      background: var(--color-texto-claro);
      border-radius: 2px;
      transition: all var(--transicion-rapida);
      transform-origin: center;
    }

    .nav-toggle.active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translateY(7px);
      background: var(--color-acento);
    }

    .nav-toggle.active .hamburger-line:nth-child(2) {
      opacity: 0;
    }

    .nav-toggle.active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translateY(-7px);
      background: var(--color-acento);
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .nav-toggle {
        display: flex;
      }

      .nav-menu {
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        background: rgba(26, 26, 26, 0.98);
        backdrop-filter: blur(10px);
        padding: var(--espaciado-md);
        transform: translateY(-100vh);
        transition: transform var(--transicion-media);
        border-bottom: 1px solid var(--color-acento);
      }

      .nav-menu.active {
        transform: translateY(0);
      }

      .nav-links {
        flex-direction: column;
        gap: var(--espaciado-sm);
        text-align: center;
      }

      .nav-links a {
        display: block;
        padding: var(--espaciado-sm);
        border: 1px solid transparent;
        border-radius: 8px;
      }

      .nav-links a:hover {
        border-color: var(--color-acento);
        background: rgba(255, 107, 53, 0.1);
      }

      .nav-videos {
        border-radius: 8px !important;
      }

      .user-section {
        order: -1;
      }

      .user-details {
        display: none;
      }

      .user-info {
        padding: var(--espaciado-xs);
      }
    }

    @media (max-width: 480px) {
      .brand-text {
        display: none;
      }

      .navbar {
        padding: var(--espaciado-xs) 0;
      }

      .login-text {
        display: none;
      }

      .btn-login {
        padding: var(--espaciado-xs);
        border-radius: 50%;
        min-width: 40px;
        min-height: 40px;
      }
    }
  `]
})
export class NavegacionComponent implements OnInit, OnDestroy {
  isScrolled = false;
  isMenuOpen = false;
  mostrarFormularioRegistro = false;
  estaAutenticado = false;
  usuario: Usuario | null = null;

  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.checkScrollPosition();
    this.suscribirseAAuth();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Suscribirse a los cambios de autenticación
   */
  private suscribirseAAuth() {
    const authSub = this.authService.autenticado$.subscribe(
      autenticado => this.estaAutenticado = autenticado
    );

    const userSub = this.authService.usuario$.subscribe(
      usuario => this.usuario = usuario
    );

    this.subscriptions.push(authSub, userSub);
  }

  /**
   * Escucha eventos de scroll para cambiar la apariencia de la navbar
   */
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkScrollPosition();
  }

  /**
   * Escucha clics fuera del menú para cerrarlo en móviles
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.nav-menu') && !target.closest('.nav-toggle')) {
      this.isMenuOpen = false;
    }
  }

  /**
   * Verifica la posición del scroll para aplicar estilos
   */
  private checkScrollPosition() {
    this.isScrolled = window.scrollY > 50;
  }

  /**
   * Alterna la visibilidad del menú móvil
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  /**
   * Abre el formulario de registro
   */
  abrirFormularioRegistro() {
    this.mostrarFormularioRegistro = true;
    this.isMenuOpen = false;
    document.body.style.overflow = 'hidden';
  }

  /**
   * Cierra el formulario de registro
   */
  cerrarFormularioRegistro() {
    this.mostrarFormularioRegistro = false;
    document.body.style.overflow = 'auto';
  }

  /**
   * Maneja el evento de registro completado
   */
  onRegistroCompletado() {
    // El formulario ya maneja la redirección automática
    this.cerrarFormularioRegistro();
  }

  /**
   * Cierra la sesión del usuario
   */
  cerrarSesion() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.authService.cerrarSesion();
    }
  }

  /**
   * Navega a la sección de videos
   */
  navegarAVideos(event: Event) {
    event.preventDefault();
    this.isMenuOpen = false;
    
    // Ocultar todas las secciones principales
    const secciones = [
      '.hero-section',
      '.personajes-section', 
      '.timeline-section',
      '.galeria-section'
    ];

    secciones.forEach(selector => {
      const elemento = document.querySelector(selector) as HTMLElement;
      if (elemento) {
        elemento.style.display = 'none';
      }
    });

    // Mostrar la sección de videos
    const seccionVideos = document.querySelector('app-videos') as HTMLElement;
    if (seccionVideos) {
      seccionVideos.style.display = 'block';
    }

    // Scroll al inicio
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  /**
   * Maneja la navegación suave a secciones específicas
   * @param sectionId - ID de la sección objetivo
   * @param event - Evento del click
   */
  scrollToSection(sectionId: string, event: Event) {
    event.preventDefault();
    
    // Cerrar menú móvil si está abierto
    this.isMenuOpen = false;

    // Mostrar todas las secciones principales y ocultar videos
    const secciones = [
      '.hero-section',
      '.personajes-section', 
      '.timeline-section',
      '.galeria-section'
    ];

    secciones.forEach(selector => {
      const elemento = document.querySelector(selector) as HTMLElement;
      if (elemento) {
        elemento.style.display = 'block';
      }
    });

    // Ocultar la sección de videos
    const seccionVideos = document.querySelector('app-videos') as HTMLElement;
    if (seccionVideos) {
      seccionVideos.style.display = 'none';
    }

    // Mapeo de IDs de sección a selectores
    const sectionMap: { [key: string]: string } = {
      'inicio': '.hero-section',
      'personajes': '.personajes-section',
      'timeline': '.timeline-section',
      'galeria': '.galeria-section'
    };

    const targetSelector = sectionMap[sectionId];
    if (targetSelector) {
      // Pequeño delay para asegurar que las secciones estén visibles
      setTimeout(() => {
        const targetElement = document.querySelector(targetSelector);
        if (targetElement) {
          const navbarHeight = 80; // Altura aproximada de la navbar
          const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }
}