/**
 * Unit tests for VideoUploadComponent
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { VideoUploadComponent } from './video-upload.component';
import { VideoApiService } from '../../services/video-api.service';

describe('VideoUploadComponent', () => {
  let component: VideoUploadComponent;
  let fixture: ComponentFixture<VideoUploadComponent>;
  let mockVideoService: jasmine.SpyObj<VideoApiService>;

  beforeEach(async () => {
    const videoServiceSpy = jasmine.createSpyObj('VideoApiService', [
      'subirArchivo',
      'agregarVideoYoutube',
      'validarFormato',
      'validarTamano',
      'formatearTamano',
      'esUrlYoutube',
      'extraerIdYoutube',
      'obtenerThumbnailYoutube'
    ]);

    await TestBed.configureTestingModule({
      imports: [VideoUploadComponent, FormsModule],
      providers: [
        { provide: VideoApiService, useValue: videoServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VideoUploadComponent);
    component = fixture.componentInstance;
    mockVideoService = TestBed.inject(VideoApiService) as jasmine.SpyObj<VideoApiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('File Upload', () => {
    it('should process valid file correctly', () => {
      const mockFile = new File(['test'], 'test-video.mp4', { type: 'video/mp4' });
      mockVideoService.validarFormato.and.returnValue(true);
      mockVideoService.validarTamano.and.returnValue(true);

      component.procesarArchivo(mockFile);

      expect(component.archivoSeleccionado).toBe(mockFile);
      expect(component.metadatosArchivo.nombre).toBe('test-video');
    });

    it('should reject invalid file format', () => {
      const mockFile = new File(['test'], 'test-video.txt', { type: 'text/plain' });
      mockVideoService.validarFormato.and.returnValue(false);

      spyOn(component, 'mostrarError');
      component.procesarArchivo(mockFile);

      expect(component.mostrarError).toHaveBeenCalled();
      expect(component.archivoSeleccionado).toBe(null);
    });

    it('should upload file successfully', () => {
      const mockFile = new File(['test'], 'test-video.mp4', { type: 'video/mp4' });
      const mockVideo = {
        id: '1',
        nombre: 'Test Video',
        descripcion: 'Test description',
        tipo: 'video' as const,
        formato: 'mp4',
        url: '/test-video.mp4',
        tamano: mockFile.size,
        fechaSubida: new Date(),
        uploadedBy: 'user1',
        views: 0,
        isPublic: true
      };

      component.archivoSeleccionado = mockFile;
      component.metadatosArchivo = { nombre: 'Test Video', descripcion: 'Test description' };

      mockVideoService.subirArchivo.and.returnValue(of({
        progreso: 100,
        completado: true,
        video: mockVideo
      }));

      spyOn(component.onUpload, 'emit');

      component.subirArchivo();

      expect(mockVideoService.subirArchivo).toHaveBeenCalledWith(
        mockFile,
        'Test Video',
        'Test description'
      );
      expect(component.onUpload.emit).toHaveBeenCalledWith(mockVideo);
    });
  });

  describe('YouTube Integration', () => {
    it('should validate YouTube URL correctly', () => {
      mockVideoService.esUrlYoutube.and.returnValue(true);
      mockVideoService.extraerIdYoutube.and.returnValue('dQw4w9WgXcQ');

      component.datosYoutube.url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      component.validarUrlYoutube();

      expect(component.urlYoutubeValida).toBe(true);
      expect(component.videoIdYoutube).toBe('dQw4w9WgXcQ');
    });

    it('should add YouTube video successfully', () => {
      const mockVideo = {
        id: '1',
        nombre: 'YouTube Video',
        descripcion: 'YouTube description',
        tipo: 'youtube' as const,
        formato: 'youtube',
        url: 'https://www.youtube.com/watch?v=test',
        tamano: 0,
        fechaSubida: new Date(),
        uploadedBy: 'user1',
        views: 0,
        isPublic: true
      };

      component.datosYoutube = {
        url: 'https://www.youtube.com/watch?v=test',
        nombre: 'YouTube Video',
        descripcion: 'YouTube description'
      };
      component.urlYoutubeValida = true;

      mockVideoService.agregarVideoYoutube.and.returnValue(of({
        message: 'YouTube video added successfully',
        video: mockVideo
      }));

      spyOn(component.onUpload, 'emit');

      component.agregarVideoYoutube();

      expect(mockVideoService.agregarVideoYoutube).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=test',
        'YouTube Video',
        'YouTube description'
      );
      expect(component.onUpload.emit).toHaveBeenCalledWith(mockVideo);
    });
  });

  describe('Error Handling', () => {
    it('should handle upload errors', () => {
      const mockFile = new File(['test'], 'test-video.mp4', { type: 'video/mp4' });
      component.archivoSeleccionado = mockFile;
      component.metadatosArchivo = { nombre: 'Test Video', descripcion: '' };

      mockVideoService.subirArchivo.and.returnValue(
        throwError(() => new Error('Upload failed'))
      );

      spyOn(component, 'mostrarError');

      component.subirArchivo();

      expect(component.mostrarError).toHaveBeenCalled();
      expect(component.subiendoArchivo).toBe(false);
    });
  });
});