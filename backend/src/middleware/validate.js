function slugify(text) {
  return text.toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const text = (value, max = 1000) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const optionalText = (value, max) => value === undefined || value === null || value === '' || text(value, max);
const integer = value => (typeof value === 'number' || typeof value === 'string' && /^\d+$/.test(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
const priceIsValid = value => (typeof value === 'number' || typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value)) && Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 99999999.99 && Math.abs(Number(value) * 100 - Math.round(Number(value) * 100)) < 1e-7;
const stringArray = value => Array.isArray(value) && value.length <= 100 && value.every(item => text(item, 500));
const bodyObject = value => value && typeof value === 'object' && !Array.isArray(value) && !Buffer.isBuffer(value);
const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

function validateLogin(req, res, next) {
  if (!bodyObject(req.body) || !text(req.body.email, 255) || !emailPattern.test(req.body.email) || !text(req.body.password, 1024)) {
    return res.status(400).json({ error: 'Ingresa un correo y contraseña válidos.' });
  }
  next();
}

function validateReservation(req, res, next) {
  if (!bodyObject(req.body)) return res.status(400).json({ error: 'Datos de reserva inválidos.' });
  const { guestNombre, guestApellido, guestEmail, guestTelefono, observaciones, tipo, experienceId, accommodationId, fechaLlegada, fechaSalida, personas } = req.body;
  const errors = [];
  if (!text(guestNombre, 100)) errors.push('Nombre inválido.');
  if (!text(guestApellido, 100)) errors.push('Apellido inválido.');
  if (!text(guestEmail, 255) || !emailPattern.test(guestEmail)) errors.push('Email de contacto inválido.');
  if (!text(guestTelefono, 30)) errors.push('Teléfono inválido.');
  if (!optionalText(observaciones, 65535)) errors.push('Observaciones inválidas.');
  if (!['EXPERIENCIA', 'HOSPEDAJE'].includes(tipo)) errors.push('Tipo de reserva inválido.');
  if (tipo === 'EXPERIENCIA' && (!integer(experienceId) || accommodationId != null)) errors.push('Selecciona solo una experiencia válida.');
  if (tipo === 'HOSPEDAJE' && (!integer(accommodationId) || experienceId != null)) errors.push('Selecciona solo un hospedaje válido.');
  if (!validDate(fechaLlegada)) errors.push('Fecha de llegada inválida.');
  if (!validDate(fechaSalida)) errors.push('Fecha de salida inválida.');
  if (validDate(fechaLlegada) && validDate(fechaSalida) && fechaSalida <= fechaLlegada) errors.push('La fecha de salida debe ser posterior a la llegada.');
  if (!integer(personas) || Number(personas) > 50) errors.push('Número de personas debe ser entre 1 y 50.');
  if (errors.length) return res.status(400).json({ errors });
  next();
}

const schemas = {
  experience: {
    required: ['nombre', 'shortDescription', 'description', 'category', 'location', 'duration', 'price', 'image'],
    strings: { nombre: 200, shortDescription: 500, description: 65535, category: 80, location: 150, district: 150, duration: 80, difficulty: 50, groupSize: 80, image: 500 },
    arrays: ['gallery', 'includes', 'excludes', 'tags'], extra: ['itinerary', 'featured', 'destinationId'],
  },
  accommodation: {
    required: ['nombre', 'description', 'type', 'location', 'price', 'image'],
    strings: { nombre: 200, description: 65535, type: 80, location: 150, district: 150, address: 300, image: 500 },
    arrays: ['gallery', 'amenities'], extra: ['capacity', 'rooms', 'featured', 'destinationId'],
  },
  destination: {
    required: ['nombre', 'description', 'image'],
    strings: { nombre: 150, description: 65535, image: 500, province: 100, altitude: 50, climate: 80 },
    arrays: ['highlights'], extra: ['publicado'],
  },
};

function validateResource(type, partial = false) {
  return (req, res, next) => {
    if (!bodyObject(req.body)) return res.status(400).json({ error: 'Datos inválidos.' });
    const schema = schemas[type];
    const allowed = new Set([...Object.keys(schema.strings), ...schema.arrays, ...schema.extra, ...(type === 'destination' ? [] : ['price'])]);
    const errors = [];
    for (const key of Object.keys(req.body)) if (!allowed.has(key)) errors.push(`Campo no permitido: ${key}.`);
    for (const key of schema.required) if (!partial && req.body[key] === undefined) errors.push(`Falta ${key}.`);
    for (const [key, max] of Object.entries(schema.strings)) {
      const value = req.body[key];
      if (value !== undefined && !(schema.required.includes(key) ? text(value, max) : optionalText(value, max))) errors.push(`${key} inválido.`);
    }
    if (req.body.nombre !== undefined && text(req.body.nombre) && !slugify(req.body.nombre)) errors.push('El nombre debe contener letras o números.');
    if (req.body.price !== undefined && !priceIsValid(req.body.price)) errors.push('Precio inválido.');
    for (const key of schema.arrays) if (req.body[key] != null && !stringArray(req.body[key])) errors.push(`${key} debe ser una lista de textos.`);
    for (const key of ['capacity', 'rooms', 'destinationId']) if (req.body[key] != null && req.body[key] !== '' && !integer(req.body[key])) errors.push(`${key} debe ser un entero positivo.`);
    for (const key of ['featured', 'publicado']) if (req.body[key] !== undefined && typeof req.body[key] !== 'boolean') errors.push(`${key} debe ser verdadero o falso.`);
    if (req.body.itinerary != null && (!Array.isArray(req.body.itinerary) || req.body.itinerary.length > 100 || !req.body.itinerary.every(day => bodyObject(day) && integer(day.day) && optionalText(day.title, 200) && optionalText(day.description, 2000)))) errors.push('Itinerario inválido.');
    if (partial && !Object.keys(req.body).length) errors.push('No hay datos para actualizar.');
    if (errors.length) return res.status(400).json({ errors });
    next();
  };
}

module.exports = { slugify, createError, validateLogin, validateReservation, validateResource };
