/**
 * Enhanced Videos Component
 * Complete video management with upload, player, and authentication
 */

import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

import { VideoApiService, VideoData, VideosResponse } from '../../services/video-api.service';
import { AuthApiService, Usuario } from '../../services/auth-api.service';
import { VideoUploadComponent } from '../video-upload/video-upload.component';
import { VideoPlayerComponent } from '../video-player/video-player.component';
import { AuthFormsComponent } from '../auth/auth-forms.component';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, VideoUploadComponent, VideoPlayerComponent, AuthFormsComponent],
  template: `
    <section class="videos-section">
      <div class="container">
        <!-- Header Section -->
        <div class="section-header">
          <h2 class="section-title fade-in-up">Biblioteca de Videos</h2>
          <p class="section-description fade-in-up">
            Explora, sube y gestiona videos de The Last of Us Temporada 2. 
            Desde trailers oficiales hasta gameplay exclusivo.
          </p>
        </div>

        <!-- Authentication Required Message -->
        <div class="auth-required" *ngIf="!estaAutenticado">
          <div class="auth-message">
            <div class="auth-icon">🔒</div>
            <h3>Inicia sesión para acceder a todas las funciones</h3>
            <p>Regístrate o inicia sesión para subir videos, crear listas de reproducción y más.</p>
            <button class="btn btn-primario" (click)="mostrarFormularioAuth = true">
              <span class="btn-icon">👤</span>
              Iniciar Sesión
            </button>
          </div>
        </div>

        <!-- Upload Section (Only for authenticated users) -->
        <div class="upload-section" *ngIf="estaAutenticado">
          <div class="section-toggle">
            <button 
              class="toggle-btn"
              [class.active]="mostrarUpload"
              (click)="toggleUpload()"
            >
              <span class="toggle-icon">{{ mostrarUpload ? '📤' : '📁' }}</span>
              {{ mostrarUpload ? 'Ocultar Subida' : 'Subir Video' }}
            </button>
          </div>

          <div class="upload-container" *ngIf="mostrarUpload">
            <app-video-upload
              [acceptedFormats]="['mp4', 'avi', 'mov']"
              [maxSize]="500"
              (onUpload)="onVideoUploaded($event)"
              (onError)="onUploadError($event)"
            ></app-video-upload>
          </div>
        </div>

        <!-- Filters and Search -->
        <div class="filters-section">
          <div class="search-container">
            <input
              type="text"
              placeholder="Buscar videos..."
              class="search-input"
              [(ngModel)]="filtros.search"
              (input)="onSearchChange()"
            >
            <button class="search-btn" (click)="aplicarFiltros()">
              🔍
            </button>
          </div>

          <div class="filter-controls">
            <select 
              class="filter-select"
              [(ngModel)]="filtros.tipo"
              (change)="aplicarFiltros()"
            >
              <option value="">Todos los tipos</option>
              <option value="video">Videos subidos</option>
              <option value="youtube">Videos de YouTube</option>
            </select>

            <select 
              class="filter-select"
              [(ngModel)]="filtros.sortBy"
              (change)="aplicarFiltros()"
            >
              <option value="fechaSubida">Fecha de subida</option>
              <option value="nombre">Nombre</option>
              <option value="views">Visualizaciones</option>
            </select>

            <select 
              class="filter-select"
              [(ngModel)]="filtros.sortOrder"
              (change)="aplicarFiltros()"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>

            <button class="filter-btn" (click)="limpiarFiltros()">
              Limpiar
            </button>
          </div>
        </div>

        <!-- Main Video Player -->
        <div class="main-player" *ngIf="videoSeleccionado">
          <app-video-player
            [video]="videoSeleccionado"
            [controls]="{
              play: true,
              volume: true,
              quality: true,
              fullscreen: true,
              progress: true,
              time: true
            }"
            [showInfo]="true"
            [autoplay]="false"
            (onError)="onPlayerError($event)"
          ></app-video-player>

          <div class="video-details">
            <div class="video-header">
              <h3 class="video-title">{{ videoSeleccionado.nombre }}</h3>
              <div class="video-actions" *ngIf="puedeEditarVideo(videoSeleccionado)">
                <button 
                  class="action-btn edit-btn"
                  (click)="editarVideo(videoSeleccionado)"
                  title="Editar video"
                >
                  ✏️
                </button>
                <button 
                  class="action-btn delete-btn"
                  (click)="eliminarVideo(videoSeleccionado.id)"
                  title="Eliminar video"
                >
                  🗑️
                </button>
              </div>
            </div>

            <p class="video-description" *ngIf="videoSeleccionado.descripcion">
              {{ videoSeleccionado.descripcion }}
            </p>

            <div class="video-metadata">
              <div class="metadata-row">
                <span class="metadata-label">Tipo:</span>
                <span class="metadata-value">{{ getTipoTexto(videoSeleccionado.tipo) }}</span>
              </div>
              <div class="metadata-row">
                <span class="metadata-label">Duración:</span>
                <span class="metadata-value">{{ formatearTiempo(videoSeleccionado.duracion || 0) }}</span>
              </div>
              <div class="metadata-row">
                <span class="metadata-label">Tamaño:</span>
                <span class="metadata-value">{{ formatearTamano(videoSeleccionado.tamano) }}</span>
              </div>
              <div class="metadata-row">
                <span class="metadata-label">Visualizaciones:</span>
                <span class="metadata-value">{{ videoSeleccionado.views || 0 }}</span>
              </div>
              <div class="metadata-row">
                <span class="metadata-label">Subido:</span>
                <span class="metadata-value">{{ videoSeleccionado.fechaSubida | date:'dd/MM/yyyy' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Videos Grid -->
        <div class="videos-grid" *ngIf="!cargandoVideos">
          <div 
            class="video-card fade-in-up"
            *ngFor="let video of videos; let i = index"
            [style.animation-delay]="i * 0.1 + 's'"
            [class.active]="videoSeleccionado?.id === video.id"
            (click)="seleccionarVideo(video)"
          >
            <!-- Video Thumbnail -->
            <div class="video-thumbnail">
              <img 
                [src]="video.thumbnail || getDefaultThumbnail(video)" 
                [alt]="'Thumbnail de ' + video.nombre"
                loading="lazy"
                (error)="onThumbnailError($event)"
              >
              <div class="thumbnail-overlay">
                <div class="play-button">
                  <span>▶️</span>
                </div>
                <div class="video-duration" *ngIf="video.duracion">
                  {{ formatearTiempo(video.duracion) }}
                </div>
                <div class="video-type-badge" [attr.data-type]="video.tipo">
                  {{ getTipoTexto(video.tipo) }}
                </div>
              </div>
            </div>

            <!-- Video Info -->
            <div class="video-card-info">
              <h4 class="video-card-title">{{ video.nombre }}</h4>
              <p class="video-card-description">
                {{ video.descripcion || 'Sin descripción disponible' }}
              </p>
              <div class="video-card-meta">
                <span class="meta-views">{{ video.views || 0 }} vistas</span>
                <span class="meta-date">{{ video.fechaSubida | date:'dd/MM/yyyy' }}</span>
                <span class="meta-size">{{ formatearTamano(video.tamano) }}</span>
              </div>
            </div>

            <!-- Video Actions -->
            <div class="video-card-actions" *ngIf="puedeEditarVideo(video)">
              <button 
                class="card-action-btn edit-btn"
                (click)="editarVideo(video); $event.stopPropagation()"
                title="Editar"
              >
                ✏️
              </button>
              <button 
                class="card-action-btn delete-btn"
                (click)="eliminarVideo(video.id); $event.stopPropagation()"
                title="Eliminar"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="cargandoVideos">
          <div class="loading-spinner"></div>
          <p>Cargando videos...</p>
        </div>

        <!-- Empty State -->
        <div class="empty-state" *ngIf="!cargandoVideos && videos.length === 0">
          <div class="empty-icon">📹</div>
          <h3>No hay videos disponibles</h3>
          <p *ngIf="!estaAutenticado">Inicia sesión para ver y subir videos.</p>
          <p *ngIf="estaAutenticado">Sube tu primer video para comenzar a construir tu biblioteca.</p>
          <button 
            class="btn btn-primario"
            *ngIf="estaAutenticado"
            (click)="mostrarUpload = true"
          >
            <span class="btn-icon">📤</span>
            Subir Video
          </button>
        </div>

        <!-- Pagination -->
        <div class="pagination" *ngIf="paginacion && paginacion.totalPages > 1">
          <button 
            class="pagination-btn"
            [disabled]="!paginacion.hasPrev"
            (click)="cambiarPagina(paginacion.currentPage - 1)"
          >
            ‹ Anterior
          </button>
          
          <span class="pagination-info">
            Página {{ paginacion.currentPage }} de {{ paginacion.totalPages }}
          </span>
          
          <button 
            class="pagination-btn"
            [disabled]="!paginacion.hasNext"
            (click)="cambiarPagina(paginacion.currentPage + 1)"
          >
            Siguiente ›
          </button>
        </div>
      </div>
    </section>

    <!-- Authentication Modal -->
    <app-auth-forms
      *ngIf="mostrarFormularioAuth"
      (cerrar)="mostrarFormularioAuth = false"
      (autenticacionCompletada)="onAutenticacionCompletada()"
    ></app-auth-forms>

    <!-- Edit Video Modal -->
    <div class="edit-modal-overlay" *ngIf="videoEditando" (click)="cerrarEdicion($event)">
      <div class="edit-modal-container">
        <div class="edit-modal-header">
          <h3>Editar Video</h3>
          <button class="btn-cerrar" (click)="cerrarEdicion()">×</button>
        </div>
        <div class="edit-modal-body">
          <div class="form-group">
            <label>Nombre del Video</label>
            <input
              type="text"
              [(ngModel)]="datosEdicion.nombre"
              class="form-input"
              placeholder="Nombre del video"
            >
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea
              [(ngModel)]="datosEdicion.descripcion"
              class="form-textarea"
              rows="3"
              placeholder="Descripción del video"
            ></textarea>
          </div>
          <div class="form-group">
            <label>
              <input
                type="checkbox"
                [(ngModel)]="datosEdicion.isPublic"
              >
              Video público
            </label>
          </div>
          <div class="edit-modal-actions">
            <button class="btn btn-secundario" (click)="cerrarEdicion()">
              Cancelar
            </button>
            <button class="btn btn-primario" (click)="guardarEdicion()">
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .videos-section {
      min-height: 100vh;
      padding: calc(80px + var(--espaciado-md)) 0 var(--espaciado-xl);
      background: linear-gradient(135deg, var(--color-fondo-oscuro) 0%, var(--color-fondo-medio) 100%);
    }

    .section-header {
      text-align: center;
      margin-bottom: var(--espaciado-lg);
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }

    .section-title {
      color: var(--color-texto-claro);
      margin-bottom: var(--espaciado-sm);
    }

    .section-description {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.7;
    }

    .auth-required {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      padding: var(--espaciado-lg);
      text-align: center;
      margin-bottom: var(--espaciado-lg);
      border: 1px solid var(--color-acento);
    }

    .auth-message {
      color: var(--color-texto-claro);
    }

    .auth-icon {
      font-size: 3rem;
      margin-bottom: var(--espaciado-sm);
    }

    .auth-message h3 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
    }

    .upload-section {
      margin-bottom: var(--espaciado-lg);
    }

    .section-toggle {
      text-align: center;
      margin-bottom: var(--espaciado-md);
    }

    .toggle-btn {
      display: inline-flex;
      align-items: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-sm) var(--espaciado-md);
      background: var(--gradiente-apocaliptico);
      border: 2px solid var(--color-acento);
      border-radius: 25px;
      color: var(--color-texto-claro);
      font-family: var(--fuente-titulo);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-media);
    }

    .toggle-btn:hover {
      transform: translateY(-2px);
      box-shadow: var(--sombra-media);
    }

    .toggle-icon {
      font-size: 1.2rem;
    }

    .upload-container {
      animation: slideInDown 0.3s ease-out;
    }

    .filters-section {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      padding: var(--espaciado-md);
      margin-bottom: var(--espaciado-lg);
      border: 1px solid var(--color-acento);
    }

    .search-container {
      display: flex;
      gap: var(--espaciado-sm);
      margin-bottom: var(--espaciado-md);
    }

    .search-input {
      flex: 1;
      padding: var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border: 2px solid rgba(245, 245, 245, 0.2);
      border-radius: 8px;
      color: var(--color-texto-claro);
      font-size: 1rem;
    }

    .search-input:focus {
      outline: none;
      border-color: var(--color-acento);
    }

    .search-btn {
      padding: var(--espaciado-sm) var(--espaciado-md);
      background: var(--color-acento);
      border: none;
      border-radius: 8px;
      color: var(--color-texto-claro);
      cursor: pointer;
      font-size: 1.2rem;
    }

    .filter-controls {
      display: flex;
      gap: var(--espaciado-sm);
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-select {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border: 1px solid rgba(245, 245, 245, 0.2);
      border-radius: 6px;
      color: var(--color-texto-claro);
      cursor: pointer;
    }

    .filter-btn {
      padding: var(--espaciado-xs) var(--espaciado-sm);
      background: transparent;
      border: 1px solid var(--color-acento);
      border-radius: 6px;
      color: var(--color-acento);
      cursor: pointer;
      transition: all var(--transicion-rapida);
    }

    .filter-btn:hover {
      background: var(--color-acento);
      color: var(--color-texto-claro);
    }

    .main-player {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: var(--espaciado-lg);
      border: 1px solid var(--color-acento);
    }

    .video-details {
      padding: var(--espaciado-md);
    }

    .video-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--espaciado-sm);
    }

    .video-title {
      color: var(--color-texto-claro);
      font-size: 1.4rem;
      margin: 0;
      flex: 1;
    }

    .video-actions {
      display: flex;
      gap: var(--espaciado-xs);
    }

    .action-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 1rem;
    }

    .edit-btn {
      background: rgba(255, 107, 53, 0.2);
      color: var(--color-acento);
    }

    .delete-btn {
      background: rgba(178, 34, 34, 0.2);
      color: var(--color-peligro);
    }

    .action-btn:hover {
      transform: scale(1.1);
    }

    .video-description {
      color: rgba(245, 245, 245, 0.8);
      line-height: 1.6;
      margin-bottom: var(--espaciado-md);
    }

    .video-metadata {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--espaciado-sm);
    }

    .metadata-row {
      display: flex;
      justify-content: space-between;
      padding: var(--espaciado-xs);
      background: rgba(255, 107, 53, 0.1);
      border-radius: 4px;
    }

    .metadata-label {
      color: var(--color-acento);
      font-weight: 600;
    }

    .metadata-value {
      color: var(--color-texto-claro);
    }

    .videos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: var(--espaciado-md);
      margin-bottom: var(--espaciado-lg);
    }

    .video-card {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      overflow: hidden;
      transition: all var(--transicion-media);
      cursor: pointer;
      border: 2px solid transparent;
      position: relative;
    }

    .video-card:hover,
    .video-card.active {
      transform: translateY(-5px);
      box-shadow: var(--sombra-fuerte);
      border-color: var(--color-acento);
    }

    .video-thumbnail {
      position: relative;
      height: 180px;
      overflow: hidden;
    }

    .video-thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transicion-lenta);
    }

    .video-card:hover .video-thumbnail img {
      transform: scale(1.1);
    }

    .thumbnail-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent 50%);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .video-card:hover .thumbnail-overlay {
      opacity: 1;
    }

    .play-button {
      width: 50px;
      height: 50px;
      background: rgba(255, 107, 53, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .video-duration {
      position: absolute;
      bottom: var(--espaciado-xs);
      right: var(--espaciado-xs);
      background: rgba(0, 0, 0, 0.8);
      color: var(--color-texto-claro);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.8rem;
      font-family: var(--fuente-titulo);
    }

    .video-type-badge {
      position: absolute;
      top: var(--espaciado-xs);
      left: var(--espaciado-xs);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .video-type-badge[data-type="video"] {
      background: rgba(74, 93, 35, 0.9);
      color: #90EE90;
    }

    .video-type-badge[data-type="youtube"] {
      background: rgba(255, 0, 0, 0.9);
      color: white;
    }

    .video-card-info {
      padding: var(--espaciado-md);
    }

    .video-card-title {
      color: var(--color-texto-claro);
      font-size: 1.1rem;
      margin-bottom: var(--espaciado-xs);
      line-height: 1.3;
    }

    .video-card-description {
      color: rgba(245, 245, 245, 0.7);
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: var(--espaciado-sm);
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .video-card-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: rgba(245, 245, 245, 0.6);
      flex-wrap: wrap;
      gap: var(--espaciado-xs);
    }

    .video-card-actions {
      position: absolute;
      top: var(--espaciado-xs);
      right: var(--espaciado-xs);
      display: flex;
      gap: var(--espaciado-xs);
      opacity: 0;
      transition: opacity var(--transicion-media);
    }

    .video-card:hover .video-card-actions {
      opacity: 1;
    }

    .card-action-btn {
      width: 28px;
      height: 28px;
      border: none;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all var(--transicion-rapida);
      font-size: 0.8rem;
    }

    .loading-state,
    .empty-state {
      text-align: center;
      padding: var(--espaciado-xl);
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

    .empty-icon {
      font-size: 4rem;
      margin-bottom: var(--espaciado-md);
    }

    .empty-state h3 {
      color: var(--color-acento);
      margin-bottom: var(--espaciado-sm);
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: var(--espaciado-md);
      margin-top: var(--espaciado-lg);
    }

    .pagination-btn {
      padding: var(--espaciado-sm) var(--espaciado-md);
      background: var(--color-acento);
      border: none;
      border-radius: 8px;
      color: var(--color-texto-claro);
      cursor: pointer;
      transition: all var(--transicion-rapida);
    }

    .pagination-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .pagination-btn:hover:not(:disabled) {
      background: #ff8c69;
    }

    .pagination-info {
      color: var(--color-texto-claro);
      font-family: var(--fuente-titulo);
    }

    .edit-modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 3000;
      padding: var(--espaciado-sm);
    }

    .edit-modal-container {
      background: var(--color-fondo-medio);
      border-radius: 12px;
      width: 100%;
      max-width: 500px;
      border: 1px solid var(--color-acento);
    }

    .edit-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--espaciado-md);
      border-bottom: 1px solid var(--color-acento);
    }

    .edit-modal-header h3 {
      color: var(--color-texto-claro);
      margin: 0;
    }

    .edit-modal-body {
      padding: var(--espaciado-md);
    }

    .form-group {
      margin-bottom: var(--espaciado-md);
    }

    .form-group label {
      display: block;
      color: var(--color-acento);
      font-weight: 600;
      margin-bottom: var(--espaciado-xs);
    }

    .form-input,
    .form-textarea {
      width: 100%;
      padding: var(--espaciado-sm);
      background: var(--color-fondo-oscuro);
      border: 1px solid rgba(245, 245, 245, 0.2);
      border-radius: 6px;
      color: var(--color-texto-claro);
      resize: vertical;
    }

    .edit-modal-actions {
      display: flex;
      gap: var(--espaciado-sm);
      justify-content: flex-end;
    }

    .btn {
      display: flex;
      align-items: center;
      gap: var(--espaciado-xs);
      padding: var(--espaciado-sm) var(--espaciado-md);
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transicion-media);
      border: 2px solid transparent;
    }

    .btn-primario {
      background: var(--gradiente-apocaliptico);
      color: var(--color-texto-claro);
      border-color: var(--color-acento);
    }

    .btn-secundario {
      background: transparent;
      color: var(--color-texto-claro);
      border-color: rgba(245, 245, 245, 0.3);
    }

    .btn:hover {
      transform: translateY(-2px);
    }

    .btn-icon {
      font-size: 1.1rem;
    }

    @keyframes girar {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    @keyframes slideInDown {
      from {
        transform: translateY(-20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .videos-grid {
        grid-template-columns: 1fr;
      }

      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }

      .video-metadata {
        grid-template-columns: 1fr;
      }

      .video-header {
        flex-direction: column;
        gap: var(--espaciado-sm);
      }

      .video-card-meta {
        flex-direction: column;
        align-items: flex-start;
      }

      .pagination {
        flex-direction: column;
        gap: var(--espaciado-sm);
      }
    }
  `]
})
export class VideosComponent implements OnInit, OnDestroy {
  videos: VideoData[] = [];
  videoSeleccionado: VideoData | null = null;
  videoEditando: VideoData | null = null;
  
  // Authentication
  estaAutenticado = false;
  usuario: Usuario | null = null;
  mostrarFormularioAuth = false;
  
  // UI State
  mostrarUpload = false;
  cargandoVideos = false;
  
  // Filters and pagination
  filtros = {
    search: '',
    tipo: '',
    sortBy: 'fechaSubida',
    sortOrder: 'desc',
    page: 1,
    limit: 12
  };
  
  paginacion: any = null;
  
  // Edit form
  datosEdicion = {
    nombre: '',
    descripcion: '',
    isPublic: true
  };
  
  private subscriptions: Subscription[] = [];
  private searchTimeout?: any;

  constructor(
    private videoService: VideoApiService,
    private authService: AuthApiService
  ) {}

  ngOnInit() {
    this.suscribirseAAuth();
    this.cargarVideos();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  /**
   * Subscribe to authentication changes
   */
  private suscribirseAAuth() {
    const authSub = this.authService.autenticado$.subscribe(
      autenticado => {
        this.estaAutenticado = autenticado;
        if (autenticado) {
          this.cargarVideos();
        }
      }
    );

    const userSub = this.authService.usuario$.subscribe(
      usuario => this.usuario = usuario
    );

    this.subscriptions.push(authSub, userSub);
  }

  /**
   * Load videos from API
   */
  cargarVideos() {
    this.cargandoVideos = true;
    
    const params = {
      ...this.filtros,
      search: this.filtros.search.trim() || undefined,
      tipo: this.filtros.tipo || undefined
    };

    this.videoService.obtenerVideos(params).subscribe({
      next: (response: VideosResponse) => {
        this.videos = response.videos;
        this.paginacion = response.pagination;
        this.cargandoVideos = false;
        
        // Auto-select first video if none selected
        if (this.videos.length > 0 && !this.videoSeleccionado) {
          this.videoSeleccionado = this.videos[0];
        }
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.cargandoVideos = false;
      }
    });
  }

  /**
   * Handle search input changes with debounce
   */
  onSearchChange() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    this.searchTimeout = setTimeout(() => {
      this.filtros.page = 1;
      this.aplicarFiltros();
    }, 500);
  }

  /**
   * Apply filters and reload videos
   */
  aplicarFiltros() {
    this.filtros.page = 1;
    this.cargarVideos();
  }

  /**
   * Clear all filters
   */
  limpiarFiltros() {
    this.filtros = {
      search: '',
      tipo: '',
      sortBy: 'fechaSubida',
      sortOrder: 'desc',
      page: 1,
      limit: 12
    };
    this.cargarVideos();
  }

  /**
   * Change pagination page
   */
  cambiarPagina(page: number) {
    this.filtros.page = page;
    this.cargarVideos();
  }

  /**
   * Toggle upload section
   */
  toggleUpload() {
    this.mostrarUpload = !this.mostrarUpload;
  }

  /**
   * Select video for playback
   */
  seleccionarVideo(video: VideoData) {
    this.videoSeleccionado = video;
    
    // Scroll to player on mobile
    if (window.innerWidth <= 768) {
      const player = document.querySelector('.main-player');
      if (player) {
        player.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  /**
   * Check if user can edit video
   */
  puedeEditarVideo(video: VideoData): boolean {
    return this.estaAutenticado && 
           this.usuario && 
           (video.uploadedBy === this.usuario.id || this.usuario.role === 'admin');
  }

  /**
   * Start editing video
   */
  editarVideo(video: VideoData) {
    this.videoEditando = video;
    this.datosEdicion = {
      nombre: video.nombre,
      descripcion: video.descripcion || '',
      isPublic: video.isPublic
    };
  }

  /**
   * Save video edits
   */
  guardarEdicion() {
    if (!this.videoEditando) return;

    this.videoService.actualizarVideo(this.videoEditando.id, this.datosEdicion).subscribe({
      next: (response) => {
        // Update video in list
        const index = this.videos.findIndex(v => v.id === this.videoEditando!.id);
        if (index !== -1) {
          this.videos[index] = { ...this.videos[index], ...response.video };
        }
        
        // Update selected video if it's the same
        if (this.videoSeleccionado?.id === this.videoEditando!.id) {
          this.videoSeleccionado = { ...this.videoSeleccionado, ...response.video };
        }
        
        this.cerrarEdicion();
      },
      error: (error) => {
        console.error('Error updating video:', error);
        alert('Error al actualizar el video: ' + error.message);
      }
    });
  }

  /**
   * Close edit modal
   */
  cerrarEdicion(event?: Event) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.videoEditando = null;
  }

  /**
   * Delete video
   */
  eliminarVideo(videoId: string) {
    if (!confirm('¿Estás seguro de que quieres eliminar este video?')) {
      return;
    }

    this.videoService.eliminarVideo(videoId).subscribe({
      next: () => {
        // Remove from list
        this.videos = this.videos.filter(v => v.id !== videoId);
        
        // Clear selection if deleted video was selected
        if (this.videoSeleccionado?.id === videoId) {
          this.videoSeleccionado = this.videos.length > 0 ? this.videos[0] : null;
        }
      },
      error: (error) => {
        console.error('Error deleting video:', error);
        alert('Error al eliminar el video: ' + error.message);
      }
    });
  }

  /**
   * Handle video upload success
   */
  onVideoUploaded(video: VideoData) {
    this.videos.unshift(video);
    this.videoSeleccionado = video;
    this.mostrarUpload = false;
  }

  /**
   * Handle upload error
   */
  onUploadError(error: any) {
    console.error('Upload error:', error);
    alert('Error al subir el video: ' + error.message);
  }

  /**
   * Handle player error
   */
  onPlayerError(error: string) {
    console.error('Player error:', error);
    alert('Error en el reproductor: ' + error);
  }

  /**
   * Handle authentication completion
   */
  onAutenticacionCompletada() {
    this.mostrarFormularioAuth = false;
    this.cargarVideos();
  }

  /**
   * Handle thumbnail error
   */
  onThumbnailError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = this.getDefaultThumbnail();
  }

  /**
   * Get default thumbnail
   */
  getDefaultThumbnail(video?: VideoData): string {
    if (video?.tipo === 'youtube' && video.youtubeData?.videoId) {
      return this.videoService.obtenerThumbnailYoutube(video.youtubeData.videoId);
    }
    return 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg';
  }

  /**
   * Get type text
   */
  getTipoTexto(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'video': 'Video',
      'youtube': 'YouTube'
    };
    return tipos[tipo] || tipo;
  }

  /**
   * Format time
   */
  formatearTiempo(segundos: number): string {
    return this.videoService.formatearTiempo(segundos);
  }

  /**
   * Format file size
   */
  formatearTamano(bytes: number): string {
    return this.videoService.formatearTamano(bytes);
  }
}