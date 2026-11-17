// Integración exclusiva de pruebas. Nunca utiliza el endpoint de producción.
const crypto = require('node:crypto');
const prisma = require('../config/database');
const { hashToken } = require('./culqiTestPayments');
const BASE = 'https://sandbox-api-pw.izipay.pe';

function config() {
  if (process.env.IZIPAY_SANDBOX_ENABLED !== 'true') return null;
  const merchant = process.env.IZIPAY_SANDBOX_MERCHANT_CODE;
  const key = process.env.IZIPAY_SANDBOX_API_KEY;
  const hash = process.env.IZIPAY_SANDBOX_HASH_KEY;
  const callback = process.env.IZIPAY_SANDBOX_IPN_URL;
  if (!/^\d{5,15}$/.test(merchant || '') || !key || !hash || !callback || !/^https:\/\//.test(callback)) throw Object.assign(new Error('Configuración de Izipay de prueba incompleta.'), { status: 503 });
  return { merchant, key, hash, callback };
}
function validBilling(b) {
  if (!b || typeof b !== 'object' || Array.isArray(b)) return false;
  const valid = (x, min, max) => typeof x === 'string' && x.trim().length >= min && x.trim().length <= max;
  const document = typeof b.document === 'string' ? b.document.trim() : '';
  const lengths = { DNI: [8, 8], CE: [9, 12], PASAPORTE: [8, 12], RUC: [11, 11], OTROS: [8, 12] };
  const limits = Object.hasOwn(lengths, b.documentType) ? lengths[b.documentType] : null;
  return Boolean(valid(b.street, 5, 25) && valid(b.postalCode, 5, 10) && valid(b.city, 3, 40) && valid(b.state, 3, 40) && typeof b.country === 'string' && /^[A-Z]{2}$/.test(b.country) && limits && valid(document, ...limits));
}
async function request(path, body, transactionId, authorization) {
  const response = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json', transactionId, ...(authorization ? { Authorization: `Bearer ${authorization}` } : {}) }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || data.code !== '00' || !data.response) throw Object.assign(new Error('No se pudo completar la operación de prueba con Izipay.'), { status: 502 });
  return data.response;
}
async function operation(path, body) {
  const c = config();
  if (!c) throw Object.assign(new Error('Izipay de prueba no está habilitado.'), { status: 503 });
  const transactionId = crypto.randomBytes(16).toString('hex');
  const token = await request('/security/v1/Token/Generate', { requestSource: 'ECOMMERCE', merchantCode: c.merchant, orderNumber: c.merchant, publicKey: c.key, amount: '0.00' }, transactionId);
  if (typeof token.token !== 'string' || !token.token) throw new Error('Izipay no devolvió un token.');
  return request(path, body, transactionId, token.token);
}
function verifyDetails(result, payment, merchant) {
  const amount = typeof result.amount === 'string' && /^\d+\.\d{2}$/.test(result.amount) ? Math.round(Number(result.amount) * 100) : -1;
  if (result.paymentLinkId !== payment.providerId || result.merchantCode !== merchant || amount !== payment.amountCents || result.currency !== 'PEN' || result.referenceCode !== payment.reservation.codigo || result.amountType !== 'FIXED' || result.wayOfUse !== 'INDIVIDUAL') throw Object.assign(new Error('La información de Izipay no coincide con la reserva.'), { status: 502 });
  if (result.state === '3') return 'PAGADA_PRUEBA';
  if (result.state === '5' || result.state === '6') return 'VENCIDA';
  if (result.state === '1' || result.state === '4') return 'PENDIENTE';
  throw Object.assign(new Error('Estado de Izipay desconocido.'), { status: 502 });
}
async function createLink(reservation, payment, billing) {
  const c = config();
  const buyer = { firstName: reservation.guestNombre.trim(), lastName: reservation.guestApellido.trim(), email: reservation.guestEmail.trim(), phoneNumber: reservation.guestTelefono.trim(), street: billing.street.trim(), postalCode: billing.postalCode.trim(), city: billing.city.trim(), state: billing.state.trim(), country: billing.country, documentType: billing.documentType, document: billing.document.trim() };
  // Izipay exige vencimientos en intervalos de 30 minutos (hora de Perú).
  const end = new Date(Math.ceil((Date.now() + 60 * 60000) / 1800000) * 1800000 - 5 * 3600000).toISOString().slice(0, 19).replace('T', ' ') + '.000';
  const result = await operation('/paymentlink/api/v1/process/generate', { merchantCode: c.merchant, productDescription: `Tarifa reserva ${reservation.codigo}`, amount: (payment.amountCents / 100).toFixed(2), amountType: 'FIXED', currency: 'PEN', expirationDate: end, wayOfUse: 'INDIVIDUAL', email_Notification: null, payMethod: 'CARD', referenceCode: reservation.codigo, languageUsed: 'ESP', urL_Terms_and_Conditions: null, urlIpn: c.callback, billing: buyer, shipping: buyer, customFields: [{ name: 'field1', value: reservation.codigo }] });
  if (!/^[a-f0-9]{32}$/i.test(result.paymentLinkId || '')) throw new Error('Identificador de enlace inválido.');
  const url = new URL(result.urL_PaymentLink);
  if (url.protocol !== 'https:' || url.username || url.password || !(url.hostname === 'izipay.pe' || url.hostname.endsWith('.izipay.pe'))) throw new Error('Enlace de Izipay inválido.');
  const candidate = { ...payment, providerId: result.paymentLinkId, reservation };
  if (result.state !== '1' || verifyDetails(result, candidate, c.merchant) !== 'PENDIENTE') throw new Error('Estado inicial de Izipay inválido.');
  await prisma.izipayPayment.update({ where: { id: payment.id }, data: { providerId: result.paymentLinkId, paymentUrl: url.href, status: 'PENDIENTE' } });
  return url.href;
}
async function reconcile(payment) {
  if (!payment.providerId || payment.status === 'PAGADA_PRUEBA') return payment;
  const c = config();
  if (!c) throw Object.assign(new Error('Izipay de prueba no está habilitado.'), { status: 503 });
  const result = await operation('/paymentlink/api/v1/process/search', { paymentLinkId: payment.providerId, merchantCode: c.merchant, languageUsed: 'ESP' });
  const status = verifyDetails(result, payment, c.merchant);
  await prisma.izipayPayment.updateMany({ where: { id: payment.id, status: { not: 'PAGADA_PRUEBA' } }, data: { status } });
  return prisma.izipayPayment.findUnique({ where: { id: payment.id }, include: { reservation: true } });
}
function checkSignature(payload, signature, key) {
  if (typeof payload !== 'string' || typeof signature !== 'string' || !key || !/^[A-Za-z0-9+/]{43}=$/.test(signature)) return false;
  const expected = crypto.createHmac('sha256', key).update(payload, 'utf8').digest();
  const actual = Buffer.from(signature, 'base64');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
async function status(req, res, next) {
  try {
    const token = req.get('X-Payment-Token');
    if (!/^[a-f0-9]{64}$/.test(token || '')) return res.sendStatus(404);
    const payment = await prisma.izipayPayment.findUnique({ where: { accessHash: hashToken(token) }, include: { reservation: true } });
    if (!payment) return res.sendStatus(404);
    const current = await reconcile(payment);
    res.set('Cache-Control', 'no-store').json({ status: current.status });
  } catch (err) { next(err); }
}
async function webhook(req, res, next) {
  try {
    const c = config();
    if (!c) return res.sendStatus(404);
    const { payloadHttp, signature } = req.body || {};
    if (!checkSignature(payloadHttp, signature, c.hash)) return res.sendStatus(401);
    let payload; try { payload = JSON.parse(payloadHttp); } catch { return res.sendStatus(400); }
    const orders = payload.response?.order;
    if (!Array.isArray(orders) || orders.length !== 1 || !/^[a-f0-9]{32}$/i.test(orders[0].paymentLinkId || '')) return res.sendStatus(400);
    const payment = await prisma.izipayPayment.findUnique({ where: { providerId: orders[0].paymentLinkId }, include: { reservation: true } });
    if (!payment) return res.sendStatus(503);
    await reconcile(payment);
    res.sendStatus(200);
  } catch (err) { next(err); }
}
module.exports = { config, validBilling, verifyDetails, checkSignature, createLink, reconcile, status, webhook };
