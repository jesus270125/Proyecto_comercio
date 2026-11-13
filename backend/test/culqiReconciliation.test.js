const test = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../src/config/database');
let current;
let writes = 0;
require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: {
  testPayment: {
    async updateMany({ where, data }) {
      if (current.id === where.id && current.status !== 'PAGADA_PRUEBA') { current = { ...current, ...data }; writes++; }
    },
    async findUnique() { return current; },
  },
} };
const { reconcile } = require('../src/services/culqiTestPayments');

test('verifica la orden con Culqi y no acepta datos manipulados', async t => {
  const previous = { ...process.env };
  process.env.CULQI_TEST_ENABLED = 'true';
  process.env.CULQI_TEST_PUBLIC_KEY = 'pk_test_abc';
  process.env.CULQI_TEST_SECRET_KEY = 'sk_test_def';
  t.after(() => { process.env.CULQI_TEST_ENABLED = previous.CULQI_TEST_ENABLED; process.env.CULQI_TEST_PUBLIC_KEY = previous.CULQI_TEST_PUBLIC_KEY; process.env.CULQI_TEST_SECRET_KEY = previous.CULQI_TEST_SECRET_KEY; });
  current = { id: 1, providerId: 'ord_test_abc', amountCents: 600, status: 'PENDIENTE', expiresAt: new Date(Date.now() + 60000) };
  writes = 0;
  const fetchMock = t.mock.method(global, 'fetch', async () => ({ ok: true, json: async () => ({ id: 'ord_test_abc', amount: 601, currency_code: 'PEN', state: 'paid' }) }));
  await assert.rejects(reconcile(current), /verificar/);
  assert.equal(writes, 0);
  fetchMock.mock.mockImplementation(async () => ({ ok: true, json: async () => ({ id: 'ord_test_abc', amount: 600, currency_code: 'PEN', state: 'paid' }) }));
  assert.equal((await reconcile(current)).status, 'PAGADA_PRUEBA');
  assert.equal(writes, 1);
  await reconcile(current);
  assert.equal(fetchMock.mock.callCount(), 2);
});
