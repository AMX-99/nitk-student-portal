// backend/middleware/errorHandler.js

/**
 * Custom error class for operational errors (optional but useful)
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Mark as operational (trusted) error
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global error handling middleware
 * Should be placed after all routes and other middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default values
  let { statusCode = 500, message = 'Internal Server Error' } = err;

  // If error is not an instance of AppError, it might be an unknown/unhandled error
  // You can log it for debugging
  if (!err.isOperational) {
    console.error('🔥 Unexpected Error:', err);
    // Avoid leaking sensitive error details in production
    if (process.env.NODE_ENV === 'production') {
      message = 'Internal Server Error';
    }
  }

  // Send JSON response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      // Optionally include stack trace in development
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found handler – use this before the errorHandler
 * This will catch all unmatched routes
 */
const notFound = (req, res, next) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

export { AppError, errorHandler, notFound };