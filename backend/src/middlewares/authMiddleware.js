const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'napaslega-super-secret-key-123';

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Akses ditolak. Token tidak valid / tidak ditemukan.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Menempelkan payload user (userId) ke object req
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalid atau kadaluarsa.' });
  }
};

module.exports = authMiddleware;
