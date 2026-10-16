// src/middleware/auth.js
// Middleware de autenticación y autorización JWT

const jwt = require('jsonwebtoken');

/**
 * Verifica el token JWT del header Authorization: Bearer <token>
 * Adjunta el payload decodificado en req.user
 */
function authenticate(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticación requerido.' });
  }

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado.' });
  }
}

/**
 * Permite solo a usuarios con rol ADMIN
 * Debe usarse después de authenticate()
 */
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Acceso restringido a administradores.' });
  }
  next();
}

/**
 * Middleware opcional — no bloquea si no hay token,
 * pero si hay token válido adjunta req.user
 */
function optionalAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      // token inválido, continúa como invitado
    }
  }
  next();
}

module.exports = { authenticate, requireAdmin, optionalAuth };
