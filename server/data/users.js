/**
 * In-memory user storage
 * In production, this would be replaced with a proper database
 */

const users = [
  {
    id: 'admin_001',
    nombre: 'Admin',
    apellidos: 'User',
    email: 'admin@tlou2.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // password: admin123!
    pais: 'Estados Unidos',
    role: 'admin',
    fechaRegistro: new Date('2024-01-01'),
    isActive: true,
    lastLogin: new Date(),
    uploadedVideos: [],
    preferences: {
      theme: 'dark',
      autoplay: true,
      quality: 'auto'
    }
  },
  {
    id: 'user_001',
    nombre: 'Ellie',
    apellidos: 'Williams',
    email: 'ellie@jackson.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', // password: admin123!
    pais: 'Estados Unidos',
    role: 'user',
    fechaRegistro: new Date('2024-01-15'),
    isActive: true,
    lastLogin: new Date(),
    uploadedVideos: [],
    preferences: {
      theme: 'dark',
      autoplay: false,
      quality: '1080p'
    }
  }
];

module.exports = { users };