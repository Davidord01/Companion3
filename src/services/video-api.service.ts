/**
 * Video API Service
 * Handles all video-related HTTP requests
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface VideoData {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: 'video' | 'youtube';
  formato: string;
  url: string;
  thumbnail?: string;
  tamano: number;
  duracion?: number;
  fechaSubida: Date;
  uploadedBy: string;
  views: number;
  isPublic: boolean;
  metadata?: {
    resolution?: string;
    bitrate?: string;
    codec?: string;
  };
  youtubeData?: {
    videoId: string;
    title: string;
    author: string;
    publishDate: string;
    viewCount: string;
  };
}

export interface VideoUploadProgress {
  progreso: number;
  completado: boolean;
  video?: VideoData;
}

export interface VideosResponse {
  videos: VideoData[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalVideos: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface VideoResponse {
  video: VideoData;
}

@Injectable({
  providedIn: 'root'
})
export class VideoApiService {
  private readonly API_URL = 'http://localhost:3001/api';
  private videosSubject = new BehaviorSubject<VideoData[]>([]);

  constructor(private http: HttpClient) {}

  /**
   * Get authorization headers
   */
  private getAuthHeaders(): { [key: string]: string } {
    const token = localStorage.getItem('accessToken');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  /**
   * Observable for videos list
   */
  get videos$(): Observable<VideoData[]> {
    return this.videosSubject.asObservable();
  }

  /**
   * Upload video file
   */
  subirArchivo(file: File, nombre: string, descripcion?: string): Observable<VideoUploadProgress> {
    const formData = new FormData();
    formData.append('video', file);
    formData.append('nombre', nombre);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }

    const req = new HttpRequest('POST', `${this.API_URL}/videos/upload`, formData, {
      headers: this.getAuthHeaders(),
      reportProgress: true,
      withCredentials: true
    });

    return this.http.request<{ message: string; video: VideoData }>(req).pipe(
      map((event: HttpEvent<any>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event.total ? Math.round(100 * event.loaded / event.total) : 0;
            return {
              progreso: progress,
              completado: false
            };
          case HttpEventType.Response:
            return {
              progreso: 100,
              completado: true,
              video: event.body.video
            };
          default:
            return {
              progreso: 0,
              completado: false
            };
        }
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Add YouTube video
   */
  agregarVideoYoutube(url: string, nombre: string, descripcion?: string): Observable<{ message: string; video: VideoData }> {
    const data = { url, nombre, descripcion };
    
    return this.http.post<{ message: string; video: VideoData }>(`${this.API_URL}/videos/youtube`, data, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get all videos with pagination and filtering
   */
  obtenerVideos(params: {
    page?: number;
    limit?: number;
    search?: string;
    tipo?: string;
    uploadedBy?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}): Observable<VideosResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.API_URL}/videos?${queryParams.toString()}`;
    
    return this.http.get<VideosResponse>(url, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        ...response,
        videos: response.videos.map(video => ({
          ...video,
          fechaSubida: new Date(video.fechaSubida)
        }))
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Get specific video by ID
   */
  obtenerVideo(id: string): Observable<VideoResponse> {
    return this.http.get<VideoResponse>(`${this.API_URL}/videos/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(response => ({
        ...response,
        video: {
          ...response.video,
          fechaSubida: new Date(response.video.fechaSubida)
        }
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Update video metadata
   */
  actualizarVideo(id: string, datos: Partial<VideoData>): Observable<{ message: string; video: VideoData }> {
    return this.http.patch<{ message: string; video: VideoData }>(`${this.API_URL}/videos/${id}`, datos, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Delete video
   */
  eliminarVideo(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.API_URL}/videos/${id}`, {
      headers: this.getAuthHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get video stream URL
   */
  obtenerUrlStream(video: VideoData): string {
    if (video.tipo === 'youtube') {
      return video.url;
    }
    return `${this.API_URL}${video.url}`;
  }

  /**
   * Validate video file format
   */
  validarFormato(fileName: string): boolean {
    const allowedExtensions = ['.mp4', '.avi', '.mov'];
    const extension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
    return allowedExtensions.includes(extension);
  }

  /**
   * Validate file size
   */
  validarTamano(fileSize: number): boolean {
    const maxSize = 500 * 1024 * 1024; // 500MB
    return fileSize <= maxSize;
  }

  /**
   * Format file size for display
   */
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  formatearTiempo(segundos: number): string {
    if (!segundos || segundos === 0) return '0:00';

    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = Math.floor(segundos % 60);

    if (horas > 0) {
      return `${horas}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
    } else {
      return `${minutos}:${segs.toString().padStart(2, '0')}`;
    }
  }

  /**
   * Check if URL is YouTube video
   */
  esUrlYoutube(url: string): boolean {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(url);
  }

  /**
   * Extract YouTube video ID from URL
   */
  extraerIdYoutube(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  /**
   * Get YouTube thumbnail URL
   */
  obtenerThumbnailYoutube(videoId: string, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
    return `https://img.youtube.com/vi/${videoId}/${quality}default.jpg`;
  }

  /**
   * Update videos cache
   */
  actualizarCache(videos: VideoData[]): void {
    this.videosSubject.next(videos);
  }

  /**
   * Clear videos cache
   */
  limpiarCache(): void {
    this.videosSubject.next([]);
  }
}