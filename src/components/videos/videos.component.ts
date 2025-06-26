/**
 * Componente Videos
 * Página dedicada para la gestión y reproducción de videos
 */

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultimediaService, ArchivoMultimedia } from '../../services/multimedia.service';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="videos-section">
      <div class="container">
        <!-- Encabezado de la sección -->
        <div class="section-header">
          <h2 class="section-title fade-in-up">Biblioteca de Videos</h2>
          <p class="section-description fade-in-up">
            Explora la colección completa de videos de The Last of Us Temporada 2. 
            Desde trailers oficiales hasta gameplay exclusivo.
          </p>
        </div>

        <!-- Panel de subida de archivos -->
        <div class="upload-panel fade-in-up">
          <div class="upload-area" 
               [class.dragover]="isDragOver"
               (dragover)="onDragOver($event)"
               (dragleave)="onDragLeave($event)"
               (drop)="onDrop($event)"
               (click)="triggerFileInput()">
            <input 
              #fileInput
              type="file"
              accept=".mp4,.mov,.webm"
              multiple
              (change)="onFileSelected($event)"
              style="display: none;"
            >
            
            <div class="upload-content">
              <div class="upload-icon">📹</div>
              <h3>Subir Videos</h3>
              <p>Arrastra archivos aquí o haz clic para seleccionar</p>
              <small>Formatos soportados: MP4, MOV, WEBM</small>
            </div>
          </div>

          <!-- Barra de progreso de subida -->
          <div class="upload-progress" *ngIf="subiendoArchivo">
            <div class="progress-info">
              <span>Subiendo: {{ archivoActualSubida?.name }}</span>
              <span>{{ progresoSubida }}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="progresoSubida"></div>
            </div>
          </div>
        </div>

        <!-- Reproductor principal -->
        <div class="reproductor-principal" *ngIf="videoSeleccionado">
          <div class="video-container">
            <video 
              #videoElement
              [src]="videoSeleccionado.url"
              controls
              preload="metadata"
              class="video-player"
              (loadedmetadata)="onVideoLoaded()"
              (timeupdate)="onTimeUpdate()"
            >
              Tu navegador no soporta la reproducción de video.
            </video>
            
            <div class="video-overlay" *ngIf="!videoReproduciendo">
              <button class="play-overlay" (click)="reproducirVideo()">
                <span class="play-icon">▶️</span>
              </button>
            </div>
          </div>

          <div class="video-info">
            <h3 class="video-title">{{ videoSeleccionado.nombre }}</h3>
            <p class="video-description" *ngIf="videoSeleccionado.descripcion">
              {{ videoSeleccionado.descripcion }}
            </p>
            <div class="video-meta">
              <span class="meta-item">
                <strong>Duración:</strong> {{ formatearTiempo(videoSeleccionado.duracion || 0) }}
              </span>
              <span class="meta-item">
                <strong>Tamaño:</strong> {{ formatearTamano(videoSeleccionado.tamano) }}
              </span>
              <span class="meta-item">
                <strong>Subido:</strong> {{ videoSeleccionado.fechaSubida | date:'dd/MM/yyyy' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Galería de videos -->
        <div class="videos-grid">
          <div 
            class="video-card fade-in-up"
            *ngFor="let video of videos; let i = index"
            [style.animation-delay]="i * 0.1 + 's'"
            [class.active]="videoSeleccionado?.id === video.id"
            (click)="seleccionarVideo(video)"
          >
            <!-- Thumbnail del video -->
            <div class="video-thumbnail">
              <img 
                [src]="video.thumbnail || 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg'" 
                [alt]="'Thumbnail de ' + video.nombre"
                loading="lazy"
              >
              <div class="thumbnail-overlay">
                <div class="play-button">
                  <span>▶️</span>
                </div>
                <div class="video-duration">
                  {{ formatearTiempo(video.duracion || 0) }}
                </div>
              </div>
            </div>

            <!-- Información del video -->
            <div class="video-card-info">
              <h4 class="video-card-title">{{ video.nombre }}</h4>
              <p class="video-card-description">
                {{ video.descripcion || 'Sin descripción disponible' }}
              </p>
              <div class="video-card-meta">
                <span class="upload-date">{{ video.fechaSubida | date:'dd/MM/yyyy' }}</span>
                <span class="file-size">{{ formatearTamano(video.tamano) }}</span>
              </div>
            </div>

            <!-- Acciones del video -->
            <div class="video-actions">
              <button 
                class="action-btn play-btn"
                (click)="seleccionarVideo(video); $event.stopPropagation()"
                title="Reproducir"
              >
                ▶️
              </button>
              <button 
                class="action-btn delete-btn"
                (click)="eliminarVideo(video.id); $event.stopPropagation()"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Mensaje cuando no hay videos -->
        <div class="no-videos" *ngIf="videos.length === 0">
          <div class="empty-state">
            <div class="empty-icon">📹</div>
            <h3>No hay videos disponibles</h3>
            <p>Sube tu primer video para comenzar a construir tu biblioteca multimedia.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .videos-section {
      min-height: 100vh;
      padding: calc(80px + var(--espaciado-md)) 0 var(--espaciado-xl);
      background: linear-gradient(135deg, var(--color-fondo-oscuro) 0%, var(--color-fondo-medio) 100%);
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

    .upload-panel {
      margin-bottom: var(--espaciado-lg);
    }

    .upload-area {
      border: 2px dashed var(--color-acento);
      border-radius: 12px;
      padding: var(--espaciado-lg);
      text-align: center;
      cursor: pointer;
      transition: all var(--transicion-media);
      background: rgba(255, 107, 53, 0.05);
    }

    .upload-area:hover,
    .upload-area.dragover {
      border-color: var(--color-supervivencia);
      background: rgba(74, 93, 35, 0.1);
      transform: translateY(-2px);
    }

    .upload-content {
      color: var(--color-texto-claro);
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: var(--espaciado-sm);
    }

    .upload-content h3 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-xs);
    }

    .upload-content p {
      margin-bottom: var(--espaciado-xs);
    }

    .upload-content small {
      color: rgba(245, 245, 245, 0.6);
    }

    .upload-progress {
      margin-top: var(--espaciado-md);
      padding: var(--espaciado-sm);
      background: var(--color-fondo-medio);
      border-radius: 8px;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--espaciado-xs);
      color: var(--color-texto-claro);
      font-size: 0.9rem;
    }

    .progress-bar {
      height: 6px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-acento), var(--color-supervivencia));
      transition: width var(--transicion-rapida);
    }

    .reproductor-principal {
      margin-bottom: var(--espaciado-lg);
      background: var(--color-fondo-medio);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--color-acento);
    }

    .video-container {
      position: relative;
      width: 100%;
      max-height: 500px;
    }

    .video-player {
      width: 100%;
      height: auto;
      max-height: 500px;
      display: block;
    }

    .video-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.3);
      cursor: pointer;
    }

    .play-overlay {
      width: 80px;
      height: 80px;
      background: rgba(255, 107, 53, 0.9);
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transicion-media);
    }

    .play-overlay:hover {
      background: var(--color-acento);
      transform: scale(1.1);
    }

    .play-icon {
      font-size: 2rem;
      margin-left: 4px;
    }

    .video-info {
      padding: var(--espaciado-md);
    }

    .video-title {
      color: var(--color-texto-claro);
      font-size: 1.4rem;
      margin-bottom: var(--espaciado-sm);
    }

    .video-description {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.6;
      margin-bottom: var(--espaciado-sm);
    }

    .video-meta {
      display: flex;
      gap: var(--espaciado-md);
      flex-wrap: wrap;
    }

    .meta-item {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.9rem;
    }

    .meta-item strong {
      color: var(--color-acento);
    }

    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--espaciado-md);
    }

    .video-card {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      overflow: hidden;
      transition: all var(--transicion-media);
      cursor: pointer;
      border: 2px solid transparent;
      position: relative;
    }

    .video-card:hover,
    .video-card.active {
      transform: translateY(-5px);
      box-shadow: var(--sombra-fuerte);
      border-color: var(--color-acento);
    }

    .video-thumbnail {
      position: relative;
      height: 180px;
      overflow: hidden;
    }

    .video-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transicion-lenta);
    }

    .video-card:hover .video-thumbnail img {
      transform: scale(1.1);
    }

    .thumbnail-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 50%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .video-card:hover .thumbnail-overlay {
      opacity: 1;
    }

    .play-button {
      width: 50px;
      height: 50px;
      background: rgba(255, 107, 53, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .video-duration {
      position: absolute;
      bottom: var(--espaciado-xs);
      right: var(--espaciado-xs);
      background: rgba(0, 0, 0, 0.8);
      color: var(--color-texto-claro);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-family: var(--fuente-titulo);
    }

    .video-card-info {
      padding: var(--espaciado-md);
    }

    .video-card-title {
      color: var(--color-texto-claro);
      font-size: 1.1rem;
      margin-bottom: var(--espaciado-xs);
      line-height: 1.3;
    }

    .video-card-description {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: var(--espaciado-sm);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: rgba(245, 245, 245, 0.6);
    }

    .video-actions {
      position: absolute;
      top: var(--espaciado-xs);
      right: var(--espaciado-xs);
      display: flex;
      gap: var(--espaciado-xs);
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .video-card:hover .video-actions {
      opacity: 1;
    }

    .action-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 0.9rem;
    }

    .play-btn {
      background: rgba(255, 107, 53, 0.9);
    }

    .delete-btn {
      background: rgba(178, 34, 34, 0.9);
    }

    .action-btn:hover {
      transform: scale(1.1);
    }

    .no-videos {
      text-align: center;
      padding: var(--espaciado-xl);
    }

    .empty-state {
      color: rgba(245, 245, 245, 0.6);
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--espaciado-md);
    }

    .empty-state h3 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .videos-grid {
        grid-template-columns: 1fr;
      }

      .video-meta {
        flex-direction: column;
        gap: var(--espaciado-xs);
        align-items: flex-start;
      }

      .upload-area {
        padding: var(--espaciado-md);
      }

      .upload-icon {
        font-size: 2rem;
      }
    }
  `]
})
export class VideosComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  videos: ArchivoMultimedia[] = [];
  videoSeleccionado: ArchivoMultimedia | null = null;
  videoReproduciendo = false;
  
  // Estados de subida
  isDragOver = false;
  subiendoArchivo = false;
  progresoSubida = 0;
  archivoActualSubida: File | null = null;

  constructor(private multimediaService: MultimediaService) {}

  ngOnInit() {
    this.cargarVideos();
  }

  /**
   * Carga la lista de videos
   */
  private cargarVideos() {
    this.multimediaService.obtenerArchivosPorTipo('video').subscribe(videos => {
      this.videos = videos;
      if (videos.length > 0 && !this.videoSeleccionado) {
        this.videoSeleccionado = videos[0];
      }
    });
  }

  /**
   * Maneja el evento de arrastrar sobre el área de subida
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  /**
   * Maneja el evento de salir del área de arrastre
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  /**
   * Maneja el evento de soltar archivos
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files) {
      this.procesarArchivos(Array.from(files));
    }
  }

  /**
   * Activa el input de archivos
   */
  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  /**
   * Maneja la selección de archivos
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.procesarArchivos(Array.from(input.files));
    }
  }

  /**
   * Procesa los archivos seleccionados
   */
  private procesarArchivos(files: File[]) {
    files.forEach(file => {
      if (this.multimediaService.validarFormato(file.name, 'video')) {
        this.subirArchivo(file);
      } else {
        alert(`Formato no soportado: ${file.name}`);
      }
    });
  }

  /**
   * Sube un archivo al servidor
   */
  private subirArchivo(file: File) {
    this.subiendoArchivo = true;
    this.archivoActualSubida = file;
    this.progresoSubida = 0;

    this.multimediaService.subirArchivo(file, `Video subido: ${file.name}`).subscribe({
      next: (resultado) => {
        this.progresoSubida = resultado.progreso;
        
        if (resultado.completado && resultado.archivo) {
          this.videos.unshift(resultado.archivo);
          if (!this.videoSeleccionado) {
            this.videoSeleccionado = resultado.archivo;
          }
          this.subiendoArchivo = false;
          this.archivoActualSubida = null;
        }
      },
      error: (error) => {
        console.error('Error al subir archivo:', error);
        alert('Error al subir el archivo: ' + error);
        this.subiendoArchivo = false;
        this.archivoActualSubida = null;
      }
    });
  }

  /**
   * Selecciona un video para reproducir
   */
  seleccionarVideo(video: ArchivoMultimedia) {
    this.videoSeleccionado = video;
    this.videoReproduciendo = false;
  }

  /**
   * Reproduce el video seleccionado
   */
  reproducirVideo() {
    if (this.videoElement) {
      this.videoElement.nativeElement.play();
      this.videoReproduciendo = true;
    }
  }

  /**
   * Maneja la carga de metadatos del video
   */
  onVideoLoaded() {
    if (this.videoElement && this.videoSeleccionado) {
      const duracion = this.videoElement.nativeElement.duration;
      this.videoSeleccionado.duracion = duracion;
    }
  }

  /**
   * Maneja la actualización del tiempo del video
   */
  onTimeUpdate() {
    // Aquí se puede implementar lógica adicional para el progreso del video
  }

  /**
   * Elimina un video
   */
  eliminarVideo(id: string) {
    if (confirm('¿Estás seguro de que quieres eliminar este video?')) {
      this.multimediaService.eliminarArchivo(id).subscribe(success => {
        if (success) {
          this.videos = this.videos.filter(v => v.id !== id);
          if (this.videoSeleccionado?.id === id) {
            this.videoSeleccionado = this.videos.length > 0 ? this.videos[0] : null;
          }
        }
      });
    }
  }

  /**
   * Formatea el tiempo en formato MM:SS
   */
  formatearTiempo(segundos: number): string {
    return this.multimediaService.formatearTiempo(segundos);
  }

  /**
   * Formatea el tamaño del archivo
   */
  formatearTamano(bytes: number): string {
    return this.multimediaService.formatearTamano(bytes);
  }
}