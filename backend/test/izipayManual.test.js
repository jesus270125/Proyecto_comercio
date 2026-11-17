const { test } = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../src/config/database');
const { adminUpdateIzipay } = require('../src/controllers/reservationsController');

test('el registro manual exige enlace seguro, referencia y un enlace guardado', async () => {
  const oldFind = prisma.reservation.findUnique;
  const oldUpdate = prisma.reservation.update;
  let updates = 0;
  prisma.reservation.findUnique = async () => ({ id: 1, estado: 'PENDIENTE', izipayLink: 'https://example.com/pay', izipayPaidAt: null });
  prisma.reservation.update = async ({ data }) => { updates++; return data; };
  const run = async body => {
    const res = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.body = data; return this; } };
    await adminUpdateIzipay({ params: { id: '1' }, body }, res, error => { throw error; });
    return res;
  };
  try {
    assert.equal((await run({ link: 'http://example.com/pay', reference: '', paid: false })).code, 400);
    assert.equal((await run({ link: 'https://example.com/pay', reference: '', paid: true })).code, 400);
    assert.equal((await run({ link: 'https://example.com/other', reference: '123', paid: true })).code, 400);
    assert.equal(updates, 0);
    const verified = await run({ link: 'https://example.com/pay', reference: '123', paid: true });
    assert.equal(verified.code, 200);
    assert.equal(verified.body.data.izipayReference, '123');
    assert.ok(verified.body.data.izipayPaidAt instanceof Date);
    assert.equal(updates, 1);
  } finally {
    prisma.reservation.findUnique = oldFind;
    prisma.reservation.update = oldUpdate;
    await prisma.$disconnect();
  }
});
