// src/controllers/reservationsController.js
// Toda la lógica de precios se calcula en el servidor — NO se confía en el cliente

const prisma = require('../config/database');
const { calculateReservationPricing } = require('../services/reservationPricing');
const { getCulqiTestConfig } = require('../services/culqiConfig');
const { hashToken, createOrder } = require('../services/culqiTestPayments');
const crypto = require('node:crypto');

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

    if (req.body.pagoSimulado && !(process.env.NODE_ENV === 'development' && process.env.PAYMENT_DEMO_ENABLED === 'true')) {
      return res.status(403).json({ error: 'La simulación de pago no está habilitada.' });
    }

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
    const { subtotal, serviceFee, total, depositCents } = calculateReservationPricing(
      precioUnitario, p, tipo === 'HOSPEDAJE' ? noches : 1,
    );
    const testConfig = getCulqiTestConfig();
    if (testConfig && (depositCents < 600 || depositCents > 50000)) {
      return res.status(400).json({ error: 'La prueba con billetera requiere una tarifa entre S/ 6 y S/ 500.' });
    }
    const paymentToken = testConfig ? crypto.randomBytes(32).toString('hex') : null;

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
        estadoPago: req.body.pagoSimulado ? 'SIMULADO' : 'SIN_PAGO',
        userId: req.user?.id || null,
        ...(testConfig ? { testPayment: { create: { accessHash: hashToken(paymentToken), amountCents: depositCents, expiresAt: new Date(Date.now() + 30 * 60 * 1000) } } } : {}),
      },
    });

    let testPayment = null;
    if (testConfig) {
      try { testPayment = await createOrder(reservation, paymentToken); }
      catch {
        return res.status(502).json({ error: `No se pudo iniciar el pago de prueba. La solicitud ${reservation.codigo} quedó pendiente; contacta al administrador antes de intentar nuevamente.` });
      }
    }

    res.status(201).json({
      data: {
        id: reservation.id,
        codigo: reservation.codigo,
        precioUnitario: reservation.precioUnitario,
        subtotal: reservation.subtotal,
        serviceFee: reservation.serviceFee,
        total: reservation.total,
        estado: reservation.estado,
        estadoPago: reservation.estadoPago,
        testPayment,
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
        testPayment: { select: { status: true, amountCents: true, expiresAt: true } },
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
      estadoPago: r.estadoPago,
      pagoPrueba: r.testPayment && r.testPayment.status !== 'PAGADA_PRUEBA' && r.testPayment.expiresAt < new Date()
        ? { ...r.testPayment, status: 'VENCIDA' } : r.testPayment,
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
    const { estado } = req.body || {};
    const VALID = ['PENDIENTE', 'CONFIRMADA', 'CANCELADA', 'COMPLETADA'];
    if (typeof estado !== 'string' || !VALID.includes(estado.toUpperCase()))
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
