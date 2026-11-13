const test = require('node:test');
const assert = require('node:assert/strict');
const { validateLogin, validateReservation, validateResource } = require('../src/middleware/validate');

function run(middleware, body) {
  let status = 200;
  let nextCalled = false;
  const res = { status(code) { status = code; return this; }, json(data) { return data; } };
  middleware({ body }, res, () => { nextCalled = true; });
  return { status, nextCalled };
}

test('el login rechaza tipos inválidos', () => {
  assert.equal(run(validateLogin, { email: 'a@b.pe', password: {} }).status, 400);
  assert.equal(run(validateLogin, { email: 'a@b.pe', password: 'clave' }).nextCalled, true);
});

test('las reservas validan tipos, fechas y número de personas', () => {
  const valid = { guestNombre: 'Ana', guestApellido: 'Perez', guestEmail: 'ana@example.com', guestTelefono: '999123456', tipo: 'EXPERIENCIA', experienceId: 1, accommodationId: null, fechaLlegada: '2027-02-01', fechaSalida: '2027-02-02', personas: 2 };
  assert.equal(run(validateReservation, valid).nextCalled, true);
  for (const data of [{ guestNombre: 3 }, { personas: '1abc' }, { fechaLlegada: '2027-02-30' }, { fechaSalida: '2027-01-31' }, { accommodationId: 4 }]) {
    assert.equal(run(validateReservation, { ...valid, ...data }).status, 400);
  }
});

test('crear y editar validan precios y campos permitidos', () => {
  const experience = { nombre: 'Ruta', shortDescription: 'Resumen', description: 'Descripción', category: 'Aventura', location: 'Abancay', duration: '1 día', price: 15.5, image: '/uploads/foto.webp', gallery: [], itinerary: [] };
  assert.equal(run(validateResource('experience'), experience).nextCalled, true);
  assert.equal(run(validateResource('experience', true), { price: -50 }).status, 400);
  assert.equal(run(validateResource('accommodation', true), { price: -50 }).status, 400);
  assert.equal(run(validateResource('experience', true), { price: '1abc' }).status, 400);
  assert.equal(run(validateResource('experience', true), { reservations: { deleteMany: {} } }).status, 400);
  assert.equal(run(validateResource('destination', true), { nombre: 123 }).status, 400);
});

test('las experiencias rechazan etiquetas HTML al crear o editar, incluso en listas e itinerarios', () => {
  const experience = { nombre: 'Ruta', shortDescription: 'Resumen', description: 'Descripción', category: 'Aventura', location: 'Abancay', duration: '1 día', price: 15, image: '/uploads/foto.webp' };
  assert.equal(run(validateResource('experience'), { ...experience, nombre: 'Ruta </script>' }).status, 400);
  assert.equal(run(validateResource('experience', true), { includes: ['<script>alert(1)</script>'] }).status, 400);
  assert.equal(run(validateResource('experience', true), { itinerary: [{ day: 1, title: 'Ruta', description: '<img src=x>' }] }).status, 400);
  assert.equal(run(validateResource('experience', true), { description: 'Grupos de 2 < 5 personas' }).nextCalled, true);
});
