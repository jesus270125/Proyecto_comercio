const crypto = require('node:crypto');
const prisma = require('../config/database');
const { getCulqiTestConfig } = require('./culqiConfig');

const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');

function verifiedStatus(order, payment, now = Date.now()) {
  if (order.id !== payment.providerId || Number(order.amount) !== payment.amountCents || order.currency_code !== 'PEN') {
    throw Object.assign(new Error('No se pudo verificar la orden de prueba.'), { status: 502 });
  }
  if (order.state === 'paid') return 'PAGADA_PRUEBA';
  if (order.state === 'expired' || now >= payment.expiresAt.getTime()) return 'VENCIDA';
  return 'PENDIENTE';
}

async function culqiRequest(path, options = {}) {
  const config = getCulqiTestConfig();
  if (!config) throw Object.assign(new Error('Los pagos de prueba no están disponibles.'), { status: 503 });
  const response = await fetch(`https://api.culqi.com/v2${path}`, {
    ...options,
    headers: { Authorization: `Bearer ${config.secretKey}`, 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error('Culqi no pudo procesar la orden de prueba.'), { status: 502 });
  return data;
}

async function createOrder(reservation, accessToken) {
  const config = getCulqiTestConfig();
  const payment = await prisma.testPayment.findUnique({ where: { reservationId: reservation.id } });
  if (!config || !payment || payment.status !== 'CREANDO') throw new Error('Pago de prueba no disponible.');
  const order = await culqiRequest('/orders', { method: 'POST', body: JSON.stringify({
    amount: payment.amountCents, currency_code: 'PEN', description: `Tarifa de prueba ${reservation.codigo}`,
    order_number: reservation.codigo,
    client_details: { first_name: reservation.guestNombre, last_name: reservation.guestApellido, email: reservation.guestEmail, phone_number: reservation.guestTelefono },
    expiration_date: Math.floor(payment.expiresAt.getTime() / 1000),
  }) });
  if (typeof order.id !== 'string' || !/^ord_test_[A-Za-z0-9]+$/.test(order.id)) throw new Error('Culqi no devolvió una orden de prueba válida.');
  await prisma.testPayment.update({ where: { id: payment.id }, data: { providerId: order.id, status: 'PENDIENTE' } });
  return { orderId: order.id, publicKey: config.publicKey, accessToken, amountCents: payment.amountCents, expiresAt: payment.expiresAt };
}

async function reconcile(payment) {
  if (!payment.providerId || payment.status === 'PAGADA_PRUEBA') return payment;
  const order = await culqiRequest(`/orders/${encodeURIComponent(payment.providerId)}`);
  const status = verifiedStatus(order, payment);
  if (status !== payment.status) {
    await prisma.testPayment.updateMany({ where: { id: payment.id, status: { not: 'PAGADA_PRUEBA' } }, data: { status } });
  }
  return prisma.testPayment.findUnique({ where: { id: payment.id } });
}

async function getStatus(req, res, next) {
  try {
    const token = req.headers['x-payment-token'];
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) return res.status(404).json({ error: 'Pago no encontrado.' });
    const payment = await prisma.testPayment.findUnique({ where: { accessHash: hashToken(token) } });
    if (!payment) return res.status(404).json({ error: 'Pago no encontrado.' });
    const current = await reconcile(payment);
    res.set('Cache-Control', 'no-store').json({ status: current.status, expiresAt: current.expiresAt });
  } catch (err) { next(err); }
}

async function webhook(req, res, next) {
  try {
    if (!getCulqiTestConfig()) return res.sendStatus(404);
    if (req.body?.type !== 'order.status.changed') return res.sendStatus(200);
    let data = req.body.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch { return res.sendStatus(400); } }
    if (!data || typeof data.id !== 'string' || !/^ord_test_[A-Za-z0-9]+$/.test(data.id)) return res.sendStatus(400);
    const payment = await prisma.testPayment.findUnique({ where: { providerId: data.id } });
    if (payment) await reconcile(payment);
    res.sendStatus(200);
  } catch (err) { next(err); }
}

module.exports = { hashToken, verifiedStatus, createOrder, reconcile, getStatus, webhook };
