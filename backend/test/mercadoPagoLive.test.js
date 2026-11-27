const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const prisma = require('../src/config/database');
const live = require('../src/services/mercadoPagoLive');

const orderId = 'ORD01M8CMZ9K2ZDW8VN6M41Q2P9X5';
const settings = { sellerId: '123', applicationId: '456', origin: 'https://example.com' };
const reservation = { codigo: 'APU-ABC123', estado: 'PENDIENTE', guestEmail: 'buyer@example.com', guestNombre: 'Ana', guestApellido: 'Prueba' };
const payment = { id: 1, providerId: orderId, version: 0, amountCents: 425, serviceName: 'Laguna Pacucha', reservation, status: 'PENDIENTE' };
const created = {
  id: orderId, user_id: 123, integration_data: { application_id: '456' },
  currency: 'PEN', total_amount: '4.25', external_reference: reservation.codigo,
  status: 'created', checkout_url: `https://www.mercadopago.com.pe/checkout/v1/redirect?order_id=${orderId}`,
};
const approved = { ...created, status: 'processed', status_detail: 'accredited', total_paid_amount: '4.25' };

function mockEnv(t) {
  const values = {
    NODE_ENV: 'production', FRONTEND_URL: 'https://example.com',
    MERCADOPAGO_LIVE_ENABLED: 'true', MERCADOPAGO_LIVE_PILOT_ENABLED: 'false', MERCADOPAGO_LIVE_ACCESS_TOKEN: 'APP_USR-mock',
    MERCADOPAGO_LIVE_SELLER_ID: '123', MERCADOPAGO_LIVE_APPLICATION_ID: '456',
    MERCADOPAGO_LIVE_WEBHOOK_SECRET: 'mock-secret', MERCADOPAGO_TEST_ENABLED: 'false',
    CULQI_TEST_ENABLED: 'false', IZIPAY_SANDBOX_ENABLED: 'false',
    IZIPAY_MANUAL_ENABLED: 'false', PAYMENT_DEMO_ENABLED: 'false',
  };
  const previous = Object.fromEntries(Object.keys(values).map(key => [key, process.env[key]]));
  Object.assign(process.env, values);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

function mockModel(t, methods) {
  const model = prisma.mercadoPagoPayment;
  const previous = Object.fromEntries(Object.keys(methods).map(name => [name, model[name]]));
  Object.assign(model, methods);
  t.after(() => {
    for (const [name, method] of Object.entries(previous)) {
      if (method === undefined) delete model[name];
      else model[name] = method;
    }
  });
}

function response() {
  return {
    code: 200,
    sendStatus(code) { this.code = code; return this; },
    status(code) { this.code = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test('el cobro real queda deshabilitado y no admite proveedores de prueba simultáneos', t => {
  mockEnv(t);
  process.env.MERCADOPAGO_LIVE_ENABLED = 'false';
  assert.equal(live.config().enabled, false);
  process.env.MERCADOPAGO_LIVE_ENABLED = 'true';
  process.env.MERCADOPAGO_TEST_ENABLED = 'true';
  assert.throws(() => live.config(), /un solo modo/);
});

test('verifica la identidad y la cuantía de la orden antes de acreditar un pago real', () => {
  assert.equal(live.verifyOrder(approved, payment, settings), 'PAGADA');
  assert.equal(live.verifyOrder({ ...approved, status_detail: 'partially_refunded' }, payment, settings), 'REEMBOLSO_PARCIAL');
  for (const change of [
    { id: 'ORDTST01M8CMZ9K2ZDW8VN6M41Q2P9X5' }, { user_id: 999 }, { currency: 'USD' },
    { external_reference: 'APU-OTRA' }, { total_amount: '4.26' }, { total_paid_amount: '4.24' },
    { integration_data: { application_id: 'otra' } },
  ]) assert.throws(() => live.verifyOrder({ ...approved, ...change }, payment, settings));
});

test('el piloto mantiene el checkout cerrado para invitados y otros usuarios', async t => {
  mockEnv(t);
  process.env.MERCADOPAGO_LIVE_ENABLED = 'false';
  process.env.MERCADOPAGO_LIVE_PILOT_ENABLED = 'true';
  process.env.MERCADOPAGO_TEST_ENABLED = 'true';
  const admin = { id: 44, role: 'ADMIN' };
  const pilotPayment = { ...payment, reservation: { ...reservation, userId: admin.id }, paymentUrl: created.checkout_url };
  assert.equal(live.config().enabled, false);
  assert.equal(live.publicPayment(pilotPayment, admin).url, created.checkout_url);
  for (const other of [undefined, { id: admin.id, role: 'USER' }, { id: 45, role: 'ADMIN' }]) {
    assert.equal(live.publicPayment(pilotPayment, other).url, null);
    await assert.rejects(live.createOrder({ ...pilotPayment, providerId: null }, other), /desactivado/);
  }
  assert.equal(await live.createOrder(pilotPayment, admin), pilotPayment);
});

test('crea el checkout con la tarifa, retorno sin credenciales e idempotencia por reserva', async t => {
  mockEnv(t);
  let writes = 0;
  let isTest = true;
  t.mock.method(global, 'fetch', async (url, options) => {
    if (new URL(url).pathname === '/users/me') {
      return Response.json({ id: 123, site_id: 'MPE', tags: isTest ? ['test_user'] : ['normal'] });
    }
    assert.equal(++writes, 1);
    assert.equal(options.method, 'POST');
    assert.equal(new Headers(options.headers).get('x-idempotency-key'), 'apurimac-live-APU-ABC123');
    const body = JSON.parse(options.body);
    assert.equal(body.total_amount, '4.25');
    assert.equal(body.items[0].unit_price, '4.25');
    assert.equal(body.config.online.success_url, 'https://example.com/estado-pago?reserva=APU-ABC123&resultado=aprobado');
    assert.equal(Object.hasOwn(body.payer, 'identification'), false);
    return Response.json(created, { status: 201 });
  });
  mockModel(t, {
    updateMany: async ({ data }) => { assert.equal(data.providerId, orderId); return { count: 1 }; },
    findUnique: async () => payment,
  });
  await assert.rejects(live.createOrder({ ...payment, providerId: null }), /cuenta vendedora de producción/);
  isTest = false;
  assert.equal((await live.createOrder({ ...payment, providerId: null })).providerId, orderId);
  assert.equal(writes, 1);
});

test('el webhook contrasta el pago firmado con la API y rechaza notificaciones sin firma', async t => {
  mockEnv(t);
  let updated;
  t.mock.method(global, 'fetch', async () => Response.json(approved));
  mockModel(t, {
    findUnique: async () => payment,
    updateMany: async ({ where, data }) => { updated = { where, data }; return { count: 1 }; },
  });
  const xRequestId = 'request-test';
  const ts = '1780000000';
  const signature = createHmac('sha256', 'mock-secret').update(`id:${orderId.toLowerCase()};request-id:${xRequestId};ts:${ts};`).digest('hex');
  const req = { query: { 'data.id': orderId }, body: { type: 'order', data: { id: orderId } } };
  const next = err => { throw err; };
  const invalid = response();
  await live.webhook({ ...req, get: () => undefined }, invalid, next);
  assert.equal(invalid.code, 401);
  assert.equal(updated, undefined);
  const valid = response();
  await live.webhook({
    ...req, get: key => ({ 'x-signature': `ts=${ts},v1=${signature}`, 'x-request-id': xRequestId })[key],
  }, valid, next);
  assert.equal(valid.code, 200);
  assert.deepEqual(updated, { where: { id: 1, version: 0 }, data: { status: 'PAGADA', version: { increment: 1 } } });
});

test('administración solo cancela órdenes pendientes o reembolsa pagos acreditados con confirmación', async t => {
  mockEnv(t);
  let remoteOrder = { ...created };
  const writes = [];
  t.mock.method(global, 'fetch', async (url, options) => {
    if (options.method === 'POST') {
      const action = new URL(url).pathname.split('/').at(-1);
      writes.push(action);
      assert.equal(new Headers(options.headers).get('x-idempotency-key'), `apurimac-${action}-${orderId}`);
      if (action === 'refund') assert.equal(options.body, undefined);
      remoteOrder = { ...remoteOrder, status: action === 'refund' ? 'refunded' : 'canceled' };
    }
    return Response.json(remoteOrder);
  });
  let current = { ...payment };
  mockModel(t, {
    findUnique: async () => current,
    updateMany: async ({ data }) => { current = { ...current, status: data.status, version: current.version + 1 }; return { count: 1 }; },
  });
  const run = async (action, confirm) => {
    const res = response();
    await live.adminAction({ params: { id: '1', action }, body: { confirm } }, res, err => { throw err; });
    return res;
  };
  assert.equal((await run('refund', true)).code, 409);
  assert.equal((await run('cancel', false)).code, 400);
  assert.equal((await run('cancel', true)).body.data.status, 'CANCELADA');
  remoteOrder = { ...approved };
  current = { ...payment, status: 'PAGADA' };
  assert.equal((await run('cancel', true)).code, 409);
  assert.equal((await run('refund', true)).body.data.status, 'REEMBOLSADA');
  assert.deepEqual(writes, ['cancel', 'refund']);
});
