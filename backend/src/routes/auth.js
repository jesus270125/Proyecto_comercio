// src/routes/auth.js
const router = require('express').Router();
const { rateLimit } = require('express-rate-limit');
const { login, me, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateLogin } = require('../middleware/validate');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  message: { error: 'Demasiados intentos de inicio de sesión. Inténtalo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, validateLogin, login);
router.get('/me', authenticate, me);
router.post('/logout', authenticate, logout);

module.exports = router;
