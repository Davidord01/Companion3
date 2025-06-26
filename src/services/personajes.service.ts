/**
 * Servicio para gestionar los datos de personajes de The Last of Us 2
 * Proporciona información detallada sobre los personajes principales
 */

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

/**
 * Interface para definir la estructura de un personaje
 */
export interface Personaje {
  id: number;
  nombre: string;
  descripcion: string;
  edad: number;
  localizacion: string;
  imagen: string;
  habilidades: string[];
  historia: string;
  estado: 'vivo' | 'muerto' | 'desconocido';
}

@Injectable({
  providedIn: 'root'
})
export class PersonajesService {

  /**
   * Base de datos local de personajes principales
   */
  private personajes: Personaje[] = [
    {
      id: 1,
      nombre: 'Ellie Williams',
      descripcion: 'Protagonista principal, inmune al hongo Cordyceps',
      edad: 19,
      localizacion: 'Jackson, Wyoming',
      imagen: 'https://cdn.mos.cms.futurecdn.net/kf4KBk7oF4BTjUDkfXDmMZ-1200-80.jpg',
      habilidades: ['Combate cuerpo a cuerpo', 'Sigilo', 'Supervivencia', 'Guitarra'],
      historia: 'Ellie es una joven superviviente en un mundo post-apocalíptico. Tras los eventos de la primera temporada, vive en Jackson con Joel hasta que un evento traumático la lleva en una misión de venganza.',
      estado: 'vivo'
    },
    {
      id: 2,
      nombre: 'Abby Anderson',
      descripcion: 'Ex-soldado de la Milicia del Fuego de Seattle',
      edad: 21,
      localizacion: 'Seattle, Washington',
      imagen: 'https://www.publico.es/files/image_horizontal_mobile/uploads/2025/05/27/68358d84bc312.jpeg',
      habilidades: ['Combate militar', 'Fuerza física', 'Liderazgo', 'Medicina'],
      historia: 'Abby es una ex-soldado cuyo pasado está profundamente conectado con Joel. Su búsqueda de justicia la lleva por un camino que cambiará el destino de todos.',
      estado: 'vivo'
    },
    {
      id: 3,
      nombre: 'Joel Miller',
      descripcion: 'Contrabandista veterano y figura paterna de Ellie',
      edad: 56,
      localizacion: 'Jackson, Wyoming',
      imagen: 'https://media.gqitalia.it/photos/67fe7cdba346b3690a6410ae/4:3/w_2560%2Cc_limit/pedro-pascal_0.jpg',
      habilidades: ['Supervivencia', 'Combate', 'Carpintería', 'Liderazgo'],
      historia: 'Joel es un superviviente endurecido que ha vivido 20 años en el apocalipsis zombie. Su relación con Ellie es el corazón emocional de la historia.',
      estado: 'muerto'
    },
    {
      id: 4,
      nombre: 'Dina Woodward',
      descripcion: 'Compañera y interés amoroso de Ellie',
      edad: 19,
      localizacion: 'Jackson, Wyoming',
      imagen: 'https://media.quever.news/p/789527e68697e66ed760bf323efeb505/adjuntos/374/imagenes/000/074/0000074032/466x262/smart/the-last-of-us-dina-01png.png',
      habilidades: ['Arquería', 'Sigilo', 'Exploración', 'Cuidado infantil'],
      historia: 'Dina es la compañera de Ellie en Jackson y posteriormente en su viaje de venganza. Su relación representa esperanza y amor en un mundo brutal.',
      estado: 'vivo'
    },
    {
      id: 5,
      nombre: 'Tommy Miller',
      descripcion: 'Hermano menor de Joel y líder de Jackson',
      edad: 48,
      localizacion: 'Jackson, Wyoming',
      imagen: 'https://static.beebom.com/wp-content/uploads/2025/04/Tommy-Miller.jpg',
      habilidades: ['Liderazgo', 'Estrategia militar', 'Francotirador', 'Diplomacia'],
      historia: 'Tommy es el hermano de Joel y co-líder de la comunidad de Jackson. Su experiencia militar lo convierte en un valioso líder en tiempos difíciles.',
      estado: 'vivo'
    },
    {
      id: 6,
      nombre: 'Lev',
      descripcion: 'Joven desertor de los Serafitas',
      edad: 14,
      localizacion: 'Isla de los Serafitas, Seattle',
      imagen: 'https://media.them.us/photos/63ed303cd9c4b469230c76f4/3:2/w_1920,h_1280,c_limit/ian-alexander.jpg',
      habilidades: ['Tiro con arco', 'Escalada', 'Sigilo', 'Conocimiento tribal'],
      historia: 'Lev es un joven que desafía las tradiciones de su clan y forma una alianza inesperada que cambia el curso de los eventos.',
      estado: 'vivo'
    }
  ];

  constructor() { }

  /**
   * Obtiene todos los personajes
   * @returns Observable con la lista completa de personajes
   */
  obtenerPersonajes(): Observable<Personaje[]> {
    return of(this.personajes);
  }

  /**
   * Obtiene un personaje específico por ID
   * @param id - Identificador único del personaje
   * @returns Observable con el personaje encontrado o undefined
   */
  obtenerPersonajePorId(id: number): Observable<Personaje | undefined> {
    const personaje = this.personajes.find(p => p.id === id);
    return of(personaje);
  }

  /**
   * Filtra personajes por estado
   * @param estado - Estado del personaje (vivo, muerto, desconocido)
   * @returns Observable con la lista filtrada de personajes
   */
  obtenerPersonajesPorEstado(estado: 'vivo' | 'muerto' | 'desconocido'): Observable<Personaje[]> {
    const personajesFiltrados = this.personajes.filter(p => p.estado === estado);
    return of(personajesFiltrados);
  }

  /**
   * Busca personajes por nombre
   * @param termino - Término de búsqueda
   * @returns Observable con la lista de personajes que coinciden
   */
  buscarPersonajes(termino: string): Observable<Personaje[]> {
    const terminoLower = termino.toLowerCase();
    const personajesEncontrados = this.personajes.filter(p => 
      p.nombre.toLowerCase().includes(terminoLower) ||
      p.descripcion.toLowerCase().includes(terminoLower)
    );
    return of(personajesEncontrados);
  }
}