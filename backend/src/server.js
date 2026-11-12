// src/server.js
// Punto de entrada del servidor
require('dotenv').config();
const app    = require('./app');
const prisma = require('./config/database');

const PORT = process.env.PORT || 4000;

async function main() {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32 || /cambia_esto|secret|password/i.test(process.env.JWT_SECRET)) {
      console.error('❌ Configura un JWT_SECRET único y aleatorio de al menos 32 caracteres para producción.');
      process.exit(1);
    }
    try {
      if (new URL(process.env.FRONTEND_URL).protocol !== 'https:') throw new Error('HTTPS requerido');
    } catch {
      console.error('❌ Configura FRONTEND_URL con la dirección HTTPS del frontend en producción.');
      process.exit(1);
    }
  }
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
