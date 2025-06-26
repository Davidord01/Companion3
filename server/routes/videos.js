/**
 * Video management routes
 * Handles video upload, processing, streaming, and metadata management
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const ytdl = require('ytdl-core');
const sharp = require('sharp');

const { authenticateToken } = require('../middleware/auth');
const { videos } = require('../data/videos');
const { users } = require('../data/users');

const router = express.Router();

// File upload configuration
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userId = req.user?.id || 'anonymous';
    const uploadPath = path.join(__dirname, '../../uploads/videos', userId);
    
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = path.extname(file.originalname);
    const filename = `${timestamp}_${randomString}${extension}`;
    cb(null, filename);
  }
});

// File filter for video uploads
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/quicktime',
    'video/x-msvideo'
  ];
  
  const allowedExtensions = ['.mp4', '.avi', '.mov'];
  const fileExtension = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, AVI, and MOV files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 1
  }
});

/**
 * Validate video file integrity
 */
async function validateVideoFile(filePath) {
  try {
    const stats = await fs.stat(filePath);
    
    // Check if file exists and has content
    if (stats.size === 0) {
      throw new Error('File is empty');
    }
    
    // Basic file header validation for common video formats
    const buffer = Buffer.alloc(12);
    const fileHandle = await fs.open(filePath, 'r');
    await fileHandle.read(buffer, 0, 12, 0);
    await fileHandle.close();
    
    const header = buffer.toString('hex');
    
    // Check for common video file signatures
    const videoSignatures = [
      '000000', // MP4/MOV (ftyp box)
      '52494646', // AVI (RIFF)
    ];
    
    const isValidVideo = videoSignatures.some(sig => 
      header.toLowerCase().includes(sig.toLowerCase())
    );
    
    if (!isValidVideo) {
      throw new Error('Invalid video file format');
    }
    
    return true;
  } catch (error) {
    throw new Error(`File validation failed: ${error.message}`);
  }
}

/**
 * Generate video thumbnail
 */
async function generateThumbnail(videoPath, outputPath) {
  try {
    // For now, we'll create a placeholder thumbnail
    // In production, you'd use ffmpeg to extract a frame
    const placeholderBuffer = await sharp({
      create: {
        width: 320,
        height: 180,
        channels: 3,
        background: { r: 26, g: 26, b: 26 }
      }
    })
    .png()
    .toBuffer();
    
    await fs.writeFile(outputPath, placeholderBuffer);
    return outputPath;
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return null;
  }
}

/**
 * POST /api/videos/upload
 * Upload video file
 */
router.post('/upload', authenticateToken, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No video file provided'
      });
    }

    const { nombre, descripcion } = req.body;
    
    if (!nombre || nombre.trim().length === 0) {
      // Clean up uploaded file
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        error: 'Video name is required'
      });
    }

    // Validate uploaded file
    try {
      await validateVideoFile(req.file.path);
    } catch (error) {
      // Clean up invalid file
      await fs.unlink(req.file.path).catch(console.error);
      return res.status(400).json({
        error: error.message
      });
    }

    // Generate thumbnail
    const thumbnailPath = path.join(
      path.dirname(req.file.path),
      `thumb_${path.basename(req.file.path, path.extname(req.file.path))}.png`
    );
    
    await generateThumbnail(req.file.path, thumbnailPath);

    // Create video record
    const videoId = uuidv4();
    const newVideo = {
      id: videoId,
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || '',
      tipo: 'video',
      formato: path.extname(req.file.originalname).substring(1),
      url: `/api/videos/stream/${req.user.id}/${req.file.filename}`,
      thumbnail: `/uploads/videos/${req.user.id}/${path.basename(thumbnailPath)}`,
      tamano: req.file.size,
      duracion: 0, // Will be updated when video is played
      fechaSubida: new Date(),
      uploadedBy: req.user.id,
      originalName: req.file.originalname,
      filePath: req.file.path,
      thumbnailPath,
      views: 0,
      isPublic: true,
      metadata: {
        resolution: null,
        bitrate: null,
        codec: null
      }
    };

    videos.push(newVideo);

    // Update user's uploaded videos list
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.uploadedVideos.push(videoId);
    }

    res.status(201).json({
      message: 'Video uploaded successfully',
      video: newVideo
    });

  } catch (error) {
    console.error('Video upload error:', error);
    
    // Clean up uploaded file on error
    if (req.file) {
      await fs.unlink(req.file.path).catch(console.error);
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          error: 'File too large. Maximum size is 500MB.'
        });
      }
    }
    
    res.status(500).json({
      error: 'Internal server error during upload'
    });
  }
});

/**
 * POST /api/videos/youtube
 * Process YouTube URL
 */
router.post('/youtube', authenticateToken, [
  body('url').isURL().withMessage('Valid YouTube URL is required'),
  body('nombre').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { url, nombre, descripcion } = req.body;

    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        error: 'Invalid YouTube URL'
      });
    }

    // Get video info
    const info = await ytdl.getInfo(url);
    const videoDetails = info.videoDetails;

    // Create video record for YouTube video
    const videoId = uuidv4();
    const newVideo = {
      id: videoId,
      nombre: nombre.trim(),
      descripcion: descripcion?.trim() || videoDetails.description || '',
      tipo: 'youtube',
      formato: 'youtube',
      url: url,
      thumbnail: videoDetails.thumbnails?.[0]?.url || null,
      tamano: 0,
      duracion: parseInt(videoDetails.lengthSeconds) || 0,
      fechaSubida: new Date(),
      uploadedBy: req.user.id,
      originalName: videoDetails.title,
      views: 0,
      isPublic: true,
      youtubeData: {
        videoId: videoDetails.videoId,
        title: videoDetails.title,
        author: videoDetails.author?.name,
        publishDate: videoDetails.publishDate,
        viewCount: videoDetails.viewCount
      }
    };

    videos.push(newVideo);

    // Update user's uploaded videos list
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.uploadedVideos.push(videoId);
    }

    res.status(201).json({
      message: 'YouTube video added successfully',
      video: newVideo
    });

  } catch (error) {
    console.error('YouTube processing error:', error);
    res.status(500).json({
      error: 'Failed to process YouTube URL'
    });
  }
});

/**
 * GET /api/videos
 * Get all videos (with pagination and filtering)
 */
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      tipo,
      uploadedBy,
      sortBy = 'fechaSubida',
      sortOrder = 'desc'
    } = req.query;

    let filteredVideos = [...videos];

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredVideos = filteredVideos.filter(video =>
        video.nombre.toLowerCase().includes(searchTerm) ||
        video.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    // Filter by type
    if (tipo) {
      filteredVideos = filteredVideos.filter(video => video.tipo === tipo);
    }

    // Filter by uploader
    if (uploadedBy) {
      filteredVideos = filteredVideos.filter(video => video.uploadedBy === uploadedBy);
    }

    // Filter public videos only (unless user is requesting their own)
    if (!req.user || uploadedBy !== req.user.id) {
      filteredVideos = filteredVideos.filter(video => video.isPublic);
    }

    // Sort videos
    filteredVideos.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'fechaSubida') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedVideos = filteredVideos.slice(startIndex, endIndex);

    res.json({
      videos: paginatedVideos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredVideos.length / limit),
        totalVideos: filteredVideos.length,
        hasNext: endIndex < filteredVideos.length,
        hasPrev: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/videos/:id
 * Get specific video details
 */
router.get('/:id', (req, res) => {
  try {
    const video = videos.find(v => v.id === req.params.id);

    if (!video) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    // Check if video is public or user owns it
    if (!video.isPublic && (!req.user || video.uploadedBy !== req.user.id)) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Increment view count
    video.views = (video.views || 0) + 1;

    res.json({ video });

  } catch (error) {
    console.error('Video fetch error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * PATCH /api/videos/:id
 * Update video metadata
 */
router.patch('/:id', authenticateToken, [
  body('nombre').optional().trim().isLength({ min: 1, max: 100 }),
  body('descripcion').optional().trim().isLength({ max: 1000 }),
  body('isPublic').optional().isBoolean()
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const video = videos.find(v => v.id === req.params.id);

    if (!video) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    // Check ownership
    if (video.uploadedBy !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Update allowed fields
    const allowedUpdates = ['nombre', 'descripcion', 'isPublic'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    Object.assign(video, updates);

    res.json({
      message: 'Video updated successfully',
      video
    });

  } catch (error) {
    console.error('Video update error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * DELETE /api/videos/:id
 * Delete video
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const videoIndex = videos.findIndex(v => v.id === req.params.id);

    if (videoIndex === -1) {
      return res.status(404).json({
        error: 'Video not found'
      });
    }

    const video = videos[videoIndex];

    // Check ownership
    if (video.uploadedBy !== req.user.id) {
      return res.status(403).json({
        error: 'Access denied'
      });
    }

    // Delete physical files for uploaded videos
    if (video.tipo === 'video') {
      try {
        if (video.filePath) {
          await fs.unlink(video.filePath);
        }
        if (video.thumbnailPath) {
          await fs.unlink(video.thumbnailPath);
        }
      } catch (error) {
        console.error('File deletion error:', error);
        // Continue with database deletion even if file deletion fails
      }
    }

    // Remove from videos array
    videos.splice(videoIndex, 1);

    // Remove from user's uploaded videos list
    const user = users.find(u => u.id === req.user.id);
    if (user) {
      user.uploadedVideos = user.uploadedVideos.filter(id => id !== req.params.id);
    }

    res.json({
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Video deletion error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/videos/stream/:userId/:filename
 * Stream video file
 */
router.get('/stream/:userId/:filename', (req, res) => {
  try {
    const { userId, filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/videos', userId, filename);

    // Check if file exists
    fs.access(filePath)
      .then(() => {
        const stat = require('fs').statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
          // Support for video seeking
          const parts = range.replace(/bytes=/, "").split("-");
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;
          const file = require('fs').createReadStream(filePath, { start, end });
          const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(206, head);
          file.pipe(res);
        } else {
          const head = {
            'Content-Length': fileSize,
            'Content-Type': 'video/mp4',
          };
          res.writeHead(200, head);
          require('fs').createReadStream(filePath).pipe(res);
        }
      })
      .catch(() => {
        res.status(404).json({
          error: 'Video file not found'
        });
      });

  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

module.exports = router;