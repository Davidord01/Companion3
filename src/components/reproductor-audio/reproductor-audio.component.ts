/**
 * Componente Reproductor de Audio
 * Reproductor integrado para archivos de audio en el timeline
 */

import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MultimediaService, ArchivoMultimedia, EstadoReproductor } from '../../services/multimedia.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reproductor-audio',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reproductor-audio" *ngIf="archivo">
      <audio 
        #audioElement
        [src]="archivo.url"
        (loadedmetadata)="onMetadataLoaded()"
        (timeupdate)="onTimeUpdate()"
        (ended)="onAudioEnded()"
        (play)="onPlay()"
        (pause)="onPause()"
      ></audio>

      <div class="reproductor-container">
        <!-- Información del archivo -->
        <div class="audio-info">
          <h4 class="audio-title">{{ archivo.nombre }}</h4>
          <p class="audio-description" *ngIf="archivo.descripcion">{{ archivo.descripcion }}</p>
        </div>

        <!-- Controles principales -->
        <div class="controles-principales">
          <button 
            class="btn-control btn-play"
            (click)="toggleReproduccion()"
            [attr.aria-label]="estadoReproductor.reproduciendo ? 'Pausar' : 'Reproducir'"
          >
            <span *ngIf="!estadoReproductor.reproduciendo">▶️</span>
            <span *ngIf="estadoReproductor.reproduciendo">⏸️</span>
          </button>

          <div class="tiempo-info">
            <span class="tiempo-actual">{{ formatearTiempo(estadoReproductor.tiempoActual) }}</span>
            <span class="separador">/</span>
            <span class="tiempo-total">{{ formatearTiempo(duracionTotal) }}</span>
          </div>
        </div>

        <!-- Barra de progreso -->
        <div class="barra-progreso-container">
          <div 
            class="barra-progreso"
            (click)="buscarTiempo($event)"
          >
            <div 
              class="progreso-actual"
              [style.width.%]="porcentajeProgreso"
            ></div>
            <div 
              class="indicador-progreso"
              [style.left.%]="porcentajeProgreso"
            ></div>
          </div>
        </div>

        <!-- Controles adicionales -->
        <div class="controles-adicionales">
          <button 
            class="btn-control btn-mute"
            (click)="toggleMute()"
            [attr.aria-label]="estadoReproductor.muted ? 'Activar sonido' : 'Silenciar'"
          >
            <span *ngIf="!estadoReproductor.muted && estadoReproductor.volumen > 0.5">🔊</span>
            <span *ngIf="!estadoReproductor.muted && estadoReproductor.volumen <= 0.5 && estadoReproductor.volumen > 0">🔉</span>
            <span *ngIf="estadoReproductor.muted || estadoReproductor.volumen === 0">🔇</span>
          </button>

          <div class="control-volumen">
            <input 
              type="range"
              min="0"
              max="1"
              step="0.1"
              [value]="estadoReproductor.volumen"
              (input)="cambiarVolumen($event)"
              class="slider-volumen"
            >
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reproductor-audio {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      padding: var(--espaciado-md);
      border: 1px solid var(--color-acento);
      margin: var(--espaciado-sm) 0;
      box-shadow: var(--sombra-media);
    }

    .reproductor-container {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-sm);
    }

    .audio-info {
      text-align: center;
    }

    .audio-title {
      color: var(--color-texto-claro);
      font-size: 1.1rem;
      margin-bottom: var(--espaciado-xs);
      font-family: var(--fuente-titulo);
    }

    .audio-description {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.9rem;
      margin: 0;
    }

    .controles-principales {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--espaciado-md);
    }

    .btn-control {
      background: var(--color-acento);
      border: none;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 1.2rem;
    }

    .btn-play {
      width: 60px;
      height: 60px;
      font-size: 1.5rem;
    }

    .btn-control:hover {
      background: #ff8c69;
      transform: scale(1.1);
      box-shadow: var(--sombra-media);
    }

    .tiempo-info {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      font-family: var(--fuente-titulo);
      color: var(--color-texto-claro);
      font-size: 0.9rem;
    }

    .separador {
      color: var(--color-acento);
    }

    .barra-progreso-container {
      width: 100%;
      padding: var(--espaciado-xs) 0;
    }

    .barra-progreso {
      width: 100%;
      height: 6px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 3px;
      cursor: pointer;
      position: relative;
      transition: height var(--transicion-rapida);
    }

    .barra-progreso:hover {
      height: 8px;
    }

    .progreso-actual {
      height: 100%;
      background: linear-gradient(90deg, var(--color-acento), var(--color-supervivencia));
      border-radius: 3px;
      transition: width var(--transicion-rapida);
    }

    .indicador-progreso {
      position: absolute;
      top: 50%;
      width: 12px;
      height: 12px;
      background: var(--color-acento);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity var(--transicion-rapida);
      border: 2px solid var(--color-texto-claro);
    }

    .barra-progreso:hover .indicador-progreso {
      opacity: 1;
    }

    .controles-adicionales {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--espaciado-sm);
    }

    .btn-mute {
      width: 40px;
      height: 40px;
      font-size: 1rem;
    }

    .control-volumen {
      display: flex;
      align-items: center;
    }

    .slider-volumen {
      width: 80px;
      height: 4px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 2px;
      outline: none;
      cursor: pointer;
      -webkit-appearance: none;
    }

    .slider-volumen::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 12px;
      height: 12px;
      background: var(--color-acento);
      border-radius: 50%;
      cursor: pointer;
    }

    .slider-volumen::-moz-range-thumb {
      width: 12px;
      height: 12px;
      background: var(--color-acento);
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .controles-principales {
        flex-direction: column;
        gap: var(--espaciado-sm);
      }

      .controles-adicionales {
        flex-direction: column;
        gap: var(--espaciado-xs);
      }

      .slider-volumen {
        width: 120px;
      }
    }
  `]
})
export class ReproductorAudioComponent implements OnInit, OnDestroy {
  @Input() archivo!: ArchivoMultimedia;
  @ViewChild('audioElement') audioElement!: ElementRef<HTMLAudioElement>;

  estadoReproductor: EstadoReproductor = {
    reproduciendo: false,
    archivoActual: null,
    tiempoActual: 0,
    volumen: 1,
    muted: false
  };

  duracionTotal = 0;
  porcentajeProgreso = 0;
  private subscription?: Subscription;

  constructor(private multimediaService: MultimediaService) {}

  ngOnInit() {
    this.subscription = this.multimediaService.obtenerEstadoReproductor().subscribe(
      estado => {
        this.estadoReproductor = estado;
        this.actualizarElementoAudio();
      }
    );
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  onMetadataLoaded() {
    this.duracionTotal = this.audioElement.nativeElement.duration;
  }

  onTimeUpdate() {
    const tiempoActual = this.audioElement.nativeElement.currentTime;
    this.porcentajeProgreso = (tiempoActual / this.duracionTotal) * 100;
    
    this.multimediaService.actualizarEstadoReproductor({
      tiempoActual: tiempoActual
    });
  }

  onPlay() {
    this.multimediaService.actualizarEstadoReproductor({
      reproduciendo: true,
      archivoActual: this.archivo
    });
  }

  onPause() {
    this.multimediaService.actualizarEstadoReproductor({
      reproduciendo: false
    });
  }

  onAudioEnded() {
    this.multimediaService.actualizarEstadoReproductor({
      reproduciendo: false,
      tiempoActual: 0
    });
  }

  toggleReproduccion() {
    const audio = this.audioElement.nativeElement;
    
    if (this.estadoReproductor.reproduciendo) {
      audio.pause();
    } else {
      // Pausar otros reproductores si están activos
      if (this.estadoReproductor.archivoActual && this.estadoReproductor.archivoActual.id !== this.archivo.id) {
        // Lógica para pausar otros reproductores
      }
      audio.play();
    }
  }

  buscarTiempo(event: MouseEvent) {
    const barra = event.currentTarget as HTMLElement;
    const rect = barra.getBoundingClientRect();
    const porcentaje = (event.clientX - rect.left) / rect.width;
    const nuevoTiempo = porcentaje * this.duracionTotal;
    
    this.audioElement.nativeElement.currentTime = nuevoTiempo;
  }

  cambiarVolumen(event: Event) {
    const input = event.target as HTMLInputElement;
    const volumen = parseFloat(input.value);
    
    this.audioElement.nativeElement.volume = volumen;
    this.multimediaService.actualizarEstadoReproductor({
      volumen: volumen,
      muted: volumen === 0
    });
  }

  toggleMute() {
    const audio = this.audioElement.nativeElement;
    const nuevoMuted = !this.estadoReproductor.muted;
    
    audio.muted = nuevoMuted;
    this.multimediaService.actualizarEstadoReproductor({
      muted: nuevoMuted
    });
  }

  private actualizarElementoAudio() {
    if (this.audioElement) {
      const audio = this.audioElement.nativeElement;
      audio.volume = this.estadoReproductor.volumen;
      audio.muted = this.estadoReproductor.muted;
    }
  }

  formatearTiempo(segundos: number): string {
    return this.multimediaService.formatearTiempo(segundos);
  }
}