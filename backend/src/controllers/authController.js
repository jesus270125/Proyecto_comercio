// src/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// POST /api/v1/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    // Mensaje genérico para no revelar si el email existe
    if (!user || !user.activo) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/auth/me
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, nombre: true, apellido: true, email: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/auth/logout  (JWT stateless — el cliente descarta el token)
function logout(req, res) {
  res.json({ message: 'Sesión cerrada correctamente.' });
}

module.exports = { login, me, logout };
