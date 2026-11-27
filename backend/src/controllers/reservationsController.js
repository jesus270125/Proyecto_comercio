// src/controllers/reservationsController.js
// Toda la lógica de precios se calcula en el servidor — NO se confía en el cliente

const prisma = require('../config/database');
const { calculateReservationPricing } = require('../services/reservationPricing');
const { getCulqiTestConfig } = require('../services/culqiConfig');
const { hashToken, createOrder } = require('../services/culqiTestPayments');
const crypto = require('node:crypto');
const izipay = require('../services/izipaySandbox');
const mercadoPago = require('../services/mercadoPagoTest');
const mercadoPagoLive = require('../services/mercadoPagoLive');

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
    let nombreServicio;
    let noches = null;

    if (tipo === 'EXPERIENCIA') {
      const exp = await prisma.experience.findFirst({
        where: { id: parseInt(experienceId), publicado: true },
        select: { price: true, nombre: true },
      });
      if (!exp) return res.status(404).json({ error: 'Experiencia no encontrada o no disponible.' });
      precioUnitario = parseFloat(exp.price);
      nombreServicio = exp.nombre;
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
      nombreServicio = acc.nombre;
    }

    // Calcular importes en el servidor
    const { subtotal, serviceFee, total, depositCents } = calculateReservationPricing(
      precioUnitario, p, tipo === 'HOSPEDAJE' ? noches : 1,
    );
    const pilot = req.body.mercadoPagoPilot === true;
    if (pilot && !mercadoPagoLive.isPilotAdmin(req.user)) return res.sendStatus(403);
    const testConfig = pilot ? null : getCulqiTestConfig();
    const iziConfig = pilot ? null : izipay.config();
    const mpConfig = pilot ? null : mercadoPago.config();
    const live = pilot || process.env.MERCADOPAGO_LIVE_ENABLED === 'true' ? mercadoPagoLive.config() : null;
    if (pilot && !live) return res.status(503).json({ error: 'El piloto de Mercado Pago no está configurado.' });
    if (pilot && req.body.pagoSimulado) return res.status(400).json({ error: 'Selecciona un solo modo de pago.' });
    if (live && !await mercadoPagoLive.hasPaymentTable()) return res.status(503).json({ error: 'El cobro en línea no está disponible.' });
    if ([testConfig, iziConfig, mpConfig, live].filter(Boolean).length > 1) return res.status(503).json({ error: 'Hay más de un proveedor de pago habilitado.' });
    if (live && req.body.mercadoPagoLiveAccepted !== true) return res.status(409).json({ error: 'Recarga la página y revisa la tarifa para continuar con el pago.' });
    if (live && llegada < new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Lima' }).format(new Date())}T00:00:00Z`)) {
      return res.status(400).json({ error: 'Selecciona una fecha de llegada vigente.' });
    }
    if ((mpConfig || live) && depositCents <= 0) return res.status(400).json({ error: 'La tarifa debe ser mayor a cero.' });
    if (iziConfig && (!izipay.validBilling(req.body.izipayBilling) || guestNombre.trim().length < 2 || guestNombre.length > 50 || guestApellido.trim().length < 2 || guestApellido.length > 50 || guestEmail.length > 50 || !/^\d{7,15}$/.test(guestTelefono))) return res.status(400).json({ error: 'Revisa los datos de facturación para Izipay; el teléfono debe contener de 7 a 15 dígitos.' });
    if (iziConfig && depositCents <= 100) return res.status(400).json({ error: 'La tarifa debe ser mayor a S/ 1.00 para Izipay.' });
    if (testConfig && (depositCents < 600 || depositCents > 50000)) {
      return res.status(400).json({ error: 'La prueba con billetera requiere una tarifa entre S/ 6 y S/ 500.' });
    }
    const comprador = (mpConfig || live) && req.user?.id ? await prisma.user.findFirst({
      where: { id: req.user.id, email: guestEmail.trim().toLowerCase() },
      select: { createdAt: true },
    }) : null;
    const paymentToken = (testConfig || iziConfig || mpConfig || live) ? crypto.randomBytes(32).toString('hex') : null;

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
        ...(iziConfig ? { izipayPayment: { create: { accessHash: hashToken(paymentToken), amountCents: depositCents } } } : {}),
        ...(mpConfig ? { mercadoPagoTest: { create: { accessHash: hashToken(paymentToken), amountCents: depositCents } } } : {}),
        ...(live ? { mercadoPago: { create: {
          accessHash: hashToken(paymentToken), amountCents: depositCents,
          serviceName: nombreServicio, registrationDate: comprador?.createdAt,
        } } } : {}),
      },
      ...(live ? { include: { mercadoPago: true } } : {}),
    });

    let testPayment = null;
    let izipayTest = null;
    let mercadoPagoTest = null;
    let mercadoPagoPayment = null;
    if (live) {
      const payment = { ...reservation.mercadoPago, reservation };
      const current = await mercadoPagoLive.createOrder(payment, pilot ? req.user : undefined).catch(() => payment);
      mercadoPagoPayment = { ...mercadoPagoLive.publicPayment(current, pilot ? req.user : undefined), accessToken: paymentToken };
    }
    if (mpConfig) {
      try {
        const payment = await prisma.mercadoPagoTestPayment.findUnique({ where: { reservationId: reservation.id } });
        const url = await mercadoPago.createOrder(reservation, payment, {
          nombreServicio,
          fechaRegistro: comprador?.createdAt,
          usarDocumentoDePrueba: req.body.mercadoPagoTestDocument === true,
        });
        mercadoPagoTest = { url, accessToken: paymentToken, amountCents: depositCents };
      } catch {
        return res.status(502).json({ error: `No se pudo iniciar el pago de prueba. La solicitud ${reservation.codigo} quedó pendiente; contacta al administrador antes de intentar nuevamente.` });
      }
    }
    if (iziConfig) {
      try {
        const payment = await prisma.izipayPayment.findUnique({ where: { reservationId: reservation.id } });
        const url = await izipay.createLink(reservation, payment, req.body.izipayBilling);
        izipayTest = { url, accessToken: paymentToken, amountCents: depositCents };
      } catch {
        return res.status(502).json({ error: `No se pudo iniciar el pago de prueba. La solicitud ${reservation.codigo} quedó pendiente; contacta al administrador antes de intentar nuevamente.` });
      }
    }
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
        izipayTest,
        mercadoPagoTest,
        mercadoPago: mercadoPagoPayment,
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
        izipayPayment: { select: { status: true, amountCents: true } },
        mercadoPagoTest: { select: { status: true, amountCents: true } },
        ...(await mercadoPagoLive.hasPaymentTable() ? { mercadoPago: { select: { status: true, amountCents: true } } } : {}),
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
      estadoPago: r.mercadoPago?.status || r.estadoPago,
      izipayLink: r.izipayLink,
      izipayReference: r.izipayReference,
      izipayPaidAt: r.izipayPaidAt,
      izipayTest: r.izipayPayment,
      mercadoPagoTest: r.mercadoPagoTest,
      mercadoPago: r.mercadoPago,
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
        ...(await mercadoPagoLive.hasPaymentTable() ? { mercadoPago: { select: { status: true, amountCents: true } } } : {}),
      },
    });
    if (!r) return res.status(404).json({ error: 'Reserva no encontrada.' });
    res.json({ data: { ...r, estadoPago: r.mercadoPago?.status || r.estadoPago } });
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

    const target = estado.toUpperCase();
    const allowedPayment = target === 'CANCELADA'
      ? ['CANCELADA', 'RECHAZADA', 'REEMBOLSADA']
      : ['PAGADA'];
    const guarded = target !== 'PENDIENTE' && await mercadoPagoLive.hasPaymentTable();
    const updated = await prisma.reservation.updateMany({
      where: { id, ...(guarded ? { OR: [
        { mercadoPago: null }, { mercadoPago: { status: { in: allowedPayment } } },
      ] } : {}) },
      data: { estado: target },
    });
    if (!updated.count) {
      const exists = await prisma.reservation.findUnique({ where: { id }, select: { id: true } });
      if (!exists) return res.sendStatus(404);
      return res.status(409).json({ error: 'Verifica el estado del pago de Mercado Pago antes de cambiar la reserva.' });
    }
    const r = await prisma.reservation.findUnique({ where: { id }, select: { id: true, codigo: true, estado: true } });
    res.json({ data: r });
  } catch (err) { next(err); }
}

async function adminDelete(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    if (await mercadoPagoLive.hasPaymentTable() && await prisma.mercadoPagoPayment.findUnique({ where: { reservationId: id }, select: { id: true } })) {
      return res.status(409).json({ error: 'La reserva tiene un registro de cobro que debe conservarse.' });
    }
    await prisma.reservation.delete({ where: { id } });
    res.json({ message: 'Reserva eliminada.' });
  } catch (err) {
    if (err.code === 'P2003') return res.status(409).json({ error: 'La reserva tiene un registro de cobro que debe conservarse.' });
    next(err);
  }
}

async function adminRefreshIzipayTest(req, res, next) {
  try {
    const payment = await prisma.izipayPayment.findUnique({ where: { reservationId: Number(req.params.id) }, include: { reservation: true } });
    if (!payment) return res.status(404).json({ error: 'Pago de prueba no encontrado.' });
    const current = await izipay.reconcile(payment);
    res.json({ data: { status: current.status, amountCents: current.amountCents } });
  } catch (err) { next(err); }
}

async function adminRefreshMercadoPagoTest(req, res, next) {
  try {
    const payment = await prisma.mercadoPagoTestPayment.findUnique({ where: { reservationId: Number(req.params.id) }, include: { reservation: true } });
    if (!payment) return res.status(404).json({ error: 'Pago de prueba no encontrado.' });
    const current = await mercadoPago.reconcile(payment);
    res.json({ data: { status: current.status, amountCents: current.amountCents } });
  } catch (err) { next(err); }
}

// Registro manual: el administrador verifica la operación directamente en Izipay.
async function adminUpdateIzipay(req, res, next) {
  try {
    const { link, reference, paid } = req.body || {};
    if (typeof paid !== 'boolean' || typeof link !== 'string' || link.length > 2048 || typeof reference !== 'string' || reference.length > 150)
      return res.status(400).json({ error: 'Datos de pago inválidos.' });
    let url;
    try { url = new URL(link.trim()); } catch { return res.status(400).json({ error: 'Ingresa un enlace HTTPS válido.' }); }
    if (url.protocol !== 'https:' || url.username || url.password)
      return res.status(400).json({ error: 'Ingresa un enlace HTTPS válido sin credenciales.' });
    if (paid && !reference.trim()) return res.status(400).json({ error: 'Ingresa la referencia de la operación verificada en Izipay.' });
    const existing = await prisma.reservation.findUnique({
      where: { id: Number(req.params.id) },
      ...(await mercadoPagoLive.hasPaymentTable() ? { include: { mercadoPago: { select: { id: true } } } } : {}),
    });
    if (!existing) return res.status(404).json({ error: 'Reserva no encontrada.' });
    if (existing.mercadoPago) return res.status(409).json({ error: 'Esta reserva ya tiene un pago de Mercado Pago.' });
    if (paid && existing.izipayLink !== link.trim()) return res.status(400).json({ error: 'Guarda el enlace antes de registrar el pago.' });
    if (paid && existing.estado === 'CANCELADA') return res.status(409).json({ error: 'No se puede registrar un pago para una reserva cancelada.' });
    if (existing.izipayPaidAt && (!paid || existing.izipayLink !== link.trim() || existing.izipayReference !== reference.trim()))
      return res.status(409).json({ error: 'Este pago ya fue registrado. Revisa cualquier corrección con administración.' });
    const updated = await prisma.reservation.update({
      where: { id: existing.id },
      data: { izipayLink: link.trim(), izipayReference: paid ? reference.trim() : null, izipayPaidAt: paid ? (existing.izipayPaidAt || new Date()) : null },
      select: { izipayLink: true, izipayReference: true, izipayPaidAt: true },
    });
    res.json({ data: updated });
  } catch (err) { next(err); }
}

module.exports = { create, adminList, adminDetail, adminUpdateEstado, adminDelete, adminUpdateIzipay, adminRefreshIzipayTest, adminRefreshMercadoPagoTest };
