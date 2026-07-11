export function errorHandler(err, _req, res, _next) {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
  });
}
