/**
 * Componente Formulario de Registro
 * Modal para registro de nuevos usuarios
 */

import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, DatosRegistro } from '../../services/auth.service';

interface ErroresValidacion {
  nombre?: string;
  apellidos?: string;
  email?: string;
  pais?: string;
}

@Component({
  selector: 'app-formulario-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="cerrarModal($event)">
      <div class="modal-container">
        <!-- Encabezado del modal -->
        <div class="modal-header">
          <h2 class="modal-title">
            <span class="title-icon">🧟</span>
            Únete a los Supervivientes
          </h2>
          <button 
            class="btn-cerrar"
            (click)="cerrarModal()"
            aria-label="Cerrar formulario"
          >
            ×
          </button>
        </div>

        <!-- Contenido del formulario -->
        <div class="modal-body">
          <p class="modal-description">
            Regístrate para acceder a contenido exclusivo del mundo post-apocalíptico de The Last of Us.
          </p>

          <!-- Estado de carga -->
          <div class="loading-state" *ngIf="enviandoFormulario">
            <div class="loading-spinner"></div>
            <p>Procesando registro...</p>
          </div>

          <!-- Mensaje de éxito -->
          <div class="success-message" *ngIf="registroExitoso">
            <div class="success-icon">✅</div>
            <h3>¡Gracias por registrarte en este mundo post-apocalíptico!</h3>
            <p>Redirigiendo en {{ tiempoRestante }} segundos...</p>
            <div class="countdown-bar">
              <div class="countdown-progress" [style.width.%]="progresoCountdown"></div>
            </div>
          </div>

          <!-- Formulario de registro -->
          <form 
            class="registro-form"
            *ngIf="!enviandoFormulario && !registroExitoso"
            (ngSubmit)="enviarFormulario()"
            #formulario="ngForm"
          >
            <!-- Campo Nombre -->
            <div class="form-group">
              <label for="nombre" class="form-label">
                Nombre Completo *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                class="form-input"
                [class.error]="errores.nombre"
                [(ngModel)]="datosFormulario.nombre"
                placeholder="Ingresa tu nombre"
                required
              >
              <div class="error-message" *ngIf="errores.nombre">
                {{ errores.nombre }}
              </div>
            </div>

            <!-- Campo Apellidos -->
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
                [(ngModel)]="datosFormulario.apellidos"
                placeholder="Ingresa tus apellidos"
                required
              >
              <div class="error-message" *ngIf="errores.apellidos">
                {{ errores.apellidos }}
              </div>
            </div>

            <!-- Campo Email -->
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
                [(ngModel)]="datosFormulario.email"
                placeholder="ejemplo@correo.com"
                required
              >
              <div class="error-message" *ngIf="errores.email">
                {{ errores.email }}
              </div>
            </div>

            <!-- Campo País -->
            <div class="form-group">
              <label for="pais" class="form-label">
                País *
              </label>
              <select
                id="pais"
                name="pais"
                class="form-select"
                [class.error]="errores.pais"
                [(ngModel)]="datosFormulario.pais"
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

            <!-- Botones de acción -->
            <div class="form-actions">
              <button 
                type="button"
                class="btn btn-secundario"
                (click)="cerrarModal()"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                class="btn btn-primario"
                [disabled]="!formularioValido()"
              >
                <span class="btn-icon">🎮</span>
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
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

    .modal-container {
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

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--espaciado-md);
      border-bottom: 1px solid var(--color-acento);
      background: linear-gradient(135deg, var(--color-fondo-oscuro), var(--color-fondo-medio));
    }

    .modal-title {
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

    .modal-body {
      padding: var(--espaciado-md);
    }

    .modal-description {
      color: rgba(245, 245, 245, 0.8);
      text-align: center;
      margin-bottom: var(--espaciado-md);
      line-height: 1.6;
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

    .countdown-bar {
      width: 100%;
      height: 6px;
      background: rgba(245, 245, 245, 0.2);
      border-radius: 3px;
      overflow: hidden;
      margin-top: var(--espaciado-sm);
    }

    .countdown-progress {
      height: 100%;
      background: linear-gradient(90deg, var(--color-supervivencia), var(--color-acento));
      transition: width 0.1s linear;
    }

    .registro-form {
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
      display: flex;
      gap: var(--espaciado-sm);
      justify-content: flex-end;
      margin-top: var(--espaciado-md);
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
      .modal-container {
        margin: var(--espaciado-sm);
        max-height: 95vh;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .modal-header {
        padding: var(--espaciado-sm);
      }

      .modal-body {
        padding: var(--espaciado-sm);
      }

      .modal-title {
        font-size: 1.2rem;
      }
    }
  `]
})
export class FormularioRegistroComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() registroCompletado = new EventEmitter<void>();

  datosFormulario: DatosRegistro = {
    nombre: '',
    apellidos: '',
    email: '',
    pais: ''
  };

  errores: ErroresValidacion = {};
  enviandoFormulario = false;
  registroExitoso = false;
  tiempoRestante = 3;
  progresoCountdown = 100;
  paises: string[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.paises = this.authService.paises;
  }

  /**
   * Valida el formulario completo
   */
  formularioValido(): boolean {
    return !!(
      this.datosFormulario.nombre.trim() &&
      this.datosFormulario.apellidos.trim() &&
      this.datosFormulario.email.trim() &&
      this.datosFormulario.pais &&
      this.authService.validarEmail(this.datosFormulario.email)
    );
  }

  /**
   * Valida los campos del formulario
   */
  private validarFormulario(): boolean {
    this.errores = {};
    let esValido = true;

    // Validar nombre
    if (!this.datosFormulario.nombre.trim()) {
      this.errores.nombre = 'El nombre es obligatorio';
      esValido = false;
    } else if (this.datosFormulario.nombre.trim().length < 2) {
      this.errores.nombre = 'El nombre debe tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar apellidos
    if (!this.datosFormulario.apellidos.trim()) {
      this.errores.apellidos = 'Los apellidos son obligatorios';
      esValido = false;
    } else if (this.datosFormulario.apellidos.trim().length < 2) {
      this.errores.apellidos = 'Los apellidos deben tener al menos 2 caracteres';
      esValido = false;
    }

    // Validar email
    if (!this.datosFormulario.email.trim()) {
      this.errores.email = 'El correo electrónico es obligatorio';
      esValido = false;
    } else if (!this.authService.validarEmail(this.datosFormulario.email)) {
      this.errores.email = 'El formato del correo electrónico no es válido';
      esValido = false;
    }

    // Validar país
    if (!this.datosFormulario.pais) {
      this.errores.pais = 'Debes seleccionar un país';
      esValido = false;
    }

    return esValido;
  }

  /**
   * Envía el formulario de registro
   */
  enviarFormulario() {
    if (!this.validarFormulario()) {
      return;
    }

    this.enviandoFormulario = true;

    this.authService.registrarUsuario(this.datosFormulario).subscribe({
      next: (exito) => {
        if (exito) {
          this.enviandoFormulario = false;
          this.registroExitoso = true;
          this.iniciarCountdown();
        }
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        this.enviandoFormulario = false;
        // Aquí podrías mostrar un mensaje de error
      }
    });
  }

  /**
   * Inicia el countdown de redirección
   */
  private iniciarCountdown() {
    const intervalo = setInterval(() => {
      this.tiempoRestante--;
      this.progresoCountdown = (this.tiempoRestante / 3) * 100;

      if (this.tiempoRestante <= 0) {
        clearInterval(intervalo);
        this.registroCompletado.emit();
        this.cerrarModal();
      }
    }, 1000);
  }

  /**
   * Cierra el modal
   */
  cerrarModal(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.cerrar.emit();
  }
}