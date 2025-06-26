/**
 * Unit tests for VideoApiService
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { VideoApiService, VideoData } from './video-api.service';

describe('VideoApiService', () => {
  let service: VideoApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [VideoApiService]
    });
    service = TestBed.inject(VideoApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('Video Operations', () => {
    it('should fetch videos successfully', () => {
      const mockVideos: VideoData[] = [
        {
          id: '1',
          nombre: 'Test Video',
          descripcion: 'Test description',
          tipo: 'video',
          formato: 'mp4',
          url: '/test-video.mp4',
          tamano: 1024000,
          fechaSubida: new Date(),
          uploadedBy: 'user1',
          views: 100,
          isPublic: true
        }
      ];

      const mockResponse = {
        videos: mockVideos,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalVideos: 1,
          hasNext: false,
          hasPrev: false
        }
      };

      service.obtenerVideos().subscribe(response => {
        expect(response.videos).toEqual(mockVideos);
        expect(response.pagination.totalVideos).toBe(1);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/videos?');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should upload video successfully', () => {
      const mockFile = new File(['test'], 'test-video.mp4', { type: 'video/mp4' });
      const mockVideo: VideoData = {
        id: '1',
        nombre: 'Test Video',
        descripcion: 'Test description',
        tipo: 'video',
        formato: 'mp4',
        url: '/test-video.mp4',
        tamano: mockFile.size,
        fechaSubida: new Date(),
        uploadedBy: 'user1',
        views: 0,
        isPublic: true
      };

      service.subirArchivo(mockFile, 'Test Video', 'Test description').subscribe(progress => {
        if (progress.completado) {
          expect(progress.video).toEqual(mockVideo);
        }
      });

      const req = httpMock.expectOne('http://localhost:3001/api/videos/upload');
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBe(true);
    });

    it('should add YouTube video successfully', () => {
      const mockVideo: VideoData = {
        id: '1',
        nombre: 'YouTube Video',
        descripcion: 'YouTube description',
        tipo: 'youtube',
        formato: 'youtube',
        url: 'https://www.youtube.com/watch?v=test',
        tamano: 0,
        fechaSubida: new Date(),
        uploadedBy: 'user1',
        views: 0,
        isPublic: true,
        youtubeData: {
          videoId: 'test',
          title: 'YouTube Video',
          author: 'Test Author',
          publishDate: '2024-01-01',
          viewCount: '1000'
        }
      };

      const mockResponse = {
        message: 'YouTube video added successfully',
        video: mockVideo
      };

      service.agregarVideoYoutube(
        'https://www.youtube.com/watch?v=test',
        'YouTube Video',
        'YouTube description'
      ).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/videos/youtube');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });

    it('should delete video successfully', () => {
      const mockResponse = { message: 'Video deleted successfully' };

      service.eliminarVideo('1').subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/videos/1');
      expect(req.request.method).toBe('DELETE');
      req.flush(mockResponse);
    });
  });

  describe('Utility Functions', () => {
    it('should validate video format correctly', () => {
      expect(service.validarFormato('video.mp4')).toBe(true);
      expect(service.validarFormato('video.avi')).toBe(true);
      expect(service.validarFormato('video.mov')).toBe(true);
      expect(service.validarFormato('video.txt')).toBe(false);
    });

    it('should validate file size correctly', () => {
      const maxSize = 500 * 1024 * 1024; // 500MB
      expect(service.validarTamano(100 * 1024 * 1024)).toBe(true); // 100MB
      expect(service.validarTamano(600 * 1024 * 1024)).toBe(false); // 600MB
    });

    it('should format file size correctly', () => {
      expect(service.formatearTamano(1024)).toBe('1 KB');
      expect(service.formatearTamano(1024 * 1024)).toBe('1 MB');
      expect(service.formatearTamano(1024 * 1024 * 1024)).toBe('1 GB');
    });

    it('should format time correctly', () => {
      expect(service.formatearTiempo(60)).toBe('1:00');
      expect(service.formatearTiempo(3661)).toBe('1:01:01');
      expect(service.formatearTiempo(0)).toBe('0:00');
    });

    it('should detect YouTube URLs correctly', () => {
      expect(service.esUrlYoutube('https://www.youtube.com/watch?v=test')).toBe(true);
      expect(service.esUrlYoutube('https://youtu.be/test')).toBe(true);
      expect(service.esUrlYoutube('https://example.com')).toBe(false);
    });

    it('should extract YouTube video ID correctly', () => {
      expect(service.extraerIdYoutube('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(service.extraerIdYoutube('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(service.extraerIdYoutube('invalid-url')).toBe(null);
    });
  });
});