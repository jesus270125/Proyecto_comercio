// Esta configuración solo prepara pruebas. No permite usar llaves de producción.
function getCulqiTestConfig(env = process.env) {
  if (env.CULQI_TEST_ENABLED !== 'true') return null;

  const publicKey = env.CULQI_TEST_PUBLIC_KEY || '';
  const secretKey = env.CULQI_TEST_SECRET_KEY || '';
  if (!/^pk_test_[A-Za-z0-9]+$/.test(publicKey) || !/^sk_test_[A-Za-z0-9]+$/.test(secretKey)) {
    throw new Error('Configura llaves de prueba válidas de Culqi antes de activar el entorno de prueba.');
  }
  return { publicKey, secretKey };
}

module.exports = { getCulqiTestConfig };
