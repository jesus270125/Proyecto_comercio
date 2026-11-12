// src/app.js
// Configuración de Express — separado del servidor para facilitar testing
require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const { rateLimit } = require('express-rate-limit');
const path = require('path');

const authRoutes   = require('./routes/auth');
const publicRoutes = require('./routes/public');
const adminRoutes  = require('./routes/admin');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Seguridad ─────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.NODE_ENV === 'production' ? [] : ['http://localhost:5173', 'http://localhost:3000']),
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Las peticiones sin Origin (por ejemplo curl) no requieren cabeceras CORS.
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
}));

// Las imágenes son públicas para mostrarlas en el catálogo; solo un administrador puede subirlas.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  setHeaders: res => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
}));

// ── Rate Limit global ─────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones. Intenta más tarde.' },
}));

// ── Body Parsing ──────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ── Health Check ──────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '2.0' });
});

// ── Rutas ─────────────────────────────────────────────────
app.use('/api/v1/auth',   authRoutes);
app.use('/api/v1',        publicRoutes);
app.use('/api/v1/admin',  adminRoutes);

// ── Manejo de errores ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
