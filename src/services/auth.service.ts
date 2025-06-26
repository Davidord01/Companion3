/**
 * Servicio de autenticación
 * Maneja el registro y estado de usuario
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Usuario {
  nombre: string;
  apellidos: string;
  email: string;
  pais: string;
  fechaRegistro: Date;
}

export interface DatosRegistro {
  nombre: string;
  apellidos: string;
  email: string;
  pais: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioSubject = new BehaviorSubject<Usuario | null>(null);
  private autenticadoSubject = new BehaviorSubject<boolean>(false);

  // Lista de países
  readonly paises = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
    'Cuba', 'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras',
    'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
    'República Dominicana', 'Uruguay', 'Venezuela', 'Estados Unidos',
    'Canadá', 'Francia', 'Alemania', 'Italia', 'Reino Unido', 'Japón',
    'China', 'Corea del Sur', 'Australia', 'Nueva Zelanda', 'Rusia',
    'India', 'Sudáfrica', 'Egipto', 'Marruecos', 'Nigeria', 'Kenia'
  ].sort();

  constructor() {
    // Verificar si hay usuario guardado en localStorage
    this.cargarUsuarioGuardado();
  }

  /**
   * Observable del usuario actual
   */
  get usuario$(): Observable<Usuario | null> {
    return this.usuarioSubject.asObservable();
  }

  /**
   * Observable del estado de autenticación
   */
  get autenticado$(): Observable<boolean> {
    return this.autenticadoSubject.asObservable();
  }

  /**
   * Obtiene el usuario actual
   */
  get usuarioActual(): Usuario | null {
    return this.usuarioSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  get estaAutenticado(): boolean {
    return this.autenticadoSubject.value;
  }

  /**
   * Registra un nuevo usuario
   */
  registrarUsuario(datos: DatosRegistro): Observable<boolean> {
    return new Observable(observer => {
      // Simular delay de registro
      setTimeout(() => {
        const nuevoUsuario: Usuario = {
          ...datos,
          fechaRegistro: new Date()
        };

        // Guardar en localStorage
        localStorage.setItem('usuario_tlou', JSON.stringify(nuevoUsuario));
        
        // Actualizar estado
        this.usuarioSubject.next(nuevoUsuario);
        this.autenticadoSubject.next(true);

        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  /**
   * Cierra la sesión del usuario
   */
  cerrarSesion(): void {
    localStorage.removeItem('usuario_tlou');
    this.usuarioSubject.next(null);
    this.autenticadoSubject.next(false);
  }

  /**
   * Carga el usuario guardado desde localStorage
   */
  private cargarUsuarioGuardado(): void {
    const usuarioGuardado = localStorage.getItem('usuario_tlou');
    if (usuarioGuardado) {
      try {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioSubject.next(usuario);
        this.autenticadoSubject.next(true);
      } catch (error) {
        console.error('Error al cargar usuario guardado:', error);
        localStorage.removeItem('usuario_tlou');
      }
    }
  }

  /**
   * Valida formato de email
   */
  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}