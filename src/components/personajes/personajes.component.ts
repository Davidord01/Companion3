/**
 * Componente de Personajes
 * Muestra la galería de personajes principales con información detallada
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonajesService, Personaje } from '../../services/personajes.service';

@Component({
  selector: 'app-personajes',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="personajes-section">
      <div class="container">
        <!-- Encabezado de la sección -->
        <div class="section-header">
          <h2 class="section-title fade-in-up">Personajes Principales</h2>
          <p class="section-description fade-in-up">
            Conoce a los supervivientes que definen la historia de The Last of Us Temporada 2. 
            Cada uno con sus propias motivaciones, secretos y luchas en este mundo post-apocalíptico.
          </p>
        </div>

        <!-- Filtros de personajes -->
        <div class="character-filters fade-in-up">
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'todos'"
            (click)="filtrarPersonajes('todos')"
          >
            Todos
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'vivo'"
            (click)="filtrarPersonajes('vivo')"
          >
            Supervivientes
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'muerto'"
            (click)="filtrarPersonajes('muerto')"
          >
            Caídos
          </button>
        </div>

        <!-- Grid de personajes -->
        <div class="characters-grid">
          <div 
            class="character-card fade-in-up"
            *ngFor="let personaje of personajesFiltrados; let i = index"
            [style.animation-delay]="i * 0.1 + 's'"
            (click)="seleccionarPersonaje(personaje)"
          >
            <!-- Imagen del personaje -->
            <div class="character-image">
              <img 
                [src]="personaje.imagen" 
                [alt]="'Retrato de ' + personaje.nombre"
                loading="lazy"
              >
              <div class="character-overlay">
                <div class="character-status" [attr.data-status]="personaje.estado">
                  {{ getEstadoTexto(personaje.estado) }}
                </div>
              </div>
            </div>

            <!-- Información del personaje -->
            <div class="character-info">
              <h3 class="character-name">{{ personaje.nombre }}</h3>
              <p class="character-description">{{ personaje.descripcion }}</p>
              
              <div class="character-details">
                <div class="detail-item">
                  <span class="detail-label">Edad:</span>
                  <span class="detail-value">{{ personaje.edad }} años</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Ubicación:</span>
                  <span class="detail-value">{{ personaje.localizacion }}</span>
                </div>
              </div>

              <!-- Habilidades destacadas -->
              <div class="character-skills">
                <span 
                  class="skill-tag"
                  *ngFor="let habilidad of personaje.habilidades.slice(0, 3)"
                >
                  {{ habilidad }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal de personaje seleccionado -->
        <div 
          class="character-modal"
          [class.active]="personajeSeleccionado"
          (click)="cerrarModal($event)"
        >
          <div class="modal-content" *ngIf="personajeSeleccionado">
            <button class="modal-close" (click)="cerrarModal()">×</button>
            
            <div class="modal-header">
              <img 
                [src]="personajeSeleccionado.imagen" 
                [alt]="'Retrato detallado de ' + personajeSeleccionado.nombre"
                class="modal-image"
              >
              <div class="modal-info">
                <h3 class="modal-title">{{ personajeSeleccionado.nombre }}</h3>
                <p class="modal-subtitle">{{ personajeSeleccionado.descripcion }}</p>
                <div class="modal-stats">
                  <div class="stat">
                    <span class="stat-label">Edad</span>
                    <span class="stat-value">{{ personajeSeleccionado.edad }} años</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Ubicación</span>
                    <span class="stat-value">{{ personajeSeleccionado.localizacion }}</span>
                  </div>
                  <div class="stat">
                    <span class="stat-label">Estado</span>
                    <span class="stat-value" [attr.data-status]="personajeSeleccionado.estado">
                      {{ getEstadoTexto(personajeSeleccionado.estado) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-body">
              <div class="modal-section">
                <h4>Historia</h4>
                <p>{{ personajeSeleccionado.historia }}</p>
              </div>

              <div class="modal-section">
                <h4>Habilidades</h4>
                <div class="skills-list">
                  <span 
                    class="skill-tag large"
                    *ngFor="let habilidad of personajeSeleccionado.habilidades"
                  >
                    {{ habilidad }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .personajes-section {
      padding: var(--espaciado-xl) 0;
      background: linear-gradient(135deg, var(--color-fondo-oscuro) 0%, var(--color-fondo-medio) 100%);
      position: relative;
    }

    .personajes-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--color-acento), transparent);
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--espaciado-lg);
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .section-title {
      color: var(--color-texto-claro);
      margin-bottom: var(--espaciado-sm);
    }

    .section-description {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.7;
    }

    .character-filters {
      display: flex;
      justify-content: center;
      gap: var(--espaciado-sm);
      margin-bottom: var(--espaciado-lg);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: var(--espaciado-xs) var(--espaciado-md);
      background: transparent;
      border: 2px solid var(--color-acento);
      color: var(--color-acento);
      border-radius: 25px;
      font-family: var(--fuente-titulo);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all var(--transicion-media);
    }

    .filter-btn:hover,
    .filter-btn.active {
      background: var(--color-acento);
      color: var(--color-texto-claro);
      transform: translateY(-2px);
      box-shadow: var(--sombra-media);
    }

    .characters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: var(--espaciado-md);
      margin-top: var(--espaciado-lg);
    }

    .character-card {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      overflow: hidden;
      transition: all var(--transicion-media);
      cursor: pointer;
      border: 1px solid transparent;
    }

    .character-card:hover {
      transform: translateY(-8px);
      box-shadow: var(--sombra-fuerte);
      border-color: var(--color-acento);
    }

    .character-image {
      position: relative;
      height: 250px;
      overflow: hidden;
    }

    .character-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transicion-lenta);
    }

    .character-card:hover .character-image img {
      transform: scale(1.1);
    }

    .character-overlay {
      position: absolute;
      top: 0;
      right: 0;
      padding: var(--espaciado-sm);
    }

    .character-status {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      border-radius: 15px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      backdrop-filter: blur(5px);
    }

    .character-status[data-status="vivo"] {
      background: rgba(74, 93, 35, 0.9);
      color: #90EE90;
      border: 1px solid #90EE90;
    }

    .character-status[data-status="muerto"] {
      background: rgba(178, 34, 34, 0.9);
      color: #FFB6C1;
      border: 1px solid #FFB6C1;
    }

    .character-status[data-status="desconocido"] {
      background: rgba(139, 69, 19, 0.9);
      color: #DEB887;
      border: 1px solid #DEB887;
    }

    .character-info {
      padding: var(--espaciado-md);
    }

    .character-name {
      color: var(--color-texto-claro);
      font-size: 1.4rem;
      margin-bottom: var(--espaciado-xs);
    }

    .character-description {
      color: rgba(245, 245, 245, 0.8);
      margin-bottom: var(--espaciado-sm);
      line-height: 1.5;
    }

    .character-details {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
      margin-bottom: var(--espaciado-sm);
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-label {
      color: var(--color-acento);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .detail-value {
      color: rgba(245, 245, 245, 0.9);
      font-size: 0.9rem;
    }

    .character-skills {
      display: flex;
      flex-wrap: wrap;
      gap: var(--espaciado-xs);
    }

    .skill-tag {
      padding: 4px 8px;
      background: rgba(255, 107, 53, 0.2);
      color: var(--color-acento);
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      border: 1px solid var(--color-acento);
    }

    .skill-tag.large {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      font-size: 0.9rem;
    }

    /* Modal de personaje */
    .character-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transicion-media);
      padding: var(--espaciado-md);
    }

    .character-modal.active {
      opacity: 1;
      visibility: visible;
    }

    .modal-content {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      max-width: 600px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      position: relative;
      border: 1px solid var(--color-acento);
      animation: modalSlideIn 0.3s ease-out;
    }

    .modal-close {
      position: absolute;
      top: var(--espaciado-sm);
      right: var(--espaciado-sm);
      background: var(--color-acento);
      color: var(--color-texto-claro);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 1.5rem;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      z-index: 10;
    }

    .modal-close:hover {
      background: #ff8c69;
      transform: scale(1.1);
    }

    .modal-header {
      display: flex;
      gap: var(--espaciado-md);
      padding: var(--espaciado-md);
      align-items: flex-start;
    }

    .modal-image {
      width: 120px;
      height: 120px;
      object-fit: cover;
      border-radius: 8px;
      border: 2px solid var(--color-acento);
    }

    .modal-info {
      flex: 1;
    }

    .modal-title {
      color: var(--color-texto-claro);
      font-size: 1.6rem;
      margin-bottom: var(--espaciado-xs);
    }

    .modal-subtitle {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
      font-weight: 500;
    }

    .modal-stats {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--espaciado-xs);
      background: rgba(255, 107, 53, 0.1);
      border-radius: 4px;
    }

    .stat-label {
      color: rgba(245, 245, 245, 0.8);
      font-size: 0.9rem;
    }

    .stat-value {
      font-weight: 600;
      color: var(--color-texto-claro);
    }

    .stat-value[data-status="vivo"] {
      color: #90EE90;
    }

    .stat-value[data-status="muerto"] {
      color: #FFB6C1;
    }

    .modal-body {
      padding: 0 var(--espaciado-md) var(--espaciado-md);
    }

    .modal-section {
      margin-bottom: var(--espaciado-md);
    }

    .modal-section h4 {
      color: var(--color-acento);
      font-family: var(--fuente-titulo);
      font-size: 1.2rem;
      margin-bottom: var(--espaciado-sm);
      border-bottom: 1px solid var(--color-acento);
      padding-bottom: var(--espaciado-xs);
    }

    .modal-section p {
      color: rgba(245, 245, 245, 0.9);
      line-height: 1.6;
    }

    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: var(--espaciado-xs);
    }

    @keyframes modalSlideIn {
      from {
        transform: translateY(-50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .characters-grid {
        grid-template-columns: 1fr;
        gap: var(--espaciado-sm);
      }

      .character-filters {
        gap: var(--espaciado-xs);
      }

      .filter-btn {
        padding: var(--espaciado-xs) var(--espaciado-sm);
        font-size: 0.9rem;
      }

      .modal-header {
        flex-direction: column;
        text-align: center;
      }

      .modal-image {
        align-self: center;
      }

      .modal-stats {
        align-items: stretch;
      }
    }
  `]
})
export class PersonajesComponent implements OnInit {
  personajes: Personaje[] = [];
  personajesFiltrados: Personaje[] = [];
  personajeSeleccionado: Personaje | null = null;
  filtroActivo: string = 'todos';

  constructor(private personajesService: PersonajesService) {}

  ngOnInit() {
    this.cargarPersonajes();
  }

  /**
   * Carga la lista de personajes desde el servicio
   */
  private cargarPersonajes() {
    this.personajesService.obtenerPersonajes().subscribe(personajes => {
      this.personajes = personajes;
      this.personajesFiltrados = personajes;
    });
  }

  /**
   * Filtra personajes por estado
   * @param filtro - Tipo de filtro a aplicar
   */
  filtrarPersonajes(filtro: string) {
    this.filtroActivo = filtro;
    
    if (filtro === 'todos') {
      this.personajesFiltrados = this.personajes;
    } else {
      this.personajesFiltrados = this.personajes.filter(
        personaje => personaje.estado === filtro
      );
    }
  }

  /**
   * Selecciona un personaje para mostrar en el modal
   * @param personaje - Personaje a seleccionar
   */
  seleccionarPersonaje(personaje: Personaje) {
    this.personajeSeleccionado = personaje;
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }

  /**
   * Cierra el modal de personaje
   * @param event - Evento opcional del click
   */
  cerrarModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return; // Solo cerrar si se hace click en el overlay
    }
    
    this.personajeSeleccionado = null;
    document.body.style.overflow = 'auto'; // Restaurar scroll del body
  }

  /**
   * Convierte el estado del personaje a texto legible
   * @param estado - Estado del personaje
   * @returns Texto descriptivo del estado
   */
  getEstadoTexto(estado: string): string {
    const estados: { [key: string]: string } = {
      'vivo': 'Superviviente',
      'muerto': 'Caído',
      'desconocido': 'Desconocido'
    };
    return estados[estado] || estado;
  }
}