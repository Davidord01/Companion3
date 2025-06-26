/**
 * Authentication Forms Component
 * Handles login and registration forms with validation
 */

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthApiService, DatosRegistro, DatosLogin } from '../../services/auth-api.service';

interface ErroresValidacion {
  nombre?: string;
  apellidos?: string;
  email?: string;
  password?: string;
  pais?: string;
  general?: string;
}

@Component({
  selector: 'app-auth-forms',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="auth-modal-overlay" (click)="cerrarModal($event)">
      <div class="auth-modal-container">
        <!-- Encabezado del modal -->
        <div class="auth-modal-header">
          <h2 class="auth-modal-title">
            <span class="title-icon">🎮</span>
            {{ modoActual === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta' }}
          </h2>
          <button 
            class="btn-cerrar"
            (click)="cerrarModal()"
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <!-- Contenido del modal -->
        <div class="auth-modal-body">
          <!-- Pestañas -->
          <div class="auth-tabs">
            <button 
              class="auth-tab"
              [class.active]="modoActual === 'login'"
              (click)="cambiarModo('login')"
            >
              Iniciar Sesión
            </button>
            <button 
              class="auth-tab"
              [class.active]="modoActual === 'register'"
              (click)="cambiarModo('register')"
            >
              Registrarse
            </button>
          </div>

          <!-- Estado de carga -->
          <div class="loading-state" *ngIf="enviandoFormulario">
            <div class="loading-spinner"></div>
            <p>{{ modoActual === 'login' ? 'Iniciando sesión...' : 'Creando cuenta...' }}</p>
          </div>

          <!-- Mensaje de éxito -->
          <div class="success-message" *ngIf="operacionExitosa">
            <div class="success-icon">✅</div>
            <h3>{{ modoActual === 'login' ? '¡Bienvenido de vuelta!' : '¡Cuenta creada exitosamente!' }}</h3>
            <p>Redirigiendo...</p>
          </div>

          <!-- Formulario de Login -->
          <form 
            class="auth-form"
            *ngIf="modoActual === 'login' && !enviandoFormulario && !operacionExitosa"
            (ngSubmit)="enviarLogin()"
            #loginForm="ngForm"
          >
            <!-- Email -->
            <div class="form-group">
              <label for="loginEmail" class="form-label">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                class="form-input"
                [class.error]="errores.email"
                [(ngModel)]="datosLogin.email"
                placeholder="ejemplo@correo.com"
                required
                autocomplete="email"
              >
              <div class="error-message" *ngIf="errores.email">
                {{ errores.email }}
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="loginPassword" class="form-label">
                Contraseña *
              </label>
              <div class="password-input-container">
                <input
                  [type]="mostrarPassword ? 'text' : 'password'"
                  id="loginPassword"
                  name="password"
                  class="form-input"
                  [class.error]="errores.password"
                  [(ngModel)]="datosLogin.password"
                  placeholder="Tu contraseña"
                  required
                  autocomplete="current-password"
                >
                <button 
                  type="button"
                  class="password-toggle"
                  (click)="togglePassword()"
                  [attr.aria-label]="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  {{ mostrarPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div class="error-message" *ngIf="errores.password">
                {{ errores.password }}
              </div>
            </div>

            <!-- Error general -->
            <div class="error-message" *ngIf="errores.general">
              {{ errores.general }}
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button 
                type="submit"
                class="btn btn-primario"
                [disabled]="!formularioLoginValido()"
              >
                <span class="btn-icon">🚀</span>
                Iniciar Sesión
              </button>
            </div>

            <!-- Enlaces adicionales -->
            <div class="auth-links">
              <p>¿No tienes cuenta? 
                <button type="button" class="link-button" (click)="cambiarModo('register')">
                  Regístrate aquí
                </button>
              </p>
            </div>
          </form>

          <!-- Formulario de Registro -->
          <form 
            class="auth-form"
            *ngIf="modoActual === 'register' && !enviandoFormulario && !operacionExitosa"
            (ngSubmit)="enviarRegistro()"
            #registerForm="ngForm"
          >
            <!-- Nombre -->
            <div class="form-group">
              <label for="nombre" class="form-label">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                class="form-input"
                [class.error]="errores.nombre"
                [(ngModel)]="datosRegistro.nombre"
                placeholder="Tu nombre"
                required
                autocomplete="given-name"
              >
              <div class="error-message" *ngIf="errores.nombre">
                {{ errores.nombre }}
              </div>
            </div>

            <!-- Apellidos -->
            <div class="form-group">
              <label for="apellidos" class="form-label">
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                class="form-input"
                [class.error]="errores.apellidos"
                [(ngModel)]="datosRegistro.apellidos"
                placeholder="Tus apellidos"
                required
                autocomplete="family-name"
              >
              <div class="error-message" *ngIf="errores.apellidos">
                {{ errores.apellidos }}
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="form-label">
                Correo Electrónico *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-input"
                [class.error]="errores.email"
                [(ngModel)]="datosRegistro.email"
                placeholder="ejemplo@correo.com"
                required
                autocomplete="email"
              >
              <div class="error-message" *ngIf="errores.email">
                {{ errores.email }}
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="password" class="form-label">
                Contraseña *
              </label>
              <div class="password-input-container">
                <input
                  [type]="mostrarPassword ? 'text' : 'password'"
                  id="password"
                  name="password"
                  class="form-input"
                  [class.error]="errores.password"
                  [(ngModel)]="datosRegistro.password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  autocomplete="new-password"
                >
                <button 
                  type="button"
                  class="password-toggle"
                  (click)="togglePassword()"
                  [attr.aria-label]="mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                >
                  {{ mostrarPassword ? '👁️' : '👁️‍🗨️' }}
                </button>
              </div>
              <div class="password-strength" *ngIf="datosRegistro.password">
                <div class="strength-bar">
                  <div 
                    class="strength-fill"
                    [style.width.%]="fortalezaPassword.porcentaje"
                    [attr.data-strength]="fortalezaPassword.nivel"
                  ></div>
                </div>
                <span class="strength-text" [attr.data-strength]="fortalezaPassword.nivel">
                  {{ fortalezaPassword.texto }}
                </span>
              </div>
              <div class="error-message" *ngIf="errores.password">
                {{ errores.password }}
              </div>
            </div>

            <!-- País -->
            <div class="form-group">
              <label for="pais" class="form-label">
                País *
              </label>
              <select
                id="pais"
                name="pais"
                class="form-select"
                [class.error]="errores.pais"
                [(ngModel)]="datosRegistro.pais"
                required
              >
                <option value="">Selecciona tu país</option>
                <option 
                  *ngFor="let pais of paises" 
                  [value]="pais"
                >
                  {{ pais }}
                </option>
              </select>
              <div class="error-message" *ngIf="errores.pais">
                {{ errores.pais }}
              </div>
            </div>

            <!-- Error general -->
            <div class="error-message" *ngIf="errores.general">
              {{ errores.general }}
            </div>

            <!-- Botones de acción -->
            <div class="form-actions">
              <button 
                type="submit"
                class="btn btn-primario"
                [disabled]="!formularioRegistroValido()"
              >
                <span class="btn-icon">🎮</span>
                Crear Cuenta
              </button>
            </div>

            <!-- Enlaces adicionales -->
            <div class="auth-links">
              <p>¿Ya tienes cuenta? 
                <button type="button" class="link-button" (click)="cambiarModo('login')">
                  Inicia sesión aquí
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      padding: var(--espaciado-sm);
      animation: fadeIn 0.3s ease-out;
    }

    .auth-modal-container {
      background: var(--color-fondo-medio);
      border-radius: 16px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
      border: 2px solid var(--color-acento);
      box-shadow: var(--sombra-fuerte);
      animation: slideInUp 0.4s ease-out;
    }

    .auth-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--espaciado-md);
      border-bottom: 1px solid var(--color-acento);
      background: linear-gradient(135deg, var(--color-fondo-oscuro), var(--color-fondo-medio));
    }

    .auth-modal-title {
      color: var(--color-texto-claro);
      font-family: var(--fuente-titulo);
      font-size: 1.5rem;
      margin: 0;
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .title-icon {
      font-size: 1.8rem;
      animation: pulso 2s ease-in-out infinite;
    }

    .btn-cerrar {
      width: 40px;
      height: 40px;
      background: var(--color-peligro);
      border: none;
      border-radius: 50%;
      color: var(--color-texto-claro);
      font-size: 1.5rem;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-cerrar:hover {
      background: #dc143c;
      transform: scale(1.1);
    }

    .auth-modal-body {
      padding: var(--espaciado-md);
    }

    .auth-tabs {
      display: flex;
      margin-bottom: var(--espaciado-md);
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--color-acento);
    }

    .auth-tab {
      flex: 1;
      padding: var(--espaciado-sm);
      background: transparent;
      border: none;
      color: var(--color-acento);
      font-family: var(--fuente-titulo);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-rapida);
    }

    .auth-tab.active {
      background: var(--color-acento);
      color: var(--color-texto-claro);
    }

    .auth-tab:hover:not(.active) {
      background: rgba(255, 107, 53, 0.1);
    }

    .loading-state {
      text-align: center;
      padding: var(--espaciado-lg);
      color: var(--color-texto-claro);
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 107, 53, 0.3);
      border-top: 3px solid var(--color-acento);
      border-radius: 50%;
      animation: girar 1s linear infinite;
      margin: 0 auto var(--espaciado-sm);
    }

    .success-message {
      text-align: center;
      padding: var(--espaciado-lg);
      color: var(--color-texto-claro);
    }

    .success-icon {
      font-size: 3rem;
      margin-bottom: var(--espaciado-sm);
    }

    .success-message h3 {
      color: var(--color-supervivencia);
      margin-bottom: var(--espaciado-sm);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-md);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: var(--espaciado-xs);
    }

    .form-label {
      color: var(--color-acento);
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .form-input,
    .form-select {
      padding: var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border: 2px solid rgba(245, 245, 245, 0.2);
      border-radius: 8px;
      color: var(--color-texto-claro);
      font-size: 1rem;
      transition: all var(--transicion-rapida);
    }

    .form-input:focus,
    .form-select:focus {
      outline: none;
      border-color: var(--color-acento);
      box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
    }

    .form-input.error,
    .form-select.error {
      border-color: var(--color-peligro);
      box-shadow: 0 0 10px rgba(178, 34, 34, 0.3);
    }

    .password-input-container {
      position: relative;
    }

    .password-toggle {
      position: absolute;
      right: var(--espaciado-sm);
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(245, 245, 245, 0.6);
      cursor: pointer;
      font-size: 1.2rem;
      transition: color var(--transicion-rapida);
    }

    .password-toggle:hover {
      color: var(--color-acento);
    }

    .password-strength {
      margin-top: var(--espaciado-xs);
    }

    .strength-bar {
      height: 4px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: var(--espaciado-xs);
    }

    .strength-fill {
      height: 100%;
      transition: all var(--transicion-media);
    }

    .strength-fill[data-strength="weak"] {
      background: var(--color-peligro);
    }

    .strength-fill[data-strength="medium"] {
      background: var(--color-acento);
    }

    .strength-fill[data-strength="strong"] {
      background: var(--color-supervivencia);
    }

    .strength-text {
      font-size: 0.8rem;
      font-weight: 500;
    }

    .strength-text[data-strength="weak"] {
      color: var(--color-peligro);
    }

    .strength-text[data-strength="medium"] {
      color: var(--color-acento);
    }

    .strength-text[data-strength="strong"] {
      color: var(--color-supervivencia);
    }

    .form-select {
      cursor: pointer;
    }

    .form-select option {
      background: var(--color-fondo-oscuro);
      color: var(--color-texto-claro);
    }

    .error-message {
      color: var(--color-peligro);
      font-size: 0.8rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
    }

    .error-message::before {
      content: '⚠️';
      font-size: 0.9rem;
    }

    .form-actions {
      margin-top: var(--espaciado-md);
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-sm) var(--espaciado-md);
      border-radius: 8px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      cursor: pointer;
      transition: all var(--transicion-media);
      border: 2px solid transparent;
      width: 100%;
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

    .btn-icon {
      font-size: 1.1rem;
    }

    .auth-links {
      text-align: center;
      margin-top: var(--espaciado-md);
      color: rgba(245, 245, 245, 0.8);
    }

    .link-button {
      background: none;
      border: none;
      color: var(--color-acento);
      cursor: pointer;
      text-decoration: underline;
      font-weight: 600;
      transition: color var(--transicion-rapida);
    }

    .link-button:hover {
      color: #ff8c69;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideInUp {
      from {
        transform: translateY(50px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes girar {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .auth-modal-container {
        margin: var(--espaciado-sm);
        max-height: 95vh;
      }

      .auth-modal-header {
        padding: var(--espaciado-sm);
      }

      .auth-modal-body {
        padding: var(--espaciado-sm);
      }

      .auth-modal-title {
        font-size: 1.2rem;
      }
    }
  `]
})
export class AuthFormsComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() autenticacionCompletada = new EventEmitter<void>();

  modoActual: 'login' | 'register' = 'login';
  mostrarPassword = false;
  enviandoFormulario = false;
  operacionExitosa = false;

  datosLogin: DatosLogin = {
    email: '',
    password: ''
  };

  datosRegistro: DatosRegistro = {
    nombre: '',
    apellidos: '',
    email: '',
    password: '',
    pais: ''
  };

  errores: ErroresValidacion = {};

  paises: string[] = [
    'Argentina', 'Bolivia', 'Brasil', 'Chile', 'Colombia', 'Costa Rica',
    'Cuba', 'Ecuador', 'El Salvador', 'España', 'Guatemala', 'Honduras',
    'México', 'Nicaragua', 'Panamá', 'Paraguay', 'Perú', 'Puerto Rico',
    'República Dominicana', 'Uruguay', 'Venezuela', 'Estados Unidos',
    'Canadá', 'Francia', 'Alemania', 'Italia', 'Reino Unido', 'Japón',
    'China', 'Corea del Sur', 'Australia', 'Nueva Zelanda', 'Rusia',
    'India', 'Sudáfrica', 'Egipto', 'Marruecos', 'Nigeria', 'Kenia'
  ].sort();

  constructor(private authService: AuthApiService) {}

  ngOnInit() {
    // Focus on first input when modal opens
    setTimeout(() => {
      const firstInput = document.querySelector('.auth-form input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  /**
   * Change between login and register modes
   */
  cambiarModo(modo: 'login' | 'register') {
    this.modoActual = modo;
    this.errores = {};
    this.limpiarFormularios();
  }

  /**
   * Toggle password visibility
   */
  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  /**
   * Get password strength
   */
  get fortalezaPassword() {
    const password = this.datosRegistro.password;
    if (!password) {
      return { nivel: 'weak', porcentaje: 0, texto: '' };
    }

    const validation = this.authService.validarPassword(password);
    const score = Math.max(0, 5 - validation.errors.length);

    if (score <= 2) {
      return { nivel: 'weak', porcentaje: 33, texto: 'Débil' };
    } else if (score <= 4) {
      return { nivel: 'medium', porcentaje: 66, texto: 'Media' };
    } else {
      return { nivel: 'strong', porcentaje: 100, texto: 'Fuerte' };
    }
  }

  /**
   * Validate login form
   */
  formularioLoginValido(): boolean {
    return !!(
      this.datosLogin.email.trim() &&
      this.datosLogin.password.trim() &&
      this.authService.validarEmail(this.datosLogin.email)
    );
  }

  /**
   * Validate registration form
   */
  formularioRegistroValido(): boolean {
    const passwordValidation = this.authService.validarPassword(this.datosRegistro.password);
    
    return !!(
      this.datosRegistro.nombre.trim() &&
      this.datosRegistro.apellidos.trim() &&
      this.datosRegistro.email.trim() &&
      this.datosRegistro.password.trim() &&
      this.datosRegistro.pais &&
      this.authService.validarEmail(this.datosRegistro.email) &&
      passwordValidation.valid
    );
  }

  /**
   * Validate login form fields
   */
  private validarLogin(): boolean {
    this.errores = {};
    let esValido = true;

    if (!this.datosLogin.email.trim()) {
      this.errores.email = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!this.authService.validarEmail(this.datosLogin.email)) {
      this.errores.email = 'El formato del correo electrónico no es válido';
      esValido = false;
    }

    if (!this.datosLogin.password.trim()) {
      this.errores.password = 'La contraseña es obligatoria';
      esValido = false;
    }

    return esValido;
  }

  /**
   * Validate registration form fields
   */
  private validarRegistro(): boolean {
    this.errores = {};
    let esValido = true;

    if (!this.datosRegistro.nombre.trim()) {
      this.errores.nombre = 'El nombre es obligatorio';
      esValido = false;
    } else if (this.datosRegistro.nombre.trim().length < 2) {
      this.errores.nombre = 'El nombre debe tener al menos 2 caracteres';
      esValido = false;
    }

    if (!this.datosRegistro.apellidos.trim()) {
      this.errores.apellidos = 'Los apellidos son obligatorios';
      esValido = false;
    } else if (this.datosRegistro.apellidos.trim().length < 2) {
      this.errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
      esValido = false;
    }

    if (!this.datosRegistro.email.trim()) {
      this.errores.email = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!this.authService.validarEmail(this.datosRegistro.email)) {
      this.errores.email = 'El formato del correo electrónico no es válido';
      esValido = false;
    }

    if (!this.datosRegistro.password.trim()) {
      this.errores.password = 'La contraseña es obligatoria';
      esValido = false;
    } else {
      const passwordValidation = this.authService.validarPassword(this.datosRegistro.password);
      if (!passwordValidation.valid) {
        this.errores.password = passwordValidation.errors[0];
        esValido = false;
      }
    }

    if (!this.datosRegistro.pais) {
      this.errores.pais = 'Debes seleccionar un país';
      esValido = false;
    }

    return esValido;
  }

  /**
   * Submit login form
   */
  enviarLogin() {
    if (!this.validarLogin()) {
      return;
    }

    this.enviandoFormulario = true;
    this.errores = {};

    this.authService.login(this.datosLogin).subscribe({
      next: (response) => {
        this.enviandoFormulario = false;
        this.operacionExitosa = true;
        
        setTimeout(() => {
          this.autenticacionCompletada.emit();
          this.cerrarModal();
        }, 1500);
      },
      error: (error) => {
        this.enviandoFormulario = false;
        this.errores.general = error.message || 'Error al iniciar sesión';
      }
    });
  }

  /**
   * Submit registration form
   */
  enviarRegistro() {
    if (!this.validarRegistro()) {
      return;
    }

    this.enviandoFormulario = true;
    this.errores = {};

    this.authService.registrarUsuario(this.datosRegistro).subscribe({
      next: (response) => {
        this.enviandoFormulario = false;
        this.operacionExitosa = true;
        
        setTimeout(() => {
          this.autenticacionCompletada.emit();
          this.cerrarModal();
        }, 1500);
      },
      error: (error) => {
        this.enviandoFormulario = false;
        this.errores.general = error.message || 'Error al crear la cuenta';
      }
    });
  }

  /**
   * Clear form data
   */
  private limpiarFormularios() {
    this.datosLogin = { email: '', password: '' };
    this.datosRegistro = { nombre: '', apellidos: '', email: '', password: '', pais: '' };
    this.mostrarPassword = false;
  }

  /**
   * Close modal
   */
  cerrarModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.cerrar.emit();
  }
}