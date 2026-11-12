const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const prisma = require('../src/config/database');

let server;
let base;
before(async () => {
  server = await new Promise(resolve => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  base = `http://127.0.0.1:${server.address().port}/api/v1`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  await prisma.$disconnect();
});

test('health y CORS permiten el frontend configurado', async () => {
  const response = await fetch(`${base}/health`, { headers: { Origin: 'http://localhost:5173' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('access-control-allow-origin'), 'http://localhost:5173');
  assert.equal((await response.json()).status, 'ok');
  const preflight = await fetch(`${base}/reservations`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5173', 'Access-Control-Request-Method': 'POST', 'Access-Control-Request-Headers': 'content-type' } });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get('access-control-allow-origin'), 'http://localhost:5173');
});

test('la API responde errores JSON para entradas inválidas y rutas desconocidas', async () => {
  for (const [route, options, status] of [
    ['/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 400],
    ['/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }, 400],
    ['/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' }, 400],
    ['/inexistente', {}, 404],
    ['/admin/experiences', {}, 401],
  ]) {
    const response = await fetch(base + route, options);
    assert.equal(response.status, status, route);
    assert.match(response.headers.get('content-type'), /json/);
    assert.ok(await response.json());
  }
});

test('el estado de reserva rechaza valores de tipos inesperados', async () => {
  const secret = process.env.JWT_SECRET || 'test-secret';
  process.env.JWT_SECRET = secret;
  const token = jwt.sign({ id: 1, role: 'ADMIN' }, secret);
  for (const estado of [null, 12, {}, []]) {
    const response = await fetch(`${base}/admin/reservations/1/estado`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ estado }),
    });
    assert.equal(response.status, 400);
  }
  const userToken = jwt.sign({ id: 2, role: 'USER' }, secret);
  const forbidden = await fetch(`${base}/admin/experiences`, { headers: { Authorization: `Bearer ${userToken}` } });
  assert.equal(forbidden.status, 403);
});
