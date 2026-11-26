// Checkout Pro Orders: exclusivo para pruebas, no habilita cobros reales.
const crypto = require('node:crypto');
const prisma = require('../config/database');
const { hashToken } = require('./culqiTestPayments');

function config() {
  if (process.env.MERCADOPAGO_TEST_ENABLED !== 'true') return null;
  const token = process.env.MERCADOPAGO_TEST_ACCESS_TOKEN;
  const secret = process.env.MERCADOPAGO_TEST_WEBHOOK_SECRET;
  const sellerId = process.env.MERCADOPAGO_TEST_SELLER_ID;
  const integratorId = process.env.MERCADOPAGO_TEST_INTEGRATOR_ID?.trim();
  if (!token || !secret || !/^\d+$/.test(sellerId || '')) {
    throw Object.assign(new Error('Configuración de Mercado Pago de prueba incompleta.'), { status: 503 });
  }
  return { token, secret, sellerId, integratorId };
}

async function api(path, options = {}) {
  const c = config();
  if (!c) throw Object.assign(new Error('Mercado Pago de prueba no está habilitado.'), { status: 503 });
  const response = await fetch('https://api.mercadopago.com' + path, {
    ...options,
    headers: { Authorization: `Bearer ${c.token}`, 'Content-Type': 'application/json', ...options.headers },
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw Object.assign(new Error('Mercado Pago no pudo procesar la solicitud de prueba.'), { status: 502 });
  return data;
}

function verifyOrder(order, payment, sellerId) {
  const money = value => typeof value === 'string' && /^\d+\.\d{2}$/.test(value) ? Math.round(Number(value) * 100) : -1;
  if (order.id !== payment.providerId || !/^ORDTST[A-Za-z0-9]+$/.test(order.id || '') ||
      String(order.user_id) !== sellerId || order.external_reference !== payment.reservation.codigo ||
      order.currency !== 'PEN' || money(order.total_amount) !== payment.amountCents) {
    throw Object.assign(new Error('La orden de Mercado Pago no coincide con la reserva de prueba.'), { status: 502 });
  }
  if (order.status === 'processed' && order.status_detail === 'accredited' && money(order.total_paid_amount) === payment.amountCents) return 'PAGADA_PRUEBA';
  if (order.status === 'refunded' || order.status_detail === 'partially_refunded' || order.status === 'charged_back') return 'REEMBOLSADA';
  if (order.status === 'canceled' || order.status === 'cancelled' || order.status === 'expired') return 'CANCELADA';
  if (order.status === 'failed') return 'RECHAZADA';
  return 'PENDIENTE';
}

async function createOrder(reservation, payment) {
  const c = config();
  // El identificador debe ser el de la cuenta de vendedor de prueba de la aplicación.
  const seller = await api('/users/me');
  if (String(seller.id) !== c.sellerId) throw new Error('La cuenta no coincide con el vendedor de prueba configurado.');
  const amount = (payment.amountCents / 100).toFixed(2);
  const order = await api('/v1/orders', { method: 'POST', headers: { 'X-Idempotency-Key': `reserva-test-${reservation.id}` }, body: JSON.stringify({
    type: 'online', processing_mode: 'manual', total_amount: amount, external_reference: reservation.codigo,
    description: `Tarifa de prueba ${reservation.codigo}`,
    payer: { email: reservation.guestEmail },
    config: { statement_descriptor: 'APURIMAC TUR' },
    ...(c.integratorId ? { integration_data: { integrator_id: c.integratorId } } : {}),
    items: [{ title: `Tarifa de reserva ${reservation.codigo}`, unit_price: amount, quantity: 1 }],
  }) });
  const candidate = { ...payment, providerId: order.id, reservation };
  if (verifyOrder(order, candidate, c.sellerId) !== 'PENDIENTE') throw new Error('Estado inicial inválido.');
  const url = new URL(order.checkout_url);
  if (url.protocol !== 'https:' || url.hostname !== 'www.mercadopago.com.pe' || url.username || url.password || !url.pathname.startsWith('/checkout/')) throw new Error('URL de pago inválida.');
  await prisma.mercadoPagoTestPayment.update({ where: { id: payment.id }, data: { providerId: order.id, paymentUrl: url.href, status: 'PENDIENTE' } });
  return url.href;
}

async function reconcile(payment) {
  if (!payment.providerId) return payment;
  const order = await api(`/v1/orders/${encodeURIComponent(payment.providerId)}`);
  const status = verifyOrder(order, payment, config().sellerId);
  // Evita que consultas simultáneas sobrescriban un estado más reciente.
  await prisma.mercadoPagoTestPayment.updateMany({ where: { id: payment.id, updatedAt: payment.updatedAt }, data: { status } });
  return prisma.mercadoPagoTestPayment.findUnique({ where: { id: payment.id }, include: { reservation: true } });
}

function validSignature(signature, requestId, dataId, secret) {
  if (typeof signature !== 'string' || typeof requestId !== 'string' || !requestId || !/^ORDTST[A-Za-z0-9]+$/.test(dataId || '') || !secret) return false;
  const parts = Object.fromEntries(signature.split(',').map(x => x.trim().split('=')));
  if (!/^\d+$/.test(parts.ts || '') || !/^[a-f0-9]{64}$/i.test(parts.v1 || '')) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${parts.ts};`;
  const expected = crypto.createHmac('sha256', secret).update(manifest).digest();
  const received = Buffer.from(parts.v1, 'hex');
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

async function status(req, res, next) {
  try {
    const token = req.get('X-Payment-Token');
    if (!/^[a-f0-9]{64}$/.test(token || '')) return res.sendStatus(404);
    const payment = await prisma.mercadoPagoTestPayment.findUnique({ where: { accessHash: hashToken(token) }, include: { reservation: true } });
    if (!payment) return res.sendStatus(404);
    const current = await reconcile(payment);
    res.set('Cache-Control', 'no-store').json({ status: current.status });
  } catch (error) { next(error); }
}

async function webhook(req, res, next) {
  try {
    const c = config();
    if (!c) return res.sendStatus(404);
    const id = req.query['data.id'];
    if (!validSignature(req.get('x-signature'), req.get('x-request-id'), id, c.secret)) return res.sendStatus(401);
    if (req.body?.type !== 'order' || req.body?.data?.id !== id) return res.sendStatus(400);
    const payment = await prisma.mercadoPagoTestPayment.findUnique({ where: { providerId: id }, include: { reservation: true } });
    if (!payment) return res.sendStatus(503);
    await reconcile(payment);
    return res.sendStatus(200);
  } catch (error) { next(error); }
}
module.exports = { config, createOrder, reconcile, status, webhook, validSignature, verifyOrder };
