const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateReservationPricing } = require('../src/services/reservationPricing');

test('el adelanto corresponde a la tarifa de servicio y el saldo al subtotal', () => {
  assert.deepEqual(calculateReservationPricing(100, 1), {
    subtotal: 100, serviceFee: 5, total: 105, depositCents: 500,
  });
  assert.deepEqual(calculateReservationPricing(19.99, 2, 3), {
    subtotal: 119.94, serviceFee: 6, total: 125.94, depositCents: 600,
  });
});
