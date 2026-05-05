const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  // Accept Bearer token from Authorization header (cross-domain) or cookie (same-domain)
  const authHeader = req.headers.authorization;
  const token =
    (authHeader && authHeader.startsWith('Bearer '))
      ? authHeader.slice(7)
      : req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorised. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired session. Please log in again.' });
  }
};

module.exports = { protect };
