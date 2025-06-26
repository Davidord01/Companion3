/**
 * In-memory video storage
 * In production, this would be replaced with a proper database
 */

const videos = [
  {
    id: 'video-1',
    nombre: 'Trailer Oficial - The Last of Us 2',
    descripcion: 'Trailer oficial revelando la historia de Ellie',
    tipo: 'youtube',
    formato: 'youtube',
    url: 'https://www.youtube.com/watch?v=btmN-bWwv0A',
    thumbnail: 'https://images.pexels.com/photos/1413412/pexels-photo-1413412.jpeg',
    tamano: 0,
    duracion: 300,
    fechaSubida: new Date('2024-01-10'),
    uploadedBy: 'admin_001',
    views: 52428800,
    isPublic: true,
    youtubeData: {
      videoId: 'btmN-bWwv0A',
      title: 'The Last of Us Part II - Official Trailer',
      author: 'PlayStation',
      publishDate: '2020-05-07',
      viewCount: '52428800'
    }
  },
  {
    id: 'video-2',
    nombre: 'Gameplay - Seattle Exploration',
    descripcion: 'Exploración de Seattle en busca de Abby',
    tipo: 'youtube',
    formato: 'youtube',
    url: 'https://www.youtube.com/watch?v=ElephantsDream',
    thumbnail: 'https://uploads.worldanvil.com/uploads/images/2b15c848c6f3e46aba209c5e36443d3a.jpg',
    tamano: 0,
    duracion: 450,
    fechaSubida: new Date('2024-01-25'),
    uploadedBy: 'user_001',
    views: 104857600,
    isPublic: true,
    youtubeData: {
      videoId: 'ElephantsDream',
      title: 'Elephant\'s Dream',
      author: 'Blender Foundation',
      publishDate: '2006-05-18',
      viewCount: '104857600'
    }
  }
];

module.exports = { videos };