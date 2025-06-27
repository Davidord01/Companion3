/**
 * Video Upload Component
 * Handles file uploads and YouTube URL processing with drag & drop
 */

import { Component, EventEmitter, Output, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VideoApiService, VideoData } from '../../services/video-api.service';

interface UploadError {
  message: string;
  type: 'validation' | 'upload' | 'network';
}

@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="video-upload-container">
      <!-- Upload Mode Selector -->
      <div class="upload-mode-selector">
        <button 
          class="mode-btn"
          [class.active]="modoSubida === 'file'"
          (click)="cambiarModo('file')"
        >
          <span class="mode-icon">📁</span>
          Subir Archivo
        </button>
        <button 
          class="mode-btn"
          [class.active]="modoSubida === 'youtube'"
          (click)="cambiarModo('youtube')"
        >
          <span class="mode-icon">📺</span>
          YouTube URL
        </button>
      </div>

      <!-- File Upload Section -->
      <div class="upload-section" *ngIf="modoSubida === 'file'">
        <div 
          class="drop-zone"
          [class.dragover]="isDragOver"
          [class.uploading]="subiendoArchivo"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          (click)="triggerFileInput()"
        >
          <input 
            #fileInput
            type="file"
            accept=".mp4,.avi,.mov"
            (change)="onFileSelected($event)"
            style="display: none;"
          >
          
          <div class="drop-zone-content" *ngIf="!subiendoArchivo">
            <div class="upload-icon">📹</div>
            <h3>{{ isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu video aquí' }}</h3>
            <p>o haz clic para seleccionar</p>
            <div class="file-requirements">
              <small>Formatos: MP4, AVI, MOV</small>
              <small>Tamaño máximo: 500MB</small>
            </div>
          </div>

          <!-- Upload Progress -->
          <div class="upload-progress-container" *ngIf="subiendoArchivo">
            <div class="upload-icon uploading">📤</div>
            <h3>Subiendo video...</h3>
            <div class="progress-info">
              <span>{{ archivoActual?.name }}</span>
              <span>{{ progresoSubida }}%</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                [style.width.%]="progresoSubida"
              ></div>
            </div>
            <p class="upload-status">{{ obtenerMensajeProgreso() }}</p>
          </div>
        </div>

        <!-- File Metadata Form -->
        <div class="metadata-form" *ngIf="archivoSeleccionado && !subiendoArchivo">
          <h4>Información del Video</h4>
          <div class="form-group">
            <label for="fileName">Nombre del Video *</label>
            <input
              type="text"
              id="fileName"
              [(ngModel)]="metadatosArchivo.nombre"
              placeholder="Ingresa un nombre descriptivo"
              class="form-input"
              [class.error]="errores.nombre"
            >
            <div class="error-message" *ngIf="errores.nombre">
              {{ errores.nombre }}
            </div>
          </div>

          <div class="form-group">
            <label for="fileDescription">Descripción (Opcional)</label>
            <textarea
              id="fileDescription"
              [(ngModel)]="metadatosArchivo.descripcion"
              placeholder="Describe tu video..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <div class="file-info">
            <div class="info-item">
              <strong>Archivo:</strong> {{ archivoSeleccionado.name }}
            </div>
            <div class="info-item">
              <strong>Tamaño:</strong> {{ formatearTamano(archivoSeleccionado.size) }}
            </div>
            <div class="info-item">
              <strong>Tipo:</strong> {{ archivoSeleccionado.type }}
            </div>
          </div>

          <div class="form-actions">
            <button 
              class="btn btn-secundario"
              (click)="cancelarSubida()"
            >
              Cancelar
            </button>
            <button 
              class="btn btn-primario"
              (click)="subirArchivo()"
              [disabled]="!metadatosArchivo.nombre.trim()"
            >
              <span class="btn-icon">🚀</span>
              Subir Video
            </button>
          </div>
        </div>
      </div>

      <!-- YouTube URL Section -->
      <div class="upload-section" *ngIf="modoSubida === 'youtube'">
        <div class="youtube-form">
          <h3>
            <span class="youtube-icon">📺</span>
            Agregar Video de YouTube
          </h3>
          
          <div class="form-group">
            <label for="youtubeUrl">URL de YouTube *</label>
            <input
              type="url"
              id="youtubeUrl"
              [(ngModel)]="datosYoutube.url"
              placeholder="https://www.youtube.com/watch?v=..."
              class="form-input"
              [class.error]="errores.url"
              (input)="validarUrlYoutube()"
            >
            <div class="error-message" *ngIf="errores.url">
              {{ errores.url }}
            </div>
            <div class="success-message" *ngIf="urlYoutubeValida">
              ✅ URL de YouTube válida
            </div>
          </div>

          <div class="form-group">
            <label for="youtubeName">Nombre del Video *</label>
            <input
              type="text"
              id="youtubeName"
              [(ngModel)]="datosYoutube.nombre"
              placeholder="Nombre personalizado para el video"
              class="form-input"
              [class.error]="errores.nombre"
            >
            <div class="error-message" *ngIf="errores.nombre">
              {{ errores.nombre }}
            </div>
          </div>

          <div class="form-group">
            <label for="youtubeDescription">Descripción (Opcional)</label>
            <textarea
              id="youtubeDescription"
              [(ngModel)]="datosYoutube.descripcion"
              placeholder="Descripción personalizada..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>

          <!-- YouTube Preview -->
          <div class="youtube-preview" *ngIf="urlYoutubeValida && videoIdYoutube">
            <h4>Vista Previa</h4>
            <div class="preview-container">
              <img 
                [src]="obtenerThumbnailYoutube()"
                [alt]="'Thumbnail de ' + datosYoutube.nombre"
                class="preview-thumbnail"
              >
              <div class="preview-info">
                <p><strong>Video ID:</strong> {{ videoIdYoutube }}</p>
                <p><strong>Thumbnail:</strong> Disponible</p>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button 
              class="btn btn-secundario"
              (click)="limpiarFormularioYoutube()"
            >
              Limpiar
            </button>
            <button 
              class="btn btn-primario"
              (click)="agregarVideoYoutube()"
              [disabled]="!formularioYoutubeValido() || procesandoYoutube"
            >
              <span class="btn-icon">{{ procesandoYoutube ? '⏳' : '📺' }}</span>
              {{ procesandoYoutube ? 'Procesando...' : 'Agregar Video' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Error Display -->
      <div class="error-display" *ngIf="errorSubida">
        <div class="error-icon">⚠️</div>
        <div class="error-content">
          <h4>Error en la subida</h4>
          <p>{{ errorSubida.message }}</p>
          <button class="btn btn-secundario" (click)="limpiarError()">
            Intentar de nuevo
          </button>
        </div>
      </div>

      <!-- Success Display -->
      <div class="success-display" *ngIf="videoSubidoExitosamente">
        <div class="success-icon">✅</div>
        <div class="success-content">
          <h4>¡Video subido exitosamente!</h4>
          <p>{{ videoSubidoExitosamente.nombre }}</p>
          <div class="success-actions">
            <button class="btn btn-primario" (click)="verVideo()">
              Ver Video
            </button>
            <button class="btn btn-secundario" (click)="subirOtroVideo()">
              Subir Otro
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-upload-container {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      padding: var(--espaciado-md);
      border: 1px solid var(--color-acento);
    }

    .upload-mode-selector {
      display: flex;
      gap: var(--espaciado-sm);
      margin-bottom: var(--espaciado-md);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--color-acento);
    }

    .mode-btn {
      flex: 1;
      padding: var(--espaciado-sm);
      background: transparent;
      border: none;
      color: var(--color-acento);
      font-family: var(--fuente-titulo);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--espaciado-xs);
    }

    .mode-btn.active {
      background: var(--color-acento);
      color: var(--color-texto-claro);
    }

    .mode-btn:hover:not(.active) {
      background: rgba(255, 107, 53, 0.1);
    }

    .mode-icon {
      font-size: 1.2rem;
    }

    .upload-section {
      margin-top: var(--espaciado-md);
    }

    .drop-zone {
      border: 2px dashed var(--color-acento);
      border-radius: 12px;
      padding: var(--espaciado-lg);
      text-align: center;
      cursor: pointer;
      transition: all var(--transicion-media);
      background: rgba(255, 107, 53, 0.05);
      min-height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .drop-zone:hover,
    .drop-zone.dragover {
      border-color: var(--color-supervivencia);
      background: rgba(74, 93, 35, 0.1);
      transform: translateY(-2px);
    }

    .drop-zone.uploading {
      cursor: default;
      border-color: var(--color-supervivencia);
      background: rgba(74, 93, 35, 0.1);
    }

    .drop-zone-content {
      color: var(--color-texto-claro);
    }

    .upload-icon {
      font-size: 3rem;
      margin-bottom: var(--espaciado-sm);
    }

    .upload-icon.uploading {
      animation: pulso 1.5s ease-in-out infinite;
    }

    .drop-zone-content h3 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-xs);
    }

    .file-requirements {
      margin-top: var(--espaciado-sm);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .file-requirements small {
      color: rgba(245, 245, 245, 0.6);
    }

    .upload-progress-container {
      color: var(--color-texto-claro);
      width: 100%;
    }

    .progress-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: var(--espaciado-xs);
      font-size: 0.9rem;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: var(--espaciado-sm);
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--color-acento), var(--color-supervivencia));
      transition: width var(--transicion-rapida);
    }

    .upload-status {
      font-size: 0.9rem;
      color: rgba(245, 245, 245, 0.8);
    }

    .metadata-form,
    .youtube-form {
      background: var(--color-fondo-oscuro);
      border-radius: 8px;
      padding: var(--espaciado-md);
      margin-top: var(--espaciado-md);
    }

    .metadata-form h4,
    .youtube-form h3 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-md);
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .youtube-icon {
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: var(--espaciado-md);
    }

    .form-group label {
      display: block;
      color: var(--color-acento);
      font-weight: 600;
      margin-bottom: var(--espaciado-xs);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: var(--espaciado-sm);
      background: var(--color-fondo-medio);
      border: 2px solid rgba(245, 245, 245, 0.2);
      border-radius: 8px;
      color: var(--color-texto-claro);
      font-size: 1rem;
      transition: all var(--transicion-rapida);
      resize: vertical;
    }

    .form-input:focus,
    .form-textarea:focus {
      outline: none;
      border-color: var(--color-acento);
      box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
    }

    .form-input.error,
    .form-textarea.error {
      border-color: var(--color-peligro);
      box-shadow: 0 0 10px rgba(178, 34, 34, 0.3);
    }

    .error-message {
      color: var(--color-peligro);
      font-size: 0.8rem;
      margin-top: var(--espaciado-xs);
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .error-message::before {
      content: '⚠️';
    }

    .success-message {
      color: var(--color-supervivencia);
      font-size: 0.8rem;
      margin-top: var(--espaciado-xs);
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .file-info {
      background: rgba(255, 107, 53, 0.1);
      border-radius: 8px;
      padding: var(--espaciado-sm);
      margin-bottom: var(--espaciado-md);
    }

    .info-item {
      color: var(--color-texto-claro);
      margin-bottom: var(--espaciado-xs);
      font-size: 0.9rem;
    }

    .info-item:last-child {
      margin-bottom: 0;
    }

    .youtube-preview {
      background: rgba(74, 93, 35, 0.1);
      border-radius: 8px;
      padding: var(--espaciado-sm);
      margin-bottom: var(--espaciado-md);
    }

    .youtube-preview h4 {
      color: var(--color-supervivencia);
      margin-bottom: var(--espaciado-sm);
    }

    .preview-container {
      display: flex;
      gap: var(--espaciado-sm);
      align-items: center;
    }

    .preview-thumbnail {
      width: 120px;
      height: 68px;
      object-fit: cover;
      border-radius: 4px;
      border: 1px solid var(--color-supervivencia);
    }

    .preview-info {
      flex: 1;
      color: var(--color-texto-claro);
      font-size: 0.9rem;
    }

    .preview-info p {
      margin-bottom: var(--espaciado-xs);
    }

    .form-actions {
      display: flex;
      gap: var(--espaciado-sm);
      justify-content: flex-end;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-sm) var(--espaciado-md);
      border-radius: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all var(--transicion-media);
      border: 2px solid transparent;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none !important;
    }

    .btn-primario {
      background: var(--gradiente-apocaliptico);
      color: var(--color-texto-claro);
      border-color: var(--color-acento);
    }

    .btn-primario:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: var(--sombra-media);
    }

    .btn-secundario {
      background: transparent;
      color: var(--color-texto-claro);
      border-color: rgba(245, 245, 245, 0.3);
    }

    .btn-secundario:hover {
      background: rgba(245, 245, 245, 0.1);
      border-color: var(--color-texto-claro);
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    .error-display,
    .success-display {
      background: var(--color-fondo-oscuro);
      border-radius: 8px;
      padding: var(--espaciado-md);
      margin-top: var(--espaciado-md);
      display: flex;
      align-items: center;
      gap: var(--espaciado-md);
    }

    .error-display {
      border: 1px solid var(--color-peligro);
    }

    .success-display {
      border: 1px solid var(--color-supervivencia);
    }

    .error-icon,
    .success-icon {
      font-size: 2rem;
    }

    .error-content h4 {
      color: var(--color-peligro);
      margin-bottom: var(--espaciado-xs);
    }

    .success-content h4 {
      color: var(--color-supervivencia);
      margin-bottom: var(--espaciado-xs);
    }

    .error-content p,
    .success-content p {
      color: var(--color-texto-claro);
      margin-bottom: var(--espaciado-sm);
    }

    .success-actions {
      display: flex;
      gap: var(--espaciado-sm);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .upload-mode-selector {
        flex-direction: column;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .preview-container {
        flex-direction: column;
        text-align: center;
      }

      .success-actions {
        flex-direction: column;
      }
    }
  `]
})
export class VideoUploadComponent {
  @Input() acceptedFormats: string[] = ['mp4', 'avi', 'mov'];
  @Input() maxSize: number = 500; // MB
  @Output() onUpload = new EventEmitter<VideoData>();
  @Output() onError = new EventEmitter<UploadError>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  modoSubida: 'file' | 'youtube' = 'file';
  isDragOver = false;
  subiendoArchivo = false;
  procesandoYoutube = false;
  progresoSubida = 0;
  
  archivoSeleccionado: File | null = null;
  archivoActual: File | null = null;
  videoSubidoExitosamente: VideoData | null = null;
  errorSubida: UploadError | null = null;

  metadatosArchivo = {
    nombre: '',
    descripcion: ''
  };

  datosYoutube = {
    url: '',
    nombre: '',
    descripcion: ''
  };

  errores: { [key: string]: string } = {};
  urlYoutubeValida = false;
  videoIdYoutube: string | null = null;

  constructor(private videoService: VideoApiService) {}

  /**
   * Change upload mode
   */
  cambiarModo(modo: 'file' | 'youtube') {
    this.modoSubida = modo;
    this.limpiarEstado();
  }

  /**
   * Handle drag over event
   */
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = true;
  }

  /**
   * Handle drag leave event
   */
  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
  }

  /**
   * Handle file drop
   */
  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.procesarArchivo(files[0]);
    }
  }

  /**
   * Trigger file input click
   */
  triggerFileInput() {
    if (!this.subiendoArchivo) {
      this.fileInput.nativeElement.click();
    }
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivo(input.files[0]);
    }
  }

  /**
   * Process selected file
   */
  private procesarArchivo(file: File) {
    this.limpiarError();
    
    // Validate file format
    if (!this.videoService.validarFormato(file.name)) {
      this.mostrarError({
        message: `Formato no soportado. Solo se permiten archivos: ${this.acceptedFormats.join(', ').toUpperCase()}`,
        type: 'validation'
      });
      return;
    }

    // Validate file size
    if (!this.videoService.validarTamano(file.size)) {
      this.mostrarError({
        message: `El archivo es demasiado grande. Tamaño máximo: ${this.maxSize}MB`,
        type: 'validation'
      });
      return;
    }

    this.archivoSeleccionado = file;
    this.metadatosArchivo.nombre = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
  }

  /**
   * Upload file to server
   */
  subirArchivo() {
    if (!this.archivoSeleccionado || !this.metadatosArchivo.nombre.trim()) {
      return;
    }

    this.errores = {};
    this.subiendoArchivo = true;
    this.archivoActual = this.archivoSeleccionado;
    this.progresoSubida = 0;

    this.videoService.subirArchivo(
      this.archivoSeleccionado,
      this.metadatosArchivo.nombre.trim(),
      this.metadatosArchivo.descripcion.trim()
    ).subscribe({
      next: (progress) => {
        this.progresoSubida = progress.progreso;
        
        if (progress.completado && progress.video) {
          this.subiendoArchivo = false;
          this.videoSubidoExitosamente = progress.video;
          this.onUpload.emit(progress.video);
          this.limpiarFormularioArchivo();
        }
      },
      error: (error) => {
        this.subiendoArchivo = false;
        this.mostrarError({
          message: error.message || 'Error al subir el archivo',
          type: 'upload'
        });
      }
    });
  }

  /**
   * Cancel file upload
   */
  cancelarSubida() {
    this.archivoSeleccionado = null;
    this.metadatosArchivo = { nombre: '', descripcion: '' };
    this.errores = {};
  }

  /**
   * Validate YouTube URL
   */
  validarUrlYoutube() {
    this.urlYoutubeValida = false;
    this.videoIdYoutube = null;
    this.errores.url = '';

    if (!this.datosYoutube.url.trim()) {
      return;
    }

    if (this.videoService.esUrlYoutube(this.datosYoutube.url)) {
      this.videoIdYoutube = this.videoService.extraerIdYoutube(this.datosYoutube.url);
      if (this.videoIdYoutube) {
        this.urlYoutubeValida = true;
      } else {
        this.errores.url = 'No se pudo extraer el ID del video de YouTube';
      }
    } else {
      this.errores.url = 'URL de YouTube no válida';
    }
  }

  /**
   * Check if YouTube form is valid
   */
  formularioYoutubeValido(): boolean {
    return !!(
      this.urlYoutubeValida &&
      this.datosYoutube.nombre.trim()
    );
  }

  /**
   * Add YouTube video
   */
  agregarVideoYoutube() {
    if (!this.formularioYoutubeValido()) {
      return;
    }

    this.errores = {};
    this.procesandoYoutube = true;

    this.videoService.agregarVideoYoutube(
      this.datosYoutube.url.trim(),
      this.datosYoutube.nombre.trim(),
      this.datosYoutube.descripcion.trim()
    ).subscribe({
      next: (response) => {
        this.procesandoYoutube = false;
        this.videoSubidoExitosamente = response.video;
        this.onUpload.emit(response.video);
        this.limpiarFormularioYoutube();
      },
      error: (error) => {
        this.procesandoYoutube = false;
        this.mostrarError({
          message: error.message || 'Error al procesar la URL de YouTube',
          type: 'network'
        });
      }
    });
  }

  /**
   * Get YouTube thumbnail URL
   */
  obtenerThumbnailYoutube(): string {
    if (!this.videoIdYoutube) return '';
    return this.videoService.obtenerThumbnailYoutube(this.videoIdYoutube, 'medium');
  }

  /**
   * Clear YouTube form
   */
  limpiarFormularioYoutube() {
    this.datosYoutube = { url: '', nombre: '', descripcion: '' };
    this.urlYoutubeValida = false;
    this.videoIdYoutube = null;
    this.errores = {};
  }

  /**
   * Clear file form
   */
  private limpiarFormularioArchivo() {
    this.archivoSeleccionado = null;
    this.archivoActual = null;
    this.metadatosArchivo = { nombre: '', descripcion: '' };
    this.progresoSubida = 0;
  }

  /**
   * Clear all state
   */
  private limpiarEstado() {
    this.limpiarFormularioArchivo();
    this.limpiarFormularioYoutube();
    this.limpiarError();
    this.videoSubidoExitosamente = null;
    this.subiendoArchivo = false;
    this.procesandoYoutube = false;
  }

  /**
   * Show error message
   */
  private mostrarError(error: UploadError) {
    this.errorSubida = error;
    this.onError.emit(error);
  }

  /**
   * Clear error
   */
  limpiarError() {
    this.errorSubida = null;
  }

  /**
   * Get upload progress message
   */
  obtenerMensajeProgreso(): string {
    if (this.progresoSubida < 25) {
      return 'Iniciando subida...';
    } else if (this.progresoSubida < 50) {
      return 'Subiendo archivo...';
    } else if (this.progresoSubida < 75) {
      return 'Procesando video...';
    } else if (this.progresoSubida < 100) {
      return 'Finalizando...';
    } else {
      return 'Completado';
    }
  }

  /**
   * Format file size
   */
  formatearTamano(bytes: number): string {
    return this.videoService.formatearTamano(bytes);
  }

  /**
   * View uploaded video
   */
  verVideo() {
    if (this.videoSubidoExitosamente) {
      // Emit event to parent component to navigate to video
      this.onUpload.emit(this.videoSubidoExitosamente);
    }
  }

  /**
   * Upload another video
   */
  subirOtroVideo() {
    this.limpiarEstado();
  }
}