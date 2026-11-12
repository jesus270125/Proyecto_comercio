// src/controllers/reservationsController.js
// Toda la lógica de precios se calcula en el servidor — NO se confía en el cliente

const prisma = require('../config/database');

/** Genera un código único tipo APU-XXXXXXXX */
function generateCode() {
  return 'APU-' + Math.random().toString(36).substr(2, 8).toUpperCase();
}

/** Calcula número de noches entre dos fechas */
function calcNoches(llegada, salida) {
  const ms = new Date(salida) - new Date(llegada);
  return Math.max(1, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

// POST /api/v1/reservations  (público — invitados pueden reservar)
async function create(req, res, next) {
  try {
    const {
      guestNombre, guestApellido, guestEmail, guestTelefono,
      observaciones, tipo, experienceId, accommodationId,
      fechaLlegada, fechaSalida, personas,
    } = req.body;

    const p = parseInt(personas);
    const llegada = new Date(fechaLlegada);
    const salida = new Date(fechaSalida);

    // Verificar que el recurso existe y está publicado
    let precioUnitario;
    let noches = null;

    if (tipo === 'EXPERIENCIA') {
      const exp = await prisma.experience.findFirst({
        where: { id: parseInt(experienceId), publicado: true },
        select: { price: true, nombre: true },
      });
      if (!exp) return res.status(404).json({ error: 'Experiencia no encontrada o no disponible.' });
      precioUnitario = parseFloat(exp.price);
    } else {
      const acc = await prisma.accommodation.findFirst({
        where: { id: parseInt(accommodationId), publicado: true },
        select: { price: true, capacity: true, nombre: true },
      });
      if (!acc) return res.status(404).json({ error: 'Hospedaje no encontrado o no disponible.' });
      if (acc.capacity && p > acc.capacity)
        return res.status(400).json({ error: `El hospedaje tiene capacidad máxima de ${acc.capacity} personas.` });
      noches = calcNoches(fechaLlegada, fechaSalida);
      precioUnitario = parseFloat(acc.price);
    }

    // Calcular importes en el servidor
    const subtotal = tipo === 'HOSPEDAJE'
      ? precioUnitario * p * noches
      : precioUnitario * p;

    const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
    const total = Math.round((subtotal + serviceFee) * 100) / 100;

    // Generar código único (reintento en caso de colisión)
    let codigo;
    let attempts = 0;
    do {
      codigo = generateCode();
      attempts++;
    } while (
      attempts < 5 &&
      await prisma.reservation.findUnique({ where: { codigo } })
    );

    const reservation = await prisma.reservation.create({
      data: {
        codigo,
        guestNombre, guestApellido, guestEmail, guestTelefono,
        observaciones,
        tipo,
        experienceId: tipo === 'EXPERIENCIA' ? parseInt(experienceId) : null,
        accommodationId: tipo === 'HOSPEDAJE' ? parseInt(accommodationId) : null,
        fechaLlegada: llegada,
        fechaSalida: salida,
        personas: p,
        noches,
        precioUnitario,
        subtotal,
        serviceFee,
        total,
        userId: req.user?.id || null,
      },
    });

    res.status(201).json({
      data: {
        id: reservation.id,
        codigo: reservation.codigo,
        precioUnitario: reservation.precioUnitario,
        subtotal: reservation.subtotal,
        serviceFee: reservation.serviceFee,
        total: reservation.total,
        estado: reservation.estado,
      },
    });
  } catch (err) { next(err); }
}

// ── ADMIN ─────────────────────────────────────────────────

async function adminList(req, res, next) {
  try {
    const { estado, q } = req.query;
    const where = {};
    if (estado && estado !== 'todas') where.estado = estado.toUpperCase();
    if (q) {
      where.OR = [
        { guestNombre: { contains: q } },
        { guestApellido: { contains: q } },
        { codigo: { contains: q } },
        { guestEmail: { contains: q } },
      ];
    }

    const items = await prisma.reservation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        experience: { select: { nombre: true } },
        accommodation: { select: { nombre: true } },
      },
    });

    // Formatear para el frontend
    const data = items.map(r => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.guestNombre,
      apellido: r.guestApellido,
      correo: r.guestEmail,
      telefono: r.guestTelefono,
      observaciones: r.observaciones,
      nombreItem: r.experience?.nombre || r.accommodation?.nombre || '',
      tipo: r.tipo,
      llegada: r.fechaLlegada?.toISOString().split('T')[0],
      salida: r.fechaSalida?.toISOString().split('T')[0],
      personas: r.personas,
      noches: r.noches,
      precioUnitario: parseFloat(r.precioUnitario),
      subtotal: parseFloat(r.subtotal),
      serviceFee: parseFloat(r.serviceFee),
      total: parseFloat(r.total),
      estado: r.estado.toLowerCase(),
      createdAt: r.createdAt,
    }));

    res.json({ data, total: data.length });
  } catch (err) { next(err); }
}

async function adminDetail(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const r = await prisma.reservation.findUnique({
      where: { id },
      include: {
        experience: { select: { id: true, nombre: true, slug: true } },
        accommodation: { select: { id: true, nombre: true, slug: true } },
        user: { select: { id: true, nombre: true, email: true } },
      },
    });
    if (!r) return res.status(404).json({ error: 'Reserva no encontrada.' });
    res.json({ data: r });
  } catch (err) { next(err); }
}

// PATCH /api/v1/admin/reservations/:id/estado
async function adminUpdateEstado(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const { estado } = req.body;
    const VALID = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];
    if (!VALID.includes(estado?.toUpperCase()))
      return res.status(400).json({ error: `Estado inválido. Opciones: ${VALID.join(', ')}` });

    const r = await prisma.reservation.update({
      where: { id },
      data: { estado: estado.toUpperCase() },
      select: { id: true, codigo: true, estado: true },
    });
    res.json({ data: r });
  } catch (err) { next(err); }
}

async function adminDelete(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await prisma.reservation.delete({ where: { id } });
    res.json({ message: 'Reserva eliminada.' });
  } catch (err) { next(err); }
}

module.exports = { create, adminList, adminDetail, adminUpdateEstado, adminDelete };
