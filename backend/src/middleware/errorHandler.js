// src/middleware/errorHandler.js
// Manejador centralizado de errores

/**
 * Middleware de error 404
 */
function notFound(req, res, next) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
}

/**
 * Manejador global de errores
 * Nunca devuelve stack trace en producción
 */
function errorHandler(err, req, res, next) {
  // Error de validación Prisma — registro duplicado
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Ya existe un registro con ese valor único.' });
  }
  // Error de registro no encontrado en Prisma
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro no encontrado.' });
  }

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production' && status === 500
      ? 'Error interno del servidor.'
      : err.message || 'Error interno del servidor.';

  if (status === 500) {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ error: message });
}

module.exports = { notFound, errorHandler };
