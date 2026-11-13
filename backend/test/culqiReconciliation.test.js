const test = require('node:test');
const assert = require('node:assert/strict');

const databasePath = require.resolve('../src/config/database');
let current;
let writes = 0;
require.cache[databasePath] = { id: databasePath, filename: databasePath, loaded: true, exports: {
  testPayment: {
    async update({ data }) { current = { ...current, ...data }; return current; },
    async updateMany({ where, data }) {
      if (current.id === where.id && current.status !== 'PAGADA_PRUEBA') { current = { ...current, ...data }; writes++; }
    },
    async findUnique() { return current; },
  },
} };
const { createOrder, reconcile } = require('../src/services/culqiTestPayments');

test('crea una orden de prueba sin confirmarla antes del checkout', async t => {
  const names = ['CULQI_TEST_ENABLED', 'CULQI_TEST_PUBLIC_KEY', 'CULQI_TEST_SECRET_KEY'];
  const old = Object.fromEntries(names.map(name => [name, process.env[name]]));
  t.after(() => names.forEach(name => old[name] === undefined ? delete process.env[name] : process.env[name] = old[name]));
  Object.assign(process.env, { CULQI_TEST_ENABLED: 'true', CULQI_TEST_PUBLIC_KEY: 'pk_test_abc', CULQI_TEST_SECRET_KEY: 'sk_test_def' });
  current = { id: 3, status: 'CREANDO', amountCents: 600, expiresAt: new Date(Date.now() + 1800000) };
  let sent;
  t.mock.method(global, 'fetch', async (_url, options) => {
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: 'ord_test_abc' }) };
  });
  const reservation = { id: 4, codigo: 'APU-TEST', guestNombre: 'Ana', guestApellido: 'Perez', guestEmail: 'ana@example.com', guestTelefono: '999999999' };
  const result = await createOrder(reservation, 'token-de-prueba');
  assert.equal(sent.confirm, false);
  assert.equal(sent.amount, 600);
  assert.equal(result.orderId, 'ord_test_abc');
  assert.equal(current.status, 'PENDIENTE');
});

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
