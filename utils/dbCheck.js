// Small helper middleware that responds 503 if the request was routed while DB is not connected.
module.exports = function requireDb(req, res, next) {
  // req.dbConnected is set by server.js global middleware
  if (req.dbConnected) return next();
  return res.status(503).json({ message: 'Service temporarily unavailable - database not connected' });
};
