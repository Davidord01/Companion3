/**
 * Servicio para gestionar los eventos del timeline de The Last of Us 2
 * Proporciona información cronológica de los eventos clave
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Interface para definir la estructura de un evento del timeline
 */
export interface EventoTimeline {
  id: number;
  titulo: string;
  fecha: string;
  descripcion: string;
  localizacion: string;
  personajesInvolucrados: string[];
  imagen: string;
  tipo: 'prologo' | 'jackson' | 'seattle' | 'epilogo';
  importancia: 'alta' | 'media' | 'baja';
}

@Injectable({
  providedIn: 'root'
})
export class TimelineService {

  /**
   * Base de datos local de eventos del timeline
   */
  private eventos: EventoTimeline[] = [
    {
      id: 1,
      titulo: 'Vida en Jackson',
      fecha: '4 años después',
      descripcion: 'Ellie y Joel han establecido una vida relativamente pacífica en la comunidad de Jackson, Wyoming. Ellie entrena y patrulla los alrededores.',
      localizacion: 'Jackson, Wyoming',
      personajesInvolucrados: ['Ellie', 'Joel', 'Tommy', 'Dina'],
      imagen: 'https://i.f1g.fr/media/cms/1200x630_crop/2025/04/14/75af2cd534a7effa4d0d76d782de9448436cdd2625a3fbe0a489e33583f839a5.jpg',
      tipo: 'jackson',
      importancia: 'media'
    },
    {
      id: 2,
      titulo: 'La Llegada de Abby',
      fecha: 'Invierno 2038',
      descripcion: 'Un evento traumático cambia para siempre la vida de Ellie cuando el pasado de Joel regresa para enfrentarlo.',
      localizacion: 'Jackson, Wyoming',
      personajesInvolucrados: ['Joel', 'Abby', 'Ellie', 'Tommy'],
      imagen: 'https://img.odcdn.com.br/wp-content/uploads/2025/04/Design-sem-nome-43-1920x1080.png',
      tipo: 'jackson',
      importancia: 'alta'
    },
    {
      id: 3,
      titulo: 'La Búsqueda de Venganza',
      fecha: 'Primavera 2038',
      descripcion: 'Ellie emprende un viaje hacia Seattle en busca de venganza, acompañada por Dina. Su misión la llevará a enfrentar horrores inimaginables.',
      localizacion: 'Camino a Seattle',
      personajesInvolucrados: ['Ellie', 'Dina', 'Tommy'],
      imagen: 'https://criticalhits.com.br/wp-content/uploads/2025/04/1744609947856.jpg',
      tipo: 'seattle',
      importancia: 'alta'
    },
    {
      id: 4,
      titulo: 'Guerra en Seattle',
      fecha: 'Mayo 2038',
      descripcion: 'Seattle está en guerra entre la WLF (Washington Liberation Front) y los Serafitas. Ellie debe navegar este conflicto mientras busca a Abby.',
      localizacion: 'Seattle, Washington',
      personajesInvolucrados: ['Ellie', 'Dina', 'WLF', 'Serafitas'],
      imagen: 'https://media.vogue.mx/photos/6817f51f4d09999275c41c29/master/w_1600%2Cc_limit/the-last-of-us-2-capitulo-4.jpg',
      tipo: 'seattle',
      importancia: 'alta'
    },
    {
      id: 5,
      titulo: 'El Pasado de Abby',
      fecha: '4 años antes - 2034',
      descripcion: 'Se revela la historia de Abby Anderson, hija del Dr. Jerry Anderson, y su motivación para buscar a Joel Miller.',
      localizacion: 'Hospital de Salt Lake City',
      personajesInvolucrados: ['Abby', 'Dr. Jerry Anderson', 'Marlene'],
      imagen: 'https://img.europapress.es/fotoweb/fotonoticia_20250415101013_690.jpg',
      tipo: 'prologo',
      importancia: 'alta'
    },
    {
      id: 6,
      titulo: 'Encuentro con Lev',
      fecha: 'Mayo 2038',
      descripcion: 'Abby conoce a Lev y Yara, dos jóvenes Serafitas que cambiarán su perspectiva sobre la guerra y la humanidad.',
      localizacion: 'Territorio Serafita, Seattle',
      personajesInvolucrados: ['Abby', 'Lev', 'Yara'],
      imagen: 'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2023/01/the-last-of-us-part-2-abby-and-lev-on-a-horse.jpg',
      tipo: 'seattle',
      importancia: 'alta'
    },
    {
      id: 7,
      titulo: 'La Confrontación Final',
      fecha: 'Mayo 2038',
      descripcion: 'Ellie y Abby se enfrentan en una confrontación final que pondrá a prueba todo lo que han aprendido sobre perdón y venganza.',
      localizacion: 'Teatro Serafita, Seattle',
      personajesInvolucrados: ['Ellie', 'Abby', 'Lev', 'Dina'],
      imagen: 'https://i.ytimg.com/vi/CRdj02QuoXI/maxresdefault.jpg',
      tipo: 'seattle',
      importancia: 'alta'
    },
    {
      id: 8,
      titulo: 'Nuevo Comienzo',
      fecha: '1 año después - 2039',
      descripcion: 'Las consecuencias de los eventos en Seattle reverberan mientras los supervivientes intentan reconstruir sus vidas.',
      localizacion: 'Granja en Wyoming',
      personajesInvolucrados: ['Ellie', 'Dina', 'JJ'],
      imagen: 'https://motgame.vn/stores/news_dataimages/motgamevn/092020/03/04/the-last-of-us-2-va-nhung-bi-an-chua-duoc-giai-dap-trong-cot-truyen-12-.2244.jpg',
      tipo: 'epilogo',
      importancia: 'media'
    }
  ];

  constructor() { }

  /**
   * Obtiene todos los eventos del timeline ordenados cronológicamente
   * @returns Observable con la lista completa de eventos
   */
  obtenerEventos(): Observable<EventoTimeline[]> {
    // Ordenar eventos por ID (que corresponde al orden cronológico)
    const eventosOrdenados = [...this.eventos].sort((a, b) => a.id - b.id);
    return of(eventosOrdenados);
  }

  /**
   * Obtiene un evento específico por ID
   * @param id - Identificador único del evento
   * @returns Observable con el evento encontrado o undefined
   */
  obtenerEventoPorId(id: number): Observable<EventoTimeline | undefined> {
    const evento = this.eventos.find(e => e.id === id);
    return of(evento);
  }

  /**
   * Filtra eventos por tipo
   * @param tipo - Tipo de evento del timeline
   * @returns Observable con la lista filtrada de eventos
   */
  obtenerEventosPorTipo(tipo: 'prologo' | 'jackson' | 'seattle' | 'epilogo'): Observable<EventoTimeline[]> {
    const eventosFiltrados = this.eventos.filter(e => e.tipo === tipo);
    return of(eventosFiltrados);
  }

  /**
   * Filtra eventos por importancia
   * @param importancia - Nivel de importancia del evento
   * @returns Observable con la lista filtrada de eventos
   */
  obtenerEventosPorImportancia(importancia: 'alta' | 'media' | 'baja'): Observable<EventoTimeline[]> {
    const eventosFiltrados = this.eventos.filter(e => e.importancia === importancia);
    return of(eventosFiltrados);
  }

  /**
   * Busca eventos por término de búsqueda
   * @param termino - Término de búsqueda
   * @returns Observable con la lista de eventos que coinciden
   */
  buscarEventos(termino: string): Observable<EventoTimeline[]> {
    const terminoLower = termino.toLowerCase();
    const eventosEncontrados = this.eventos.filter(e => 
      e.titulo.toLowerCase().includes(terminoLower) ||
      e.descripcion.toLowerCase().includes(terminoLower) ||
      e.localizacion.toLowerCase().includes(terminoLower)
    );
    return of(eventosEncontrados);
  }
}