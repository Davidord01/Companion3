/**
 * Unit tests for AuthApiService
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthApiService, DatosRegistro, DatosLogin } from './auth-api.service';

describe('AuthApiService', () => {
  let service: AuthApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthApiService]
    });
    service = TestBed.inject(AuthApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Authentication', () => {
    it('should register user successfully', () => {
      const mockUser = {
        id: '1',
        nombre: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        pais: 'España',
        role: 'user',
        fechaRegistro: new Date(),
        preferences: { theme: 'dark', autoplay: true, quality: 'auto' }
      };

      const registroData: DatosRegistro = {
        nombre: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        password: 'TestPassword123!',
        pais: 'España'
      };

      const mockResponse = {
        message: 'User registered successfully',
        user: mockUser,
        accessToken: 'mock-token'
      };

      service.registrarUsuario(registroData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.estaAutenticado).toBe(true);
        expect(service.usuarioActual).toEqual(mockUser);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registroData);
      req.flush(mockResponse);
    });

    it('should login user successfully', () => {
      const mockUser = {
        id: '1',
        nombre: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        pais: 'España',
        role: 'user',
        fechaRegistro: new Date(),
        preferences: { theme: 'dark', autoplay: true, quality: 'auto' }
      };

      const loginData: DatosLogin = {
        email: 'test@example.com',
        password: 'TestPassword123!'
      };

      const mockResponse = {
        message: 'Login successful',
        user: mockUser,
        accessToken: 'mock-token'
      };

      service.login(loginData).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.estaAutenticado).toBe(true);
        expect(service.usuarioActual).toEqual(mockUser);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginData);
      req.flush(mockResponse);
    });

    it('should logout user successfully', () => {
      // Set up authenticated state
      localStorage.setItem('accessToken', 'mock-token');
      localStorage.setItem('userData', JSON.stringify({ id: '1', email: 'test@example.com' }));

      service.logout().subscribe(response => {
        expect(response.message).toBe('Logout successful');
        expect(service.estaAutenticado).toBe(false);
        expect(service.usuarioActual).toBe(null);
        expect(localStorage.getItem('accessToken')).toBe(null);
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/logout');
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Logout successful' });
    });
  });

  describe('Validation', () => {
    it('should validate email correctly', () => {
      expect(service.validarEmail('test@example.com')).toBe(true);
      expect(service.validarEmail('invalid-email')).toBe(false);
      expect(service.validarEmail('')).toBe(false);
    });

    it('should validate password strength', () => {
      const weakPassword = service.validarPassword('123');
      expect(weakPassword.valid).toBe(false);
      expect(weakPassword.errors.length).toBeGreaterThan(0);

      const strongPassword = service.validarPassword('TestPassword123!');
      expect(strongPassword.valid).toBe(true);
      expect(strongPassword.errors.length).toBe(0);
    });
  });

  describe('Token Management', () => {
    it('should refresh token successfully', () => {
      const mockResponse = { accessToken: 'new-mock-token' };

      service.refreshToken().subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(service.accessToken).toBe('new-mock-token');
      });

      const req = httpMock.expectOne('http://localhost:3001/api/auth/refresh');
      expect(req.request.method).toBe('POST');
      req.flush(mockResponse);
    });
  });
});