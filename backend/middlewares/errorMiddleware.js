// Centralized error handler — catches all errors from controllers
const errorHandler = (err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Server Error',
    // ponytail: stack only in dev, never in production
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// Wraps async route handlers so we don't need try/catch everywhere
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { errorHandler, asyncHandler };
