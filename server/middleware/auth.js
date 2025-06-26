/**
 * Authentication middleware
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const { users } = require('../data/users');

const JWT_SECRET = process.env.JWT_SECRET || 'tlou2-secret-key-change-in-production';

/**
 * Middleware to authenticate JWT tokens
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          error: 'Token expired'
        });
      }
      return res.status(403).json({
        error: 'Invalid token'
      });
    }

    // Check if user still exists and is active
    const user = users.find(u => u.id === decoded.id);
    if (!user || !user.isActive) {
      return res.status(403).json({
        error: 'User not found or inactive'
      });
    }

    req.user = decoded;
    next();
  });
}

/**
 * Middleware to authenticate optional JWT tokens
 * Continues even if no token is provided
 */
function authenticateOptional(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      req.user = null;
    } else {
      // Check if user still exists and is active
      const user = users.find(u => u.id === decoded.id);
      if (user && user.isActive) {
        req.user = decoded;
      } else {
        req.user = null;
      }
    }
    next();
  });
}

/**
 * Middleware to check if user has admin role
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Admin access required'
    });
  }
  next();
}

/**
 * Middleware to check if user owns resource or is admin
 */
function requireOwnershipOrAdmin(resourceUserIdField = 'userId') {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required'
      });
    }

    if (req.user.role === 'admin' || req.user.id === resourceUserId) {
      return next();
    }

    return res.status(403).json({
      error: 'Access denied'
    });
  };
}

module.exports = {
  authenticateToken,
  authenticateOptional,
  requireAdmin,
  requireOwnershipOrAdmin
};