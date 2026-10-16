// src/server.js
// Punto de entrada del servidor
require('dotenv').config();
const app    = require('./app');
const prisma = require('./config/database');

const PORT = process.env.PORT || 4000;

async function main() {
  // Verificar conexión a MySQL antes de arrancar
  try {
    await prisma.$connect();
    console.log('✅ Conectado a MySQL correctamente');
  } catch (err) {
    console.error('❌ Error al conectar con MySQL:', err.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📡 API REST disponible en http://localhost:${PORT}/api/v1`);
    console.log(`🌱 Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
}

main();

// Cierre limpio
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
