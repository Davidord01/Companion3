/**
 * Video Player Component
 * Advanced video player with custom controls and YouTube support
 */

import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoData, VideoApiService } from '../../services/video-api.service';

interface PlayerControls {
  play: boolean;
  volume: boolean;
  quality: boolean;
  fullscreen: boolean;
  progress: boolean;
  time: boolean;
}

interface PlayerState {
  playing: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: number;
  fullscreen: boolean;
  quality: string;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="video-player-container" [class.fullscreen]="playerState.fullscreen">
      <!-- Video Element -->
      <div class="video-wrapper" (click)="togglePlay()">
        <!-- Local Video -->
        <video 
          #videoElement
          *ngIf="video && video.tipo === 'video'"
          [src]="getVideoUrl()"
          preload="metadata"
          (loadedmetadata)="onLoadedMetadata()"
          (timeupdate)="onTimeUpdate()"
          (progress)="onProgress()"
          (ended)="handleEnded()"
          (play)="handlePlay()"
          (pause)="handlePause()"
          (volumechange)="onVolumeChange()"
          (error)="onError($event)"
          class="video-element"
        >
          Tu navegador no soporta la reproducción de video.
        </video>

        <!-- YouTube Video -->
        <div 
          *ngIf="video && video.tipo === 'youtube'"
          class="youtube-container"
        >
          <iframe
            [src]="getYouTubeEmbedUrl()"
            frameborder="0"
            allowfullscreen
            class="youtube-iframe"
          ></iframe>
        </div>

        <!-- Loading Overlay -->
        <div class="loading-overlay" *ngIf="loading">
          <div class="loading-spinner"></div>
          <p>Cargando video...</p>
        </div>

        <!-- Error Overlay -->
        <div class="error-overlay" *ngIf="error">
          <div class="error-icon">⚠️</div>
          <h3>Error al cargar el video</h3>
          <p>{{ error }}</p>
          <button class="btn btn-primario" (click)="reloadVideo()">
            Reintentar
          </button>
        </div>

        <!-- Play Overlay -->
        <div 
          class="play-overlay"
          *ngIf="!playerState.playing && !loading && !error && video?.tipo === 'video'"
          (click)="togglePlay()"
        >
          <button class="play-button">
            <span class="play-icon">▶️</span>
          </button>
        </div>
      </div>

      <!-- Custom Controls -->
      <div 
        class="video-controls"
        *ngIf="showControls && video?.tipo === 'video'"
        [class.visible]="controlsVisible"
      >
        <!-- Progress Bar -->
        <div class="progress-container" *ngIf="controls.progress">
          <div 
            class="progress-bar"
            (click)="seekTo($event)"
            #progressBar
          >
            <div class="progress-buffered" [style.width.%]="bufferedPercentage"></div>
            <div class="progress-played" [style.width.%]="playedPercentage"></div>
            <div 
              class="progress-handle"
              [style.left.%]="playedPercentage"
              (mousedown)="startSeeking($event)"
            ></div>
          </div>
        </div>

        <!-- Control Buttons -->
        <div class="controls-row">
          <!-- Play/Pause -->
          <button 
            class="control-btn play-pause"
            *ngIf="controls.play"
            (click)="togglePlay()"
            [attr.aria-label]="playerState.playing ? 'Pausar' : 'Reproducir'"
          >
            <span *ngIf="!playerState.playing">▶️</span>
            <span *ngIf="playerState.playing">⏸️</span>
          </button>

          <!-- Time Display -->
          <div class="time-display" *ngIf="controls.time">
            <span class="current-time">{{ formatTime(playerState.currentTime) }}</span>
            <span class="time-separator">/</span>
            <span class="total-time">{{ formatTime(playerState.duration) }}</span>
          </div>

          <!-- Spacer -->
          <div class="controls-spacer"></div>

          <!-- Volume Control -->
          <div class="volume-control" *ngIf="controls.volume">
            <button 
              class="control-btn volume-btn"
              (click)="toggleMute()"
              [attr.aria-label]="playerState.muted ? 'Activar sonido' : 'Silenciar'"
            >
              <span *ngIf="!playerState.muted && playerState.volume > 0.5">🔊</span>
              <span *ngIf="!playerState.muted && playerState.volume <= 0.5 && playerState.volume > 0">🔉</span>
              <span *ngIf="playerState.muted || playerState.volume === 0">🔇</span>
            </button>
            <div class="volume-slider-container">
              <input 
                type="range"
                min="0"
                max="1"
                step="0.1"
                [value]="playerState.volume"
                (input)="setVolume($event)"
                class="volume-slider"
              >
            </div>
          </div>

          <!-- Quality Selector -->
          <div class="quality-control" *ngIf="controls.quality && availableQualities.length > 1">
            <select 
              class="quality-select"
              [value]="playerState.quality"
              (change)="setQuality($event)"
            >
              <option 
                *ngFor="let quality of availableQualities"
                [value]="quality.value"
              >
                {{ quality.label }}
              </option>
            </select>
          </div>

          <!-- Fullscreen -->
          <button 
            class="control-btn fullscreen-btn"
            *ngIf="controls.fullscreen"
            (click)="toggleFullscreen()"
            [attr.aria-label]="playerState.fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'"
          >
            <span *ngIf="!playerState.fullscreen">⛶</span>
            <span *ngIf="playerState.fullscreen">⛷</span>
          </button>
        </div>
      </div>

      <!-- Video Info Overlay -->
      <div class="video-info-overlay" *ngIf="showInfo && video">
        <h3 class="video-title">{{ video.nombre }}</h3>
        <p class="video-description" *ngIf="video.descripcion">{{ video.descripcion }}</p>
        <div class="video-meta">
          <span class="meta-item">{{ formatFileSize(video.tamano) }}</span>
          <span class="meta-item">{{ formatTime(video.duracion || 0) }}</span>
          <span class="meta-item">{{ video.views || 0 }} visualizaciones</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .video-player-container {
      position: relative;
      width: 100%;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: var(--sombra-fuerte);
    }

    .video-player-container.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      border-radius: 0;
    }

    .video-wrapper {
      position: relative;
      width: 100%;
      height: 0;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      cursor: pointer;
    }

    .video-player-container.fullscreen .video-wrapper {
      height: 100vh;
      padding-bottom: 0;
    }

    .video-element,
    .youtube-iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .youtube-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    .loading-overlay,
    .error-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: var(--color-texto-claro);
      text-align: center;
      padding: var(--espaciado-md);
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 107, 53, 0.3);
      border-top: 3px solid var(--color-acento);
      border-radius: 50%;
      animation: girar 1s linear infinite;
      margin-bottom: var(--espaciado-sm);
    }

    .error-icon {
      font-size: 3rem;
      margin-bottom: var(--espaciado-sm);
    }

    .error-overlay h3 {
      color: var(--color-peligro);
      margin-bottom: var(--espaciado-sm);
    }

    .play-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .video-wrapper:hover .play-overlay {
      opacity: 1;
    }

    .play-button {
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

    .play-button:hover {
      background: var(--color-acento);
      transform: scale(1.1);
    }

    .play-icon {
      font-size: 2rem;
      margin-left: 4px;
    }

    .video-controls {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
      padding: var(--espaciado-md);
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .video-controls.visible,
    .video-player-container:hover .video-controls {
      opacity: 1;
    }

    .progress-container {
      margin-bottom: var(--espaciado-sm);
    }

    .progress-bar {
      position: relative;
      height: 6px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;
      cursor: pointer;
      transition: height var(--transicion-rapida);
    }

    .progress-bar:hover {
      height: 8px;
    }

    .progress-buffered,
    .progress-played {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      border-radius: 3px;
    }

    .progress-buffered {
      background: rgba(255, 255, 255, 0.5);
    }

    .progress-played {
      background: linear-gradient(90deg, var(--color-acento), var(--color-supervivencia));
    }

    .progress-handle {
      position: absolute;
      top: 50%;
      width: 12px;
      height: 12px;
      background: var(--color-acento);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity var(--transicion-rapida);
      cursor: pointer;
      border: 2px solid #fff;
    }

    .progress-bar:hover .progress-handle {
      opacity: 1;
    }

    .controls-row {
      display: flex;
      align-items: center;
      gap: var(--espaciado-sm);
    }

    .control-btn {
      background: none;
      border: none;
      color: var(--color-texto-claro);
      cursor: pointer;
      padding: var(--espaciado-xs);
      border-radius: 4px;
      transition: all var(--transicion-rapida);
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 40px;
      height: 40px;
    }

    .control-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .time-display {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--color-texto-claro);
      font-family: var(--fuente-titulo);
      font-size: 0.9rem;
      min-width: 100px;
    }

    .time-separator {
      color: rgba(255, 255, 255, 0.6);
    }

    .controls-spacer {
      flex: 1;
    }

    .volume-control {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .volume-slider-container {
      width: 80px;
    }

    .volume-slider {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
    }

    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      background: var(--color-acento);
      border-radius: 50%;
      cursor: pointer;
    }

    .volume-slider::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: var(--color-acento);
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    .quality-select {
      background: rgba(0, 0, 0, 0.8);
      color: var(--color-texto-claro);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 0.9rem;
      cursor: pointer;
    }

    .quality-select option {
      background: #000;
      color: var(--color-texto-claro);
    }

    .video-info-overlay {
      position: absolute;
      top: var(--espaciado-md);
      left: var(--espaciado-md);
      right: var(--espaciado-md);
      background: linear-gradient(rgba(0, 0, 0, 0.8), transparent);
      padding: var(--espaciado-md);
      border-radius: 8px;
      color: var(--color-texto-claro);
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .video-player-container:hover .video-info-overlay {
      opacity: 1;
    }

    .video-title {
      font-size: 1.2rem;
      margin-bottom: var(--espaciado-xs);
      color: var(--color-texto-claro);
    }

    .video-description {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: var(--espaciado-sm);
      line-height: 1.4;
    }

    .video-meta {
      display: flex;
      gap: var(--espaciado-md);
      flex-wrap: wrap;
    }

    .meta-item {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.6);
      background: rgba(0, 0, 0, 0.5);
      padding: 2px 6px;
      border-radius: 4px;
    }

    @keyframes girar {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .video-controls {
        padding: var(--espaciado-sm);
      }

      .controls-row {
        gap: var(--espaciado-xs);
      }

      .volume-slider-container {
        width: 60px;
      }

      .time-display {
        font-size: 0.8rem;
        min-width: 80px;
      }

      .video-info-overlay {
        top: var(--espaciado-sm);
        left: var(--espaciado-sm);
        right: var(--espaciado-sm);
        padding: var(--espaciado-sm);
      }

      .video-title {
        font-size: 1rem;
      }

      .video-meta {
        flex-direction: column;
        gap: var(--espaciado-xs);
      }
    }
  `]
})
export class VideoPlayerComponent implements OnInit, OnDestroy {
  @Input() video: VideoData | null = null;
  @Input() controls: PlayerControls = {
    play: true,
    volume: true,
    quality: true,
    fullscreen: true,
    progress: true,
    time: true
  };
  @Input() showInfo = true;
  @Input() autoplay = false;

  @Output() onError = new EventEmitter<string>();
  @Output() onPlay = new EventEmitter<void>();
  @Output() onPause = new EventEmitter<void>();
  @Output() onEnded = new EventEmitter<void>();

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('progressBar') progressBar!: ElementRef<HTMLDivElement>;

  playerState: PlayerState = {
    playing: false,
    muted: false,
    volume: 1,
    currentTime: 0,
    duration: 0,
    buffered: 0,
    fullscreen: false,
    quality: 'auto'
  };

  loading = false;
  error: string | null = null;
  showControls = true;
  controlsVisible = false;
  seeking = false;

  availableQualities = [
    { value: 'auto', label: 'Auto' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' }
  ];

  private controlsTimer?: any;

  constructor(private videoService: VideoApiService) {}

  ngOnInit() {
    this.setupKeyboardControls();
    this.setupControlsVisibility();
  }

  ngOnDestroy() {
    this.clearControlsTimer();
    document.removeEventListener('keydown', this.handleKeyboard);
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
  }

  /**
   * Setup keyboard controls
   */
  private setupKeyboardControls() {
    document.addEventListener('keydown', this.handleKeyboard.bind(this));
    document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
  }

  /**
   * Setup controls visibility
   */
  private setupControlsVisibility() {
    this.showControlsTemporarily();
  }

  /**
   * Handle keyboard events
   */
  private handleKeyboard(event: KeyboardEvent) {
    if (!this.video || this.video.tipo !== 'video') return;

    switch (event.code) {
      case 'Space':
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        this.seekRelative(-10);
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.seekRelative(10);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.adjustVolume(0.1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.adjustVolume(-0.1);
        break;
      case 'KeyM':
        event.preventDefault();
        this.toggleMute();
        break;
      case 'KeyF':
        event.preventDefault();
        this.toggleFullscreen();
        break;
    }
  }

  /**
   * Handle fullscreen change
   */
  private handleFullscreenChange() {
    this.playerState.fullscreen = !!document.fullscreenElement;
  }

  /**
   * Show controls temporarily
   */
  private showControlsTemporarily() {
    this.controlsVisible = true;
    this.clearControlsTimer();
    
    if (this.playerState.playing) {
      this.controlsTimer = setTimeout(() => {
        this.controlsVisible = false;
      }, 3000);
    }
  }

  /**
   * Clear controls timer
   */
  private clearControlsTimer() {
    if (this.controlsTimer) {
      clearTimeout(this.controlsTimer);
      this.controlsTimer = null;
    }
  }

  /**
   * Get video URL
   */
  getVideoUrl(): string {
    if (!this.video) return '';
    return this.videoService.obtenerUrlStream(this.video);
  }

  /**
   * Get YouTube embed URL
   */
  getYouTubeEmbedUrl(): string {
    if (!this.video || this.video.tipo !== 'youtube') return '';
    
    const videoId = this.videoService.extraerIdYoutube(this.video.url);
    if (!videoId) return '';
    
    const params = new URLSearchParams({
      autoplay: this.autoplay ? '1' : '0',
      controls: '1',
      rel: '0',
      modestbranding: '1'
    });
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  /**
   * Video event handlers
   */
  onLoadedMetadata() {
    if (this.videoElement) {
      this.playerState.duration = this.videoElement.nativeElement.duration;
      this.playerState.volume = this.videoElement.nativeElement.volume;
      this.playerState.muted = this.videoElement.nativeElement.muted;
      
      if (this.autoplay) {
        this.play();
      }
    }
  }

  onTimeUpdate() {
    if (this.videoElement && !this.seeking) {
      this.playerState.currentTime = this.videoElement.nativeElement.currentTime;
    }
  }

  onProgress() {
    if (this.videoElement) {
      const video = this.videoElement.nativeElement;
      if (video.buffered.length > 0) {
        this.playerState.buffered = video.buffered.end(video.buffered.length - 1);
      }
    }
  }

  handlePlay() {
    this.playerState.playing = true;
    this.showControlsTemporarily();
    this.onPlay.emit();
  }

  handlePause() {
    this.playerState.playing = false;
    this.controlsVisible = true;
    this.clearControlsTimer();
    this.onPause.emit();
  }

  handleEnded() {
    this.playerState.playing = false;
    this.playerState.currentTime = 0;
    this.controlsVisible = true;
    this.onEnded.emit();
  }

  onVolumeChange() {
    if (this.videoElement) {
      this.playerState.volume = this.videoElement.nativeElement.volume;
      this.playerState.muted = this.videoElement.nativeElement.muted;
    }
  }

  onError(event: Event) {
    const video = event.target as HTMLVideoElement;
    let errorMessage = 'Error desconocido al reproducir el video';
    
    if (video.error) {
      switch (video.error.code) {
        case video.error.MEDIA_ERR_ABORTED:
          errorMessage = 'Reproducción abortada por el usuario';
          break;
        case video.error.MEDIA_ERR_NETWORK:
          errorMessage = 'Error de red al cargar el video';
          break;
        case video.error.MEDIA_ERR_DECODE:
          errorMessage = 'Error al decodificar el video';
          break;
        case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMessage = 'Formato de video no soportado';
          break;
      }
    }
    
    this.error = errorMessage;
    this.onError.emit(errorMessage);
  }

  /**
   * Player controls
   */
  togglePlay() {
    if (!this.videoElement || this.video?.tipo !== 'video') return;
    
    if (this.playerState.playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  play() {
    if (this.videoElement) {
      this.videoElement.nativeElement.play().catch(error => {
        console.error('Error playing video:', error);
        this.error = 'No se pudo reproducir el video';
      });
    }
  }

  pause() {
    if (this.videoElement) {
      this.videoElement.nativeElement.pause();
    }
  }

  toggleMute() {
    if (this.videoElement) {
      this.videoElement.nativeElement.muted = !this.videoElement.nativeElement.muted;
    }
  }

  setVolume(event: Event) {
    const input = event.target as HTMLInputElement;
    const volume = parseFloat(input.value);
    
    if (this.videoElement) {
      this.videoElement.nativeElement.volume = volume;
      this.videoElement.nativeElement.muted = volume === 0;
    }
  }

  adjustVolume(delta: number) {
    if (this.videoElement) {
      const newVolume = Math.max(0, Math.min(1, this.playerState.volume + delta));
      this.videoElement.nativeElement.volume = newVolume;
    }
  }

  seekTo(event: MouseEvent) {
    if (!this.videoElement || !this.progressBar) return;
    
    const rect = this.progressBar.nativeElement.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    const newTime = percentage * this.playerState.duration;
    
    this.videoElement.nativeElement.currentTime = newTime;
  }

  seekRelative(seconds: number) {
    if (this.videoElement) {
      const newTime = Math.max(0, Math.min(this.playerState.duration, this.playerState.currentTime + seconds));
      this.videoElement.nativeElement.currentTime = newTime;
    }
  }

  startSeeking(event: MouseEvent) {
    this.seeking = true;
    
    const handleMouseMove = (e: MouseEvent) => {
      this.seekTo(e);
    };
    
    const handleMouseUp = () => {
      this.seeking = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  setQuality(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.playerState.quality = select.value;
    // In a real implementation, you would switch video sources here
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      const container = document.querySelector('.video-player-container') as HTMLElement;
      if (container) {
        container.requestFullscreen().catch(error => {
          console.error('Error entering fullscreen:', error);
        });
      }
    } else {
      document.exitFullscreen().catch(error => {
        console.error('Error exiting fullscreen:', error);
      });
    }
  }

  reloadVideo() {
    this.error = null;
    this.loading = true;
    
    if (this.videoElement) {
      this.videoElement.nativeElement.load();
    }
    
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }

  /**
   * Computed properties
   */
  get playedPercentage(): number {
    if (this.playerState.duration === 0) return 0;
    return (this.playerState.currentTime / this.playerState.duration) * 100;
  }

  get bufferedPercentage(): number {
    if (this.playerState.duration === 0) return 0;
    return (this.playerState.buffered / this.playerState.duration) * 100;
  }

  /**
   * Utility methods
   */
  formatTime(seconds: number): string {
    return this.videoService.formatearTiempo(seconds);
  }

  formatFileSize(bytes: number): string {
    return this.videoService.formatearTamano(bytes);
  }
}