/**
 * User management routes
 * Handles user profile operations and user-related data
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const { users } = require('../data/users');
const { videos } = require('../data/videos');

const router = express.Router();

/**
 * GET /api/users/profile
 * Get current user's detailed profile
 */
router.get('/profile', (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get user's uploaded videos
    const userVideos = videos.filter(v => v.uploadedBy === user.id);
    
    // Calculate statistics
    const stats = {
      totalVideos: userVideos.length,
      totalViews: userVideos.reduce((sum, video) => sum + (video.views || 0), 0),
      totalSize: userVideos.reduce((sum, video) => sum + (video.tamano || 0), 0),
      publicVideos: userVideos.filter(v => v.isPublic).length,
      privateVideos: userVideos.filter(v => !v.isPublic).length
    };

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      user: {
        ...userWithoutPassword,
        stats
      },
      recentVideos: userVideos
        .sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida))
        .slice(0, 5)
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/users/:id/videos
 * Get public videos from a specific user
 */
router.get('/:id/videos', (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const userId = req.params.id;

    // Get user's public videos
    let userVideos = videos.filter(v => 
      v.uploadedBy === userId && v.isPublic
    );

    // Sort by upload date (newest first)
    userVideos.sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedVideos = userVideos.slice(startIndex, endIndex);

    res.json({
      videos: paginatedVideos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(userVideos.length / limit),
        totalVideos: userVideos.length,
        hasNext: endIndex < userVideos.length,
        hasPrev: startIndex > 0
      }
    });

  } catch (error) {
    console.error('User videos fetch error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/users/search
 * Search users by name or email
 */
router.get('/search', (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        error: 'Search query must be at least 2 characters long'
      });
    }

    const searchTerm = q.toLowerCase().trim();
    
    const matchingUsers = users
      .filter(user => 
        user.isActive && (
          user.nombre.toLowerCase().includes(searchTerm) ||
          user.apellidos.toLowerCase().includes(searchTerm) ||
          user.email.toLowerCase().includes(searchTerm)
        )
      )
      .slice(0, parseInt(limit))
      .map(user => ({
        id: user.id,
        nombre: user.nombre,
        apellidos: user.apellidos,
        email: user.email,
        pais: user.pais,
        fechaRegistro: user.fechaRegistro,
        videoCount: videos.filter(v => v.uploadedBy === user.id && v.isPublic).length
      }));

    res.json({
      users: matchingUsers,
      total: matchingUsers.length
    });

  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/users/preferences
 * Update user preferences
 */
router.patch('/preferences', [
  body('preferences').isObject().withMessage('Preferences must be an object'),
  body('preferences.theme').optional().isIn(['light', 'dark']).withMessage('Invalid theme'),
  body('preferences.autoplay').optional().isBoolean().withMessage('Autoplay must be boolean'),
  body('preferences.quality').optional().isIn(['auto', '720p', '1080p']).withMessage('Invalid quality setting')
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Update preferences
    user.preferences = {
      ...user.preferences,
      ...req.body.preferences
    };

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      message: 'Preferences updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/users/dashboard
 * Get dashboard data for current user
 */
router.get('/dashboard', (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get user's videos
    const userVideos = videos.filter(v => v.uploadedBy === user.id);
    
    // Calculate detailed statistics
    const stats = {
      totalVideos: userVideos.length,
      totalViews: userVideos.reduce((sum, video) => sum + (video.views || 0), 0),
      totalSize: userVideos.reduce((sum, video) => sum + (video.tamano || 0), 0),
      publicVideos: userVideos.filter(v => v.isPublic).length,
      privateVideos: userVideos.filter(v => !v.isPublic).length,
      uploadedVideos: userVideos.filter(v => v.tipo === 'video').length,
      youtubeVideos: userVideos.filter(v => v.tipo === 'youtube').length,
      averageViews: userVideos.length > 0 
        ? Math.round(userVideos.reduce((sum, video) => sum + (video.views || 0), 0) / userVideos.length)
        : 0
    };

    // Get recent activity
    const recentVideos = userVideos
      .sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida))
      .slice(0, 5);

    // Get most viewed videos
    const popularVideos = userVideos
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, 5);

    res.json({
      stats,
      recentVideos,
      popularVideos,
      storageUsed: stats.totalSize,
      storageLimit: 5 * 1024 * 1024 * 1024, // 5GB limit
      accountInfo: {
        memberSince: user.fechaRegistro,
        lastLogin: user.lastLogin,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;