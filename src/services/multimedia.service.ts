/**
 * Servicio para gestionar archivos multimedia
 * Maneja la subida, almacenamiento y reproducción de audio y video
 */

import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';

/**
 * Interface para archivos multimedia
 */
export interface ArchivoMultimedia {
  id: string;
  nombre: string;
  tipo: 'audio' | 'video';
  formato: string;
  url: string;
  duracion?: number;
  fechaSubida: Date;
  tamano: number;
  descripcion?: string;
  thumbnail?: string;
}

/**
 * Interface para el estado del reproductor
 */
export interface EstadoReproductor {
  reproduciendo: boolean;
  archivoActual: ArchivoMultimedia | null;
  tiempoActual: number;
  volumen: number;
  muted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MultimediaService {
  private archivos: ArchivoMultimedia[] = [];
  private archivosSubject = new BehaviorSubject<ArchivoMultimedia[]>([]);
  private estadoReproductorSubject = new BehaviorSubject<EstadoReproductor>({
    reproduciendo: false,
    archivoActual: null,
    tiempoActual: 0,
    volumen: 1,
    muted: false
  });

  // Formatos permitidos
  private formatosAudio = ['.mp3', '.wav', '.ogg'];
  private formatosVideo = ['.mp4', '.mov', '.webm'];

  constructor() {
    this.inicializarArchivosDemo();
  }

  /**
   * Inicializa archivos de demostración
   */
  private inicializarArchivosDemo() {
    const archivosDemo: ArchivoMultimedia[] = [
      {
        id: 'audio-1',
        nombre: 'Tema Principal - The Last of Us 2',
        tipo: 'audio',
        formato: '.mp3',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        duracion: 180,
        fechaSubida: new Date('2024-01-15'),
        tamano: 5242880,
        descripcion: 'Música principal del juego compuesta por Gustavo Santaolalla'
      },
      {
        id: 'audio-2',
        nombre: 'Diálogo - Ellie y Joel',
        tipo: 'audio',
        formato: '.mp3',
        url: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
        duracion: 120,
        fechaSubida: new Date('2024-01-20'),
        tamano: 3145728,
        descripcion: 'Conversación emotiva entre Ellie y Joel en Jackson'
      },
      {
        id: 'video-1',
        nombre: 'Trailer Oficial - The Last of Us 2',
        tipo: 'video',
        formato: '.mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duracion: 300,
        fechaSubida: new Date('2024-01-10'),
        tamano: 52428800,
        descripcion: 'Trailer oficial revelando la historia de Ellie',
        thumbnail: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg'
      },
      {
        id: 'video-2',
        nombre: 'Gameplay - Seattle Exploration',
        tipo: 'video',
        formato: '.mp4',
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duracion: 450,
        fechaSubida: new Date('2024-01-25'),
        tamano: 104857600,
        descripcion: 'Exploración de Seattle en busca de Abby',
        thumbnail: 'https://uploads.worldanvil.com/uploads/images/2b15c848c6f3e46aba209c5e36443d3a.jpg'
      }
    ];

    this.archivos = archivosDemo;
    this.archivosSubject.next(this.archivos);
  }

  /**
   * Obtiene todos los archivos multimedia
   */
  obtenerArchivos(): Observable<ArchivoMultimedia[]> {
    return this.archivosSubject.asObservable();
  }

  /**
   * Obtiene archivos por tipo
   */
  obtenerArchivosPorTipo(tipo: 'audio' | 'video'): Observable<ArchivoMultimedia[]> {
    const archivosFiltrados = this.archivos.filter(archivo => archivo.tipo === tipo);
    return of(archivosFiltrados.sort((a, b) => b.fechaSubida.getTime() - a.fechaSubida.getTime()));
  }

  /**
   * Obtiene el estado actual del reproductor
   */
  obtenerEstadoReproductor(): Observable<EstadoReproductor> {
    return this.estadoReproductorSubject.asObservable();
  }

  /**
   * Valida si un archivo tiene un formato permitido
   */
  validarFormato(nombreArchivo: string, tipo: 'audio' | 'video'): boolean {
    const extension = '.' + nombreArchivo.split('.').pop()?.toLowerCase();
    const formatosPermitidos = tipo === 'audio' ? this.formatosAudio : this.formatosVideo;
    return formatosPermitidos.includes(extension);
  }

  /**
   * Simula la subida de un archivo
   */
  subirArchivo(archivo: File, descripcion?: string): Observable<{progreso: number, completado: boolean, archivo?: ArchivoMultimedia}> {
    return new Observable(observer => {
      // Validar formato
      const tipo = archivo.type.startsWith('audio/') ? 'audio' : 'video';
      if (!this.validarFormato(archivo.name, tipo)) {
        observer.error('Formato de archivo no permitido');
        return;
      }

      // Simular progreso de subida
      let progreso = 0;
      const intervalo = setInterval(() => {
        progreso += Math.random() * 20;
        if (progreso >= 100) {
          progreso = 100;
          clearInterval(intervalo);

          // Crear URL temporal para el archivo
          const url = URL.createObjectURL(archivo);
          
          const nuevoArchivo: ArchivoMultimedia = {
            id: 'archivo-' + Date.now(),
            nombre: archivo.name.replace(/\.[^/.]+$/, ""),
            tipo: tipo,
            formato: '.' + archivo.name.split('.').pop()?.toLowerCase(),
            url: url,
            fechaSubida: new Date(),
            tamano: archivo.size,
            descripcion: descripcion || '',
            thumbnail: tipo === 'video' ? 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg' : undefined
          };

          // Agregar a la lista
          this.archivos.unshift(nuevoArchivo);
          this.archivosSubject.next(this.archivos);

          observer.next({ progreso: 100, completado: true, archivo: nuevoArchivo });
          observer.complete();
        } else {
          observer.next({ progreso, completado: false });
        }
      }, 200);
    });
  }

  /**
   * Actualiza el estado del reproductor
   */
  actualizarEstadoReproductor(nuevoEstado: Partial<EstadoReproductor>) {
    const estadoActual = this.estadoReproductorSubject.value;
    this.estadoReproductorSubject.next({ ...estadoActual, ...nuevoEstado });
  }

  /**
   * Elimina un archivo
   */
  eliminarArchivo(id: string): Observable<boolean> {
    const index = this.archivos.findIndex(archivo => archivo.id === id);
    if (index !== -1) {
      // Revocar URL si es un blob
      if (this.archivos[index].url.startsWith('blob:')) {
        URL.revokeObjectURL(this.archivos[index].url);
      }
      
      this.archivos.splice(index, 1);
      this.archivosSubject.next(this.archivos);
      return of(true);
    }
    return of(false);
  }

  /**
   * Obtiene información de duración de un archivo de audio/video
   */
  obtenerDuracionArchivo(url: string): Promise<number> {
    return new Promise((resolve) => {
      const elemento = document.createElement('audio');
      elemento.src = url;
      elemento.addEventListener('loadedmetadata', () => {
        resolve(elemento.duration);
      });
      elemento.addEventListener('error', () => {
        resolve(0);
      });
    });
  }

  /**
   * Formatea el tiempo en formato MM:SS
   */
  formatearTiempo(segundos: number): string {
    const minutos = Math.floor(segundos / 60);
    const segs = Math.floor(segundos % 60);
    return `${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  }

  /**
   * Formatea el tamaño del archivo
   */
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}