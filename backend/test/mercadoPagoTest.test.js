const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { validSignature, verifyOrder } = require('../src/services/mercadoPagoTest');
const mercadoPago = require('../src/services/mercadoPagoTest');
const prisma = require('../src/config/database');

const id = 'ORDTST01ABCDEFG';
const payment = { providerId: id, amountCents: 500, reservation: { codigo: 'APU-123' } };
const order = { id, user_id: '123', external_reference: 'APU-123', currency: 'PEN', total_amount: '5.00', total_paid_amount: '5.00', status: 'processed', status_detail: 'accredited' };

test('solo confirma una orden de prueba acreditada con datos correctos', () => {
  assert.equal(verifyOrder(order, payment, '123'), 'PAGADA_PRUEBA');
  assert.equal(verifyOrder({ ...order, total_paid_amount: '0.00' }, payment, '123'), 'PENDIENTE');
  assert.equal(verifyOrder({ ...order, status_detail: 'partially_refunded' }, payment, '123'), 'REEMBOLSADA');
  for (const change of [{ currency: 'USD' }, { total_amount: '5.01' }, { user_id: '999' }, { external_reference: 'OTRA' }, { id: 'ORDREAL1' }]) {
    assert.throws(() => verifyOrder({ ...order, ...change }, payment, '123'));
  }
});

test('valida la firma del webhook y rechaza modificaciones', () => {
  const secret = 'clave-de-prueba', requestId = 'solicitud', ts = '123456';
  const digest = crypto.createHmac('sha256', secret).update(`id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`).digest('hex');
  const signature = `ts=${ts},v1=${digest}`;
  assert.equal(validSignature(signature, requestId, id, secret), true);
  assert.equal(validSignature(signature, 'otro', id, secret), false);
  assert.equal(validSignature(signature, requestId, id, 'otra'), false);
  assert.equal(validSignature(signature, requestId, 'ORDREAL1', secret), false);
});

test('el webhook firmado consulta la orden al proveedor antes de actualizarla', async () => {
  const previous = { ...process.env };
  const originalFetch = global.fetch;
  const originalFind = prisma.mercadoPagoTestPayment.findUnique;
  const originalUpdate = prisma.mercadoPagoTestPayment.updateMany;
  const current = { ...payment, id: 1, updatedAt: new Date(), status: 'PENDIENTE' };
  let requests = 0, updates = 0;
  Object.assign(process.env, { MERCADOPAGO_TEST_ENABLED: 'true', MERCADOPAGO_TEST_ACCESS_TOKEN: 'test-token', MERCADOPAGO_TEST_SELLER_ID: '123', MERCADOPAGO_TEST_WEBHOOK_SECRET: 'secret' });
  global.fetch = async () => { requests++; return { ok: true, json: async () => order }; };
  prisma.mercadoPagoTestPayment.findUnique = async () => current;
  prisma.mercadoPagoTestPayment.updateMany = async ({ data }) => { updates++; assert.equal(data.status, 'PAGADA_PRUEBA'); return { count: 1 }; };
  const ts = '123', requestId = 'request';
  const digest = crypto.createHmac('sha256', 'secret').update(`id:${id.toLowerCase()};request-id:${requestId};ts:${ts};`).digest('hex');
  const req = { query: { 'data.id': id }, body: { type: 'order', data: { id } }, get: key => ({ 'x-signature': `ts=${ts},v1=${digest}`, 'x-request-id': requestId })[key] };
  const res = { sendStatus(code) { this.code = code; return this; } };
  try {
    await mercadoPago.webhook(req, res, error => { throw error; });
    assert.equal(res.code, 200);
    assert.equal(requests, 1);
    assert.equal(updates, 1);
  } finally {
    global.fetch = originalFetch;
    prisma.mercadoPagoTestPayment.findUnique = originalFind;
    prisma.mercadoPagoTestPayment.updateMany = originalUpdate;
    for (const key of ['MERCADOPAGO_TEST_ENABLED', 'MERCADOPAGO_TEST_ACCESS_TOKEN', 'MERCADOPAGO_TEST_SELLER_ID', 'MERCADOPAGO_TEST_WEBHOOK_SECRET']) {
      if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    }
  }
});
