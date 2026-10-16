// src/middleware/validate.js
// Validadores de entrada para cada recurso

/**
 * Genera un slug a partir de un texto (para usar en URLs)
 */
function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Crea un error HTTP con status code
 */
function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

// ── AUTH ──────────────────────────────────────────────────
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(createError(400, 'Email y contraseña son requeridos.'));
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return next(createError(400, 'Formato de email inválido.'));
  }
  next();
}

// ── RESERVAS ─────────────────────────────────────────────
function validateReservation(req, res, next) {
  const {
    guestNombre, guestApellido, guestEmail, guestTelefono,
    tipo, experienceId, accommodationId,
    fechaLlegada, fechaSalida, personas,
  } = req.body;

  const errors = [];

  if (!guestNombre?.trim()) errors.push('El nombre es requerido.');
  if (!guestApellido?.trim()) errors.push('El apellido es requerido.');
  if (!guestEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail))
    errors.push('Email de contacto inválido.');
  if (!guestTelefono?.trim()) errors.push('El teléfono es requerido.');
  if (!tipo || !['EXPERIENCIA', 'HOSPEDAJE'].includes(tipo))
    errors.push('Tipo de reserva debe ser EXPERIENCIA o HOSPEDAJE.');
  if (tipo === 'EXPERIENCIA' && !experienceId)
    errors.push('Se requiere experienceId para tipo EXPERIENCIA.');
  if (tipo === 'HOSPEDAJE' && !accommodationId)
    errors.push('Se requiere accommodationId para tipo HOSPEDAJE.');
  if (!fechaLlegada) errors.push('Fecha de llegada requerida.');
  if (!fechaSalida) errors.push('Fecha de salida requerida.');

  if (fechaLlegada && fechaSalida) {
    const llegada = new Date(fechaLlegada);
    const salida = new Date(fechaSalida);
    if (isNaN(llegada.getTime())) errors.push('Fecha de llegada inválida.');
    if (isNaN(salida.getTime())) errors.push('Fecha de salida inválida.');
    if (salida <= llegada) errors.push('La fecha de salida debe ser posterior a la llegada.');
  }

  const p = parseInt(personas);
  if (!p || p < 1 || p > 50) errors.push('Número de personas debe ser entre 1 y 50.');

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }
  next();
}

// ── EXPERIENCIAS ──────────────────────────────────────────
function validateExperience(req, res, next) {
  const { nombre, description, category, duration, price } = req.body;
  const errors = [];
  if (!nombre?.trim()) errors.push('Nombre requerido.');
  if (!description?.trim()) errors.push('Descripción requerida.');
  if (!category?.trim()) errors.push('Categoría requerida.');
  if (!duration?.trim()) errors.push('Duración requerida.');
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0)
    errors.push('Precio debe ser un número positivo.');
  if (errors.length > 0) return res.status(400).json({ errors });
  next();
}

// ── HOSPEDAJES ────────────────────────────────────────────
function validateAccommodation(req, res, next) {
  const { nombre, description, type, location, price } = req.body;
  const errors = [];
  if (!nombre?.trim()) errors.push('Nombre requerido.');
  if (!description?.trim()) errors.push('Descripción requerida.');
  if (!type?.trim()) errors.push('Tipo requerido.');
  if (!location?.trim()) errors.push('Ubicación requerida.');
  if (price === undefined || isNaN(Number(price)) || Number(price) < 0)
    errors.push('Precio debe ser un número positivo.');
  if (errors.length > 0) return res.status(400).json({ errors });
  next();
}

module.exports = {
  slugify,
  createError,
  validateLogin,
  validateReservation,
  validateExperience,
  validateAccommodation,
};
