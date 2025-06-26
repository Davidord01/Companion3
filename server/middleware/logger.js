/**
 * Request logging middleware
 * Logs HTTP requests for monitoring and debugging
 */

/**
 * Request logger middleware
 */
function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Generate unique request ID
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Log request start
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip} - ${req.get('User-Agent')} - ID: ${req.id}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} - ${duration}ms - ID: ${req.id}`);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

/**
 * Error logger
 */
function logError(error, req = null) {
  const timestamp = new Date().toISOString();
  const requestInfo = req ? `${req.method} ${req.url} - ${req.ip}` : 'Unknown request';
  
  console.error(`[${timestamp}] ERROR: ${error.message}`);
  console.error(`Request: ${requestInfo}`);
  console.error(`Stack: ${error.stack}`);
}

module.exports = {
  requestLogger,
  logError
};