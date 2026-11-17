const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { checkSignature, verifyDetails, validBilling } = require('../src/services/izipaySandbox');
const { webhook } = require('../src/services/izipaySandbox');
const prisma = require('../src/config/database');

test('la notificación debe estar firmada con la clave correcta y sin modificar', () => {
  const payload = JSON.stringify({ code: '00' });
  const signature = crypto.createHmac('sha256', 'secreto').update(payload).digest('base64');
  assert.equal(checkSignature(payload, signature, 'secreto'), true);
  assert.equal(checkSignature(payload + ' ', signature, 'secreto'), false);
  assert.equal(checkSignature(payload, signature, 'otra'), false);
  assert.equal(checkSignature(payload, '', 'secreto'), false);
});
test('solo se acepta el estado consultado si coincide con la reserva y el importe', () => {
  const payment = { providerId: 'abc', amountCents: 850, reservation: { codigo: 'APU-TEST' } };
  const data = { paymentLinkId: 'abc', merchantCode: '12345', amount: '8.50', currency: 'PEN', referenceCode: 'APU-TEST', amountType: 'FIXED', wayOfUse: 'INDIVIDUAL', state: '3' };
  assert.equal(verifyDetails(data, payment, '12345'), 'PAGADA_PRUEBA');
  assert.equal(verifyDetails({ ...data, state: '1' }, payment, '12345'), 'PENDIENTE');
  for (const change of [{ amount: '54.00' }, { currency: 'USD' }, { merchantCode: '99999' }, { referenceCode: 'OTRA' }, { paymentLinkId: 'otro' }, { amountType: 'VARIABLE' }]) assert.throws(() => verifyDetails({ ...data, ...change }, payment, '12345'));
});
test('se valida la facturación sin inventar datos del cliente', () => {
  const data = { street: 'Av. Prueba 123', postalCode: '03001', city: 'Abancay', state: 'Apurimac', country: 'PE', documentType: 'DNI', document: '12345678' };
  assert.equal(validBilling(data), true);
  assert.equal(validBilling({ ...data, document: '123' }), false);
  assert.equal(validBilling({ ...data, country: 'PER' }), false);
});
test('el webhook rechaza firmas falsas y consulta Izipay antes de registrar el pago', async () => {
  const previous = { ...process.env };
  const oldFind = prisma.izipayPayment.findUnique, oldUpdate = prisma.izipayPayment.updateMany, oldFetch = global.fetch;
  const id = 'a'.repeat(32), key = 'clave-de-prueba';
  Object.assign(process.env, { IZIPAY_SANDBOX_ENABLED: 'true', IZIPAY_SANDBOX_MERCHANT_CODE: '12345', IZIPAY_SANDBOX_API_KEY: 'api-test', IZIPAY_SANDBOX_HASH_KEY: key, IZIPAY_SANDBOX_IPN_URL: 'https://example.com/ipn' });
  let updates = 0, calls = 0;
  const payment = { id: 1, providerId: id, amountCents: 850, status: 'PENDIENTE', reservation: { codigo: 'APU-TEST' } };
  prisma.izipayPayment.findUnique = async () => payment;
  prisma.izipayPayment.updateMany = async ({ data }) => { updates++; assert.equal(data.status, 'PAGADA_PRUEBA'); return { count: 1 }; };
  global.fetch = async url => {
    calls++;
    return { ok: true, json: async () => url.endsWith('/Token/Generate') ? { code: '00', response: { token: 'sandbox' } } : { code: '00', response: { paymentLinkId: id, merchantCode: '12345', amount: '8.50', currency: 'PEN', referenceCode: 'APU-TEST', amountType: 'FIXED', wayOfUse: 'INDIVIDUAL', state: '3' } } };
  };
  const payloadHttp = JSON.stringify({ code: '00', response: { order: [{ paymentLinkId: id }] } });
  const res = () => ({ code: 200, sendStatus(n) { this.code = n; return this; } });
  try {
    const invalid = res(); await webhook({ body: { payloadHttp, signature: 'invalid' } }, invalid, error => { throw error; });
    assert.equal(invalid.code, 401); assert.equal(calls, 0); assert.equal(updates, 0);
    const signature = crypto.createHmac('sha256', key).update(payloadHttp).digest('base64');
    const valid = res(); await webhook({ body: { payloadHttp, signature } }, valid, error => { throw error; });
    assert.equal(valid.code, 200); assert.equal(calls, 2); assert.equal(updates, 1);
  } finally {
    prisma.izipayPayment.findUnique = oldFind; prisma.izipayPayment.updateMany = oldUpdate; global.fetch = oldFetch;
    for (const keyName of ['IZIPAY_SANDBOX_ENABLED','IZIPAY_SANDBOX_MERCHANT_CODE','IZIPAY_SANDBOX_API_KEY','IZIPAY_SANDBOX_HASH_KEY','IZIPAY_SANDBOX_IPN_URL']) {
      if (previous[keyName] === undefined) delete process.env[keyName]; else process.env[keyName] = previous[keyName];
    }
  }
});
