const { WebhookSignatureValidator } = require('mercadopago');
const { readFile } = require('node:fs/promises');
const path = require('node:path');
const prisma = require('../config/database');
const { hashToken } = require('./culqiTestPayments');
const { getSeller, ordersClient } = require('./mercadoPagoTest');

const liveOrderId = /^ORD(?!TST)[A-Z0-9]{12,97}$/i;
const accessToken = /^[a-f0-9]{64}$/;
const pending = new Set(['CREANDO', 'PENDIENTE', 'EN_PROCESO']);
const reversed = new Set(['REEMBOLSO_PARCIAL', 'REEMBOLSADA', 'CONTRACARGO']);
const fail = (message, status = 502) => Object.assign(new Error(message), { status });

function configured() {
  return process.env.MERCADOPAGO_LIVE_ENABLED === 'true' || Boolean(process.env.MERCADOPAGO_LIVE_ACCESS_TOKEN);
}

function isPilotAdmin(user) {
  return process.env.NODE_ENV === 'production' && process.env.MERCADOPAGO_LIVE_PILOT_ENABLED === 'true' &&
    user?.role === 'ADMIN' && Number.isSafeInteger(user.id) && user.id > 0;
}

function canUsePilot(user, payment) {
  return isPilotAdmin(user) && payment.reservation.userId === user.id;
}

let paymentTable;
let checkedUntil = 0;
async function hasPaymentTable() {
  if (Date.now() < checkedUntil) return paymentTable;
  const [result] = await prisma.$queryRaw`
    SELECT COUNT(*) AS total FROM information_schema.TABLES
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'mercadopago_payments'
  `;
  paymentTable = Number(result.total) === 1;
  checkedUntil = Date.now() + 60000;
  return paymentTable;
}

async function migratePaymentTable() {
  if (await hasPaymentTable()) return;
  // DDL estático del repositorio, sin entrada de usuarios ni secretos interpolados.
  const migration = await readFile(path.join(__dirname, '../../prisma/mercadopago_live.sql'), 'utf8');
  await prisma.$executeRawUnsafe(migration);
  checkedUntil = 0;
  if (!await hasPaymentTable()) throw fail('No se pudo inicializar la tabla de pagos.');
}

function config() {
  if (!configured()) return null;
  const token = process.env.MERCADOPAGO_LIVE_ACCESS_TOKEN;
  const sellerId = process.env.MERCADOPAGO_LIVE_SELLER_ID;
  const applicationId = process.env.MERCADOPAGO_LIVE_APPLICATION_ID;
  const secret = process.env.MERCADOPAGO_LIVE_WEBHOOK_SECRET;
  const integratorId = process.env.MERCADOPAGO_LIVE_INTEGRATOR_ID?.trim();
  let front;
  try { front = new URL(process.env.FRONTEND_URL); } catch { /* se valida abajo */ }
  if (!/^APP_USR-/.test(token || '') || !/^\d+$/.test(sellerId || '') ||
      !/^\d+$/.test(applicationId || '') || !secret || front?.protocol !== 'https:' ||
      front.username || front.password) {
    throw fail('La configuración de Mercado Pago para cobros reales está incompleta.', 503);
  }
  const enabled = process.env.MERCADOPAGO_LIVE_ENABLED === 'true';
  if (enabled && (process.env.NODE_ENV !== 'production' ||
      ['MERCADOPAGO_TEST_ENABLED', 'CULQI_TEST_ENABLED', 'IZIPAY_SANDBOX_ENABLED',
        'IZIPAY_MANUAL_ENABLED', 'PAYMENT_DEMO_ENABLED'].some(key => process.env[key] === 'true'))) {
    throw fail('Configura un solo modo de pago para habilitar los cobros reales.', 503);
  }
  return { token, sellerId, applicationId, secret, integratorId, enabled, origin: front.origin };
}

function verifyOrder(order, payment, settings) {
  const money = value => typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value)
    ? Math.round(Number(value) * 100) : -1;
  if (!liveOrderId.test(order?.id || '') || (payment.providerId && order.id !== payment.providerId) ||
      String(order.user_id) !== settings.sellerId ||
      String(order.integration_data?.application_id) !== settings.applicationId ||
      order.external_reference !== payment.reservation.codigo || order.currency !== 'PEN' ||
      money(order.total_amount) !== payment.amountCents) {
    throw fail('La orden no coincide con el pago registrado.');
  }
  if (order.status === 'processed' && order.status_detail === 'accredited') {
    if (money(order.total_paid_amount) !== payment.amountCents) throw fail('El importe acreditado no coincide.');
    return 'PAGADA';
  }
  if (order.status === 'charged_back') return 'CONTRACARGO';
  if (order.status === 'refunded') return 'REEMBOLSADA';
  if (order.status_detail === 'partially_refunded') return 'REEMBOLSO_PARCIAL';
  if (['canceled', 'cancelled', 'expired'].includes(order.status)) return 'CANCELADA';
  if (order.status === 'failed') return 'RECHAZADA';
  return order.status === 'created' ? 'PENDIENTE' : 'EN_PROCESO';
}

function orderBody(payment, settings) {
  const { reservation } = payment;
  const amount = (payment.amountCents / 100).toFixed(2);
  const back = new URL('/estado-pago', settings.origin);
  back.searchParams.set('reserva', reservation.codigo);
  const returnTo = state => {
    const url = new URL(back);
    url.searchParams.set('resultado', state);
    return url.href;
  };
  return {
    type: 'online',
    processing_mode: 'manual',
    total_amount: amount,
    external_reference: reservation.codigo,
    expiration_time: 'P1D',
    description: `Tarifa de reserva ${reservation.codigo}`,
    payer: { email: reservation.guestEmail.trim(), first_name: reservation.guestNombre.trim(), last_name: reservation.guestApellido.trim() },
    config: {
      statement_descriptor: 'APURIMAC TUR',
      online: {
        success_url: returnTo('aprobado'),
        pending_url: returnTo('pendiente'),
        failure_url: returnTo('rechazado'),
        auto_return: 'approved',
      },
    },
    ...(settings.integratorId ? { integration_data: { integrator_id: settings.integratorId } } : {}),
    ...(payment.registrationDate ? { additional_info: { 'payer.registration_date': payment.registrationDate.toISOString() } } : {}),
    items: [{
      title: `Tarifa de reserva ${reservation.codigo}`,
      description: `Tarifa del 5 % por reservar ${payment.serviceName}.`,
      category_id: 'travel',
      unit_price: amount,
      quantity: 1,
    }],
  };
}

async function createOrder(payment, user) {
  const settings = config();
  if (!settings || (!settings.enabled && !canUsePilot(user, payment))) {
    throw fail('El cobro de nuevas reservas está desactivado.', 503);
  }
  if (payment.providerId) return payment;
  if (payment.reservation.estado !== 'PENDIENTE') throw fail('La reserva ya no admite un nuevo checkout.', 409);
  await verifySeller(settings);
  const order = await ordersClient(settings.token).create({
    requestOptions: { idempotencyKey: `apurimac-live-${payment.reservation.codigo}` },
    body: orderBody(payment, settings),
  }).catch(() => { throw fail('No se pudo preparar el checkout de Mercado Pago.'); });
  const status = verifyOrder(order, payment, settings);
  if (status !== 'PENDIENTE' && status !== 'EN_PROCESO') throw fail('La orden devolvió un estado inicial inesperado.');
  const url = new URL(order.checkout_url);
  if (url.protocol !== 'https:' || url.hostname !== 'www.mercadopago.com.pe' || url.port ||
      url.username || url.password || !url.pathname.startsWith('/checkout/') ||
      (url.searchParams.has('order_id') && url.searchParams.get('order_id') !== order.id)) throw fail('La URL de pago es inválida.');
  await prisma.mercadoPagoPayment.updateMany({
    where: { id: payment.id, providerId: null },
    data: { providerId: order.id, paymentUrl: url.href, status, version: { increment: 1 } },
  });
  return prisma.mercadoPagoPayment.findUnique({ where: { id: payment.id }, include: { reservation: true } });
}

async function verifySeller(settings = config()) {
  if (!settings) return false;
  const seller = await getSeller(settings.token);
  if (String(seller.id) !== settings.sellerId || seller.site_id !== 'MPE' || !Array.isArray(seller.tags) ||
      seller.tags.includes('test_user') || /@testuser\.com$/i.test(seller.email || '')) {
    throw fail('La credencial no corresponde a la cuenta vendedora de producción en Perú.');
  }
  return true;
}

async function reconcile(payment) {
  if (!payment.providerId) return payment;
  const settings = config();
  if (!settings) throw fail('No se puede consultar Mercado Pago.', 503);
  const order = await ordersClient(settings.token).get({ id: payment.providerId })
    .catch(() => { throw fail('No se pudo consultar el estado de Mercado Pago.'); });
  const status = verifyOrder(order, payment, settings);
  // Una respuesta atrasada nunca vuelve pendiente un pago ya acreditado o cerrado.
  if (status !== payment.status && !(pending.has(status) && !pending.has(payment.status)) &&
      !(reversed.has(payment.status) && status === 'PAGADA')) {
    const updated = await prisma.mercadoPagoPayment.updateMany({
      where: { id: payment.id, version: payment.version },
      data: { status, version: { increment: 1 } },
    });
    if (updated.count) return { ...payment, status, version: payment.version + 1 };
    if (status === 'PAGADA' || !pending.has(status)) {
      // El proveedor volverá a entregar el evento si otra consulta ganó la carrera.
      throw fail('El estado cambió mientras se consultaba. Vuelve a intentarlo.', 503);
    }
  }
  return prisma.mercadoPagoPayment.findUnique({ where: { id: payment.id }, include: { reservation: true } });
}

function publicPayment(payment, user) {
  return {
    status: payment.status,
    amountCents: payment.amountCents,
    url: payment.status === 'PENDIENTE' && payment.reservation.estado !== 'CANCELADA' &&
      (process.env.MERCADOPAGO_LIVE_ENABLED === 'true' || canUsePilot(user, payment)) ? payment.paymentUrl : null,
  };
}

async function purchaserPayment(req, res, next) {
  try {
    const token = req.get('X-Payment-Token');
    if (!configured() || !accessToken.test(token || '')) return res.sendStatus(404);
    const payment = await prisma.mercadoPagoPayment.findUnique({
      where: { accessHash: hashToken(token) }, include: { reservation: true },
    });
    if (!payment || payment.reservation.codigo !== req.params.codigo) return res.sendStatus(404);
    const current = req.method === 'POST' && !payment.providerId ? await createOrder(payment, req.user) : await reconcile(payment);
    return res.set('Cache-Control', 'no-store').json(publicPayment(current, req.user));
  } catch (err) { next(err); }
}

const diagnosticTimes = new Map();
function pilotWebhookDiagnostic(reason) {
  if (process.env.MERCADOPAGO_LIVE_PILOT_ENABLED !== 'true' || process.env.MERCADOPAGO_LIVE_ENABLED === 'true') return;
  const now = Date.now();
  if (now - (diagnosticTimes.get(reason) || 0) < 60000) return;
  diagnosticTimes.set(reason, now);
  console.info(`Mercado Pago productivo (piloto): ${reason}.`);
}

function invalidSignatureReason(req, secret, id) {
  const xSignature = req.get('x-signature');
  const xRequestId = req.get('x-request-id');
  if (typeof id !== 'string' || !liveOrderId.test(id)) return 'ID de orden productiva ausente o inválido';
  if (!xRequestId || !xSignature) return 'cabeceras de firma incompletas';
  try {
    WebhookSignatureValidator.validate({ xSignature, xRequestId, dataId: id.toLowerCase(), secret });
    return null;
  } catch { return 'firma inválida'; }
}

async function webhook(req, res, next) {
  try {
    const settings = config();
    if (!settings) return res.sendStatus(404);
    const id = req.query['data.id'];
    const reason = invalidSignatureReason(req, settings.secret, id);
    if (reason) {
      pilotWebhookDiagnostic(reason);
      return res.sendStatus(401);
    }
    if (req.body?.type !== 'order' || req.body?.data?.id !== id) {
      pilotWebhookDiagnostic('cuerpo de notificación incompatible');
      return res.sendStatus(400);
    }
    const payment = await prisma.mercadoPagoPayment.findUnique({ where: { providerId: id }, include: { reservation: true } });
    if (!payment) {
      console.info('Mercado Pago productivo: notificación firmada sin reserva asociada.');
      return res.sendStatus(503);
    }
    await reconcile(payment);
    console.info('Mercado Pago productivo: notificación firmada conciliada.');
    return res.sendStatus(200);
  } catch (err) { next(err); }
}

async function adminAction(req, res, next) {
  try {
    const settings = config();
    if (!settings) return res.sendStatus(404);
    const id = Number(req.params.id);
    if (!Number.isSafeInteger(id) || id < 1) return res.sendStatus(400);
    const payment = await prisma.mercadoPagoPayment.findUnique({
      where: { reservationId: id }, include: { reservation: true },
    });
    if (!payment) return res.sendStatus(404);
    const action = req.params.action;
    const latest = await reconcile(payment);
    if (action === 'refresh') return res.json({ data: publicPayment(latest) });
    if (!['cancel', 'refund'].includes(action) || req.body?.confirm !== true) return res.sendStatus(400);
    if (!latest.providerId || (action === 'cancel' ? latest.status !== 'PENDIENTE' : latest.status !== 'PAGADA')) {
      return res.status(409).json({ error: 'El estado actual del pago no permite esta operación.' });
    }
    const options = { id: latest.providerId, requestOptions: { idempotencyKey: `apurimac-${action}-${latest.providerId}` } };
    const client = ordersClient(settings.token);
    await (action === 'cancel' ? client.cancel(options) : client.refund(options))
      .catch(() => { throw fail('Mercado Pago no confirmó la operación. Consulta el estado antes de reintentar.'); });
    return res.json({ data: publicPayment(await reconcile(latest)) });
  } catch (err) { next(err); }
}

module.exports = { hasPaymentTable, migratePaymentTable, config, isPilotAdmin, createOrder, verifySeller, verifyOrder, orderBody, publicPayment, purchaserPayment, webhook, adminAction };
