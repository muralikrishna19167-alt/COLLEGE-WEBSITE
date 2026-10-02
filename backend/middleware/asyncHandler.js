// Wraps an async express handler so thrown errors/rejections become 500 responses
// instead of silently hanging or crashing the process.
module.exports = function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    });
  };
};
