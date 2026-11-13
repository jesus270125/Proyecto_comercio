const test = require('node:test');
const assert = require('node:assert/strict');
const { getCulqiTestConfig } = require('../src/services/culqiConfig');

test('la configuración de Culqi está desactivada de forma predeterminada', () => {
  assert.equal(getCulqiTestConfig({}), null);
});

test('solo admite llaves de prueba cuando se habilita', () => {
  const enabled = { CULQI_TEST_ENABLED: 'true', CULQI_TEST_PUBLIC_KEY: 'pk_test_abc123', CULQI_TEST_SECRET_KEY: 'sk_test_def456' };
  assert.deepEqual(getCulqiTestConfig(enabled), { publicKey: 'pk_test_abc123', secretKey: 'sk_test_def456' });
  assert.throws(() => getCulqiTestConfig({ ...enabled, CULQI_TEST_SECRET_KEY: 'sk_live_def456' }));
  assert.throws(() => getCulqiTestConfig({ ...enabled, CULQI_TEST_PUBLIC_KEY: '' }));
});
