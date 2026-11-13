const test = require('node:test');
const assert = require('node:assert/strict');
const { verifiedStatus, hashToken } = require('../src/services/culqiTestPayments');

test('solo una orden verificada con importe y moneda correctos se marca pagada', () => {
  const payment = { providerId: 'ord_test_abc', amountCents: 600, expiresAt: new Date('2027-01-01T00:30:00Z') };
  const order = { id: payment.providerId, amount: 600, currency_code: 'PEN', state: 'paid' };
  assert.equal(verifiedStatus(order, payment), 'PAGADA_PRUEBA');
  for (const changed of [{ id: 'ord_test_otro' }, { amount: 601 }, { currency_code: 'USD' }]) {
    assert.throws(() => verifiedStatus({ ...order, ...changed }, payment));
  }
  assert.equal(verifiedStatus({ ...order, state: 'pending' }, payment, Date.parse('2027-01-01T00:10:00Z')), 'PENDIENTE');
  assert.equal(verifiedStatus({ ...order, state: 'pending' }, payment, Date.parse('2027-01-01T00:31:00Z')), 'VENCIDA');
  assert.equal(verifiedStatus(order, payment, Date.parse('2027-01-01T00:31:00Z')), 'PAGADA_PRUEBA');
});

test('el token de consulta se guarda como hash', () => {
  assert.notEqual(hashToken('a'.repeat(64)), 'a'.repeat(64));
  assert.notEqual(hashToken('a'.repeat(64)), hashToken('b'.repeat(64)));
});
