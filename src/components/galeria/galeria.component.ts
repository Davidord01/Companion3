/**
 * Componente Galería
 * Muestra una galería de imágenes del mundo de The Last of Us 2
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Interface para definir la estructura de una imagen de la galería
 */
interface ImagenGaleria {
  id: number;
  url: string;
  titulo: string;
  descripcion: string;
  categoria: 'paisajes' | 'personajes' | 'accion' | 'atmosfera';
  alt: string;
}

@Component({
  selector: 'app-galeria',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="galeria-section">
      <div class="container">
        <!-- Encabezado de la sección -->
        <div class="section-header">
          <h2 class="section-title fade-in-up">Galería Visual</h2>
          <p class="section-description fade-in-up">
            Sumérgete en el mundo post-apocalíptico de The Last of Us 2. 
            Explora los paisajes devastados, conoce a los personajes y vive la intensidad de cada momento.
          </p>
        </div>

        <!-- Filtros de galería -->
        <div class="gallery-filters fade-in-up">
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'todas'"
            (click)="filtrarImagenes('todas')"
          >
            Todas
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'paisajes'"
            (click)="filtrarImagenes('paisajes')"
          >
            Paisajes
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'personajes'"
            (click)="filtrarImagenes('personajes')"
          >
            Personajes
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'accion'"
            (click)="filtrarImagenes('accion')"
          >
            Acción
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroActivo === 'atmosfera'"
            (click)="filtrarImagenes('atmosfera')"
          >
            Atmósfera
          </button>
        </div>

        <!-- Grid de galería -->
        <div class="gallery-grid">
          <div 
            class="gallery-item fade-in-up"
            *ngFor="let imagen of imagenesFiltradas; let i = index"
            [style.animation-delay]="i * 0.1 + 's'"
            (click)="abrirLightbox(imagen)"
          >
            <div class="image-container">
              <img 
                [src]="imagen.url" 
                [alt]="imagen.alt"
                loading="lazy"
                class="gallery-image"
              >
              <div class="image-overlay">
                <div class="overlay-content">
                  <h3 class="image-title">{{ imagen.titulo }}</h3>
                  <p class="image-description">{{ imagen.descripcion }}</p>
                  <span class="image-category" [attr.data-categoria]="imagen.categoria">
                    {{ getCategoriaTexto(imagen.categoria) }}
                  </span>
                </div>
                <div class="overlay-icon">
                  <span class="zoom-icon">🔍</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay imágenes -->
        <div class="no-images" *ngIf="imagenesFiltradas.length === 0">
          <h3>No hay imágenes para mostrar</h3>
          <p>Prueba con un filtro diferente para ver más contenido visual.</p>
        </div>
      </div>

      <!-- Lightbox modal -->
      <div 
        class="lightbox-modal"
        [class.active]="imagenSeleccionada"
        (click)="cerrarLightbox($event)"
      >
        <div class="lightbox-content" *ngIf="imagenSeleccionada">
          <!-- Botones de navegación -->
          <button 
            class="lightbox-nav prev"
            (click)="navegarImagen(-1)"
            [disabled]="indiceImagenActual === 0"
          >
            ‹
          </button>
          
          <button 
            class="lightbox-nav next"
            (click)="navegarImagen(1)"
            [disabled]="indiceImagenActual === imagenesFiltradas.length - 1"
          >
            ›
          </button>

          <!-- Botón de cerrar -->
          <button class="lightbox-close" (click)="cerrarLightbox()">×</button>

          <!-- Imagen principal -->
          <div class="lightbox-image-container">
            <img 
              [src]="imagenSeleccionada.url" 
              [alt]="imagenSeleccionada.alt"
              class="lightbox-image"
            >
          </div>

          <!-- Información de la imagen -->
          <div class="lightbox-info">
            <h3 class="lightbox-title">{{ imagenSeleccionada.titulo }}</h3>
            <p class="lightbox-description">{{ imagenSeleccionada.descripcion }}</p>
            <div class="lightbox-meta">
              <span 
                class="lightbox-category" 
                [attr.data-categoria]="imagenSeleccionada.categoria"
              >
                {{ getCategoriaTexto(imagenSeleccionada.categoria) }}
              </span>
              <span class="lightbox-counter">
                {{ indiceImagenActual + 1 }} de {{ imagenesFiltradas.length }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .galeria-section {
      padding: var(--espaciado-xl) 0;
      background: linear-gradient(135deg, var(--color-fondo-medio) 0%, var(--color-fondo-oscuro) 100%);
      position: relative;
    }

    .galeria-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, var(--color-supervivencia), transparent);
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--espaciado-lg);
      max-width: 700px;
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

    .gallery-filters {
      display: flex;
      justify-content: center;
      gap: var(--espaciado-sm);
      margin-bottom: var(--espaciado-lg);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: var(--espaciado-xs) var(--espaciado-md);
      background: transparent;
      border: 2px solid var(--color-secundario);
      color: var(--color-secundario);
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
      background: var(--color-secundario);
      color: var(--color-texto-claro);
      transform: translateY(-2px);
      box-shadow: var(--sombra-media);
    }

    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--espaciado-md);
      margin-top: var(--espaciado-lg);
    }

    .gallery-item {
      cursor: pointer;
      border-radius: 12px;
      overflow: hidden;
      transition: all var(--transicion-media);
      background: var(--color-fondo-oscuro);
    }

    .gallery-item:hover {
      transform: translateY(-8px);
      box-shadow: var(--sombra-fuerte);
    }

    .image-container {
      position: relative;
      height: 250px;
      overflow: hidden;
    }

    .gallery-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transicion-lenta);
    }

    .gallery-item:hover .gallery-image {
      transform: scale(1.1);
    }

    .image-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.9), transparent 50%);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: var(--espaciado-md);
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .gallery-item:hover .image-overlay {
      opacity: 1;
    }

    .overlay-content {
      color: var(--color-texto-claro);
    }

    .image-title {
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: var(--espaciado-xs);
      color: var(--color-texto-claro);
    }

    .image-description {
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: var(--espaciado-xs);
      color: rgba(245, 245, 245, 0.9);
    }

    .image-category {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .image-category[data-categoria="paisajes"] {
      background: rgba(74, 93, 35, 0.8);
      color: #90EE90;
    }

    .image-category[data-categoria="personajes"] {
      background: rgba(255, 107, 53, 0.8);
      color: var(--color-texto-claro);
    }

    .image-category[data-categoria="accion"] {
      background: rgba(178, 34, 34, 0.8);
      color: #FFB6C1;
    }

    .image-category[data-categoria="atmosfera"] {
      background: rgba(139, 69, 19, 0.8);
      color: #DEB887;
    }

    .overlay-icon {
      position: absolute;
      top: var(--espaciado-sm);
      right: var(--espaciado-sm);
    }

    .zoom-icon {
      display: inline-block;
      width: 40px;
      height: 40px;
      background: rgba(255, 107, 53, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      transform: scale(0);
      transition: transform var(--transicion-media);
    }

    .gallery-item:hover .zoom-icon {
      transform: scale(1);
    }

    .no-images {
      text-align: center;
      padding: var(--espaciado-xl);
      color: rgba(245, 245, 245, 0.6);
    }

    .no-images h3 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
    }

    /* Lightbox modal */
    .lightbox-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(5px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all var(--transicion-media);
    }

    .lightbox-modal.active {
      opacity: 1;
      visibility: visible;
    }

    .lightbox-content {
      position: relative;
      max-width: 90vw;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      animation: lightboxSlideIn 0.3s ease-out;
    }

    .lightbox-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      background: rgba(255, 107, 53, 0.9);
      border: none;
      border-radius: 50%;
      color: var(--color-texto-claro);
      font-size: 1.5rem;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      z-index: 10;
    }

    .lightbox-nav:hover:not(:disabled) {
      background: var(--color-acento);
      transform: translateY(-50%) scale(1.1);
    }

    .lightbox-nav:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .lightbox-nav.prev {
      left: -70px;
    }

    .lightbox-nav.next {
      right: -70px;
    }

    .lightbox-close {
      position: absolute;
      top: -50px;
      right: 0;
      width: 40px;
      height: 40px;
      background: var(--color-peligro);
      border: none;
      border-radius: 50%;
      color: var(--color-texto-claro);
      font-size: 1.5rem;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      z-index: 10;
    }

    .lightbox-close:hover {
      background: #dc143c;
      transform: scale(1.1);
    }

    .lightbox-image-container {
      max-height: 70vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .lightbox-image {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: var(--sombra-fuerte);
    }

    .lightbox-info {
      background: var(--color-fondo-medio);
      padding: var(--espaciado-md);
      border-radius: 0 0 8px 8px;
      border-top: 2px solid var(--color-acento);
    }

    .lightbox-title {
      color: var(--color-texto-claro);
      font-size: 1.4rem;
      margin-bottom: var(--espaciado-xs);
    }

    .lightbox-description {
      color: rgba(245, 245, 245, 0.9);
      line-height: 1.5;
      margin-bottom: var(--espaciado-sm);
    }

    .lightbox-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--espaciado-sm);
    }

    .lightbox-category {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .lightbox-category[data-categoria="paisajes"] {
      background: rgba(74, 93, 35, 0.8);
      color: #90EE90;
    }

    .lightbox-category[data-categoria="personajes"] {
      background: rgba(255, 107, 53, 0.8);
      color: var(--color-texto-claro);
    }

    .lightbox-category[data-categoria="accion"] {
      background: rgba(178, 34, 34, 0.8);
      color: #FFB6C1;
    }

    .lightbox-category[data-categoria="atmosfera"] {
      background: rgba(139, 69, 19, 0.8);
      color: #DEB887;
    }

    .lightbox-counter {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.9rem;
      font-family: var(--fuente-titulo);
    }

    @keyframes lightboxSlideIn {
      from {
        transform: scale(0.8);
        opacity: 0;
      }
      to {
        transform: scale(1);
        opacity: 1;
      }
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .gallery-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: var(--espaciado-sm);
      }

      .gallery-filters {
        gap: var(--espaciado-xs);
      }

      .filter-btn {
        padding: var(--espaciado-xs) var(--espaciado-sm);
        font-size: 0.9rem;
      }

      .lightbox-nav.prev {
        left: 10px;
      }

      .lightbox-nav.next {
        right: 10px;
      }

      .lightbox-close {
        top: 10px;
        right: 10px;
      }

      .lightbox-content {
        max-width: 95vw;
        max-height: 95vh;
      }

      .lightbox-info {
        padding: var(--espaciado-sm);
      }

      .lightbox-meta {
        flex-direction: column;
        align-items: flex-start;
      }
    }

    @media (max-width: 480px) {
      .gallery-grid {
        grid-template-columns: 1fr;
      }

      .gallery-filters {
        flex-direction: column;
        align-items: center;
      }

      .filter-btn {
        width: 150px;
      }

      .lightbox-nav {
        width: 40px;
        height: 40px;
        font-size: 1.2rem;
      }
    }
  `]
})
export class GaleriaComponent implements OnInit {
  imagenes: ImagenGaleria[] = [];
  imagenesFiltradas: ImagenGaleria[] = [];
  imagenSeleccionada: ImagenGaleria | null = null;
  indiceImagenActual: number = 0;
  filtroActivo: string = 'todas';

  ngOnInit() {
    this.inicializarImagenes();
  }

  /**
   * Inicializa la galería con imágenes temáticas de TLOU2
   */
  private inicializarImagenes() {
    this.imagenes = [
      {
        id: 1,
        url: 'https://i.blogs.es/ea06ae/efjejguxoaacx0m/1366_2000.jpeg',
        titulo: 'Jackson en Invierno',
        descripcion: 'La comunidad de Jackson cubierta de nieve, un refugio seguro en un mundo peligroso.',
        categoria: 'paisajes',
        alt: 'Paisaje invernal de Jackson con nieve y casas'
      },
      {
        id: 2,
        url: 'https://e00-xlk-ue-marca.uecdn.es/uploads/2025/04/20/6805045e0cd23.jpeg',
        titulo: 'Ellie Williams',
        descripcion: 'La determinada protagonista en su búsqueda de venganza y redención.',
        categoria: 'personajes',
        alt: 'Retrato de Ellie Williams con expresión determinada'
      },
      {
        id: 3,
        url: 'https://sm.ign.com/ign_latam/game/t/the-last-o/the-last-of-us_9q5g.jpg',
        titulo: 'Camino hacia Seattle',
        descripcion: 'El peligroso viaje a través de territorios infectados hacia Seattle.',
        categoria: 'paisajes',
        alt: 'Carretera abandonada rodeada de vegetación salvaje'
      },
      {
        id: 4,
        url: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg',
        titulo: 'Enfrentamiento',
        descripcion: 'La tensión alcanza su punto máximo en los conflictos de Seattle.',
        categoria: 'accion',
        alt: 'Escena de tensión y conflicto en ambiente urbano'
      },
      {
        id: 5,
        url: 'https://www.publico.es/files/image_horizontal_mobile/uploads/2025/05/27/68358d84bc312.jpeg',
        titulo: 'Abby Anderson',
        descripcion: 'La compleja antagonista con sus propias motivaciones y dolor.',
        categoria: 'personajes',
        alt: 'Retrato de Abby Anderson con mirada intensa'
      },
      {
        id: 6,
        url: 'https://uploads.worldanvil.com/uploads/images/2b15c848c6f3e46aba209c5e36443d3a.jpg',
        titulo: 'Seattle Reclamada',
        descripcion: 'La naturaleza ha comenzado a reclamar la ciudad abandonada de Seattle.',
        categoria: 'paisajes',
        alt: 'Ciudad de Seattle con vegetación creciendo entre edificios'
      },
      {
        id: 7,
        url: 'https://ohoje.com/wp-content/uploads/2024/08/last-of-us-cordyceps-01-ht-jef-230201_1675268578936_hpMain_16x9_992.jpeg',
        titulo: 'Laboratorio del Hospital',
        descripcion: 'Los secretos del pasado que desencadenaron la tragedia presente.',
        categoria: 'atmosfera',
        alt: 'Interior de laboratorio médico abandonado'
      },
      {
        id: 8,
        url: 'https://criticalhits.com.br/wp-content/uploads/2025/04/1744610389268-1280x640.jpg',
        titulo: 'Dina Woodward',
        descripcion: 'La leal compañera de Ellie en su peligroso viaje.',
        categoria: 'personajes',
        alt: 'Retrato de Dina Woodward con arco'
      },
      {
        id: 9,
        url: 'https://sm.ign.com/ign_latam/screenshot/default/the-last-of-us-serie-serafitas_299v.jpg',
        titulo: 'Territorio Serafita',
        descripcion: 'Las tierras controladas por el misterioso culto de los Serafitas.',
        categoria: 'paisajes',
        alt: 'Bosque denso con símbolos religiosos tallados'
      },
      {
        id: 10,
        url: 'https://imgmedia.larepublica.pe/640x371/larepublica/original/2025/05/08/681d461ffa1eaf42e9090b97.webp',
        titulo: 'Confrontación Final',
        descripcion: 'El momento decisivo que definirá el destino de todos los personajes.',
        categoria: 'accion',
        alt: 'Escena dramática de confrontación entre personajes'
      },
      {
        id: 11,
        url: 'https://media.vandal.net/master/6-2020/202069204069_1.jpg',
        titulo: 'Granja en Wyoming',
        descripcion: 'Un intento de encontrar paz en un mundo que no la permite.',
        categoria: 'atmosfera',
        alt: 'Granja rústica en campo abierto de Wyoming'
      },
      {
        id: 12,
        url: 'https://cloudfront-eu-central-1.images.arcpublishing.com/diarioas/4OI26W4XTVN2VEWRENXWGFABYM.jpg',
        titulo: 'Lev',
        descripcion: 'El joven que desafía las tradiciones y encuentra su propio camino.',
        categoria: 'personajes',
        alt: 'Retrato de Lev con arco tradicional'
      }
    ];

    

    this.imagenesFiltradas = this.imagenes;
  }

  /**
   * Filtra imágenes por categoría
   * @param categoria - Categoría a filtrar
   */
  filtrarImagenes(categoria: string) {
    this.filtroActivo = categoria;
    
    if (categoria === 'todas') {
      this.imagenesFiltradas = this.imagenes;
    } else {
      this.imagenesFiltradas = this.imagenes.filter(
        imagen => imagen.categoria === categoria
      );
    }
  }

  /**
   * Abre el lightbox con la imagen seleccionada
   * @param imagen - Imagen a mostrar en el lightbox
   */
  abrirLightbox(imagen: ImagenGaleria) {
    this.imagenSeleccionada = imagen;
    this.indiceImagenActual = this.imagenesFiltradas.findIndex(img => img.id === imagen.id);
    document.body.style.overflow = 'hidden'; // Prevenir scroll del body
  }

  /**
   * Cierra el lightbox
   * @param event - Evento opcional del click
   */
  cerrarLightbox(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return; // Solo cerrar si se hace click en el overlay
    }
    
    this.imagenSeleccionada = null;
    document.body.style.overflow = 'auto'; // Restaurar scroll del body
  }

  /**
   * Navega entre imágenes en el lightbox
   * @param direccion - Dirección de navegación (-1 para anterior, 1 para siguiente)
   */
  navegarImagen(direccion: number) {
    const nuevoIndice = this.indiceImagenActual + direccion;
    
    if (nuevoIndice >= 0 && nuevoIndice < this.imagenesFiltradas.length) {
      this.indiceImagenActual = nuevoIndice;
      this.imagenSeleccionada = this.imagenesFiltradas[nuevoIndice];
    }
  }

  /**
   * Convierte la categoría a texto legible
   * @param categoria - Categoría de la imagen
   * @returns Texto descriptivo de la categoría
   */
  getCategoriaTexto(categoria: string): string {
    const categorias: { [key: string]: string } = {
      'paisajes': 'Paisajes',
      'personajes': 'Personajes',
      'accion': 'Acción',
      'atmosfera': 'Atmósfera'
    };
    return categorias[categoria] || categoria;
  }
}