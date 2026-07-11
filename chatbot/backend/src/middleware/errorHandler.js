function errorHandler(err, _req, res, _next) {
  console.error('Unhandled error:', err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
  });
}

module.exports = errorHandler;
