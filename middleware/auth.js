const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.split(' ')[1];
  try {
  const secret = process.env.ACCESS_TOKEN;
  if (!secret) return res.status(500).json({ message: 'ACCESS_TOKEN is not configured on the server' });
  const payload = jwt.verify(token, secret);
    req.user = payload; // attach payload (id, username, number) for handlers
    return next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

module.exports = requireAuth;
