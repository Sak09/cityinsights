/**
 * Global Express error handling middleware.
 * Must be registered LAST in app.js with 4 params (err, req, res, next).
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: messages.join(', ') });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, error: `Invalid value for field: ${err.path}` });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, error: `Duplicate value for field: ${field}` });
  }

  // Axios/network errors
  if (err.isAxiosError) {
    return res.status(502).json({
      success: false,
      error: `External API error: ${err.message}`,
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
