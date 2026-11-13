// prisma/seed.js
// Seed idempotente — datos de demostración para Apurímac Turismo
// Ejecutar con: node prisma/seed.js  o  npm run seed

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de Apurímac Turismo...\n');

  // ── 1. Usuario Admin ─────────────────────────────────────
  const adminEmail = process.env.ADMIN_SEED_EMAIL || 'admin@apurimac.pe';
  const adminPass  = process.env.ADMIN_SEED_PASSWORD;

  const catalogOnly = process.env.SEED_CATALOG_ONLY === 'true';
  const existingAdmin = catalogOnly ? null : await prisma.user.findUnique({ where: { email: adminEmail } });
  if (catalogOnly) {
    console.log('⏭️  Solo se cargarán datos de catálogo de demostración.');
  } else if (!existingAdmin) {
    if (!adminPass || adminPass.length < 12) throw new Error('Configura ADMIN_SEED_PASSWORD con al menos 12 caracteres antes de crear el administrador.');
    const hash = await bcrypt.hash(adminPass, 12);
    await prisma.user.create({
      data: {
        nombre: 'Administrador',
        apellido: 'Apurímac Turismo',
        email: adminEmail,
        passwordHash: hash,
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin creado: ${adminEmail}`);
  } else {
    console.log(`⏭️  Admin ya existe: ${adminEmail}`);
  }

  if (process.env.SEED_ADMIN_ONLY === 'true') {
    console.log('✨ Administrador preparado.');
    return;
  }

  // ── 2. Destinos ───────────────────────────────────────────
  const destinos = [
    {
      nombre: 'Abancay',
      slug: 'abancay',
      province: 'Abancay',
      description: 'La capital de Apurímac, conocida como "La Ciudad de las Retamas", rodeada del Santuario Nacional de Ampay y el cañón del Pachachaca.',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      altitude: '2,377 m.s.n.m.',
      climate: 'Templado',
      highlights: ['Santuario Ampay', 'Centro histórico', 'Valle del Pachachaca', 'Gastronomía local'],
    },
    {
      nombre: 'Andahuaylas',
      slug: 'andahuaylas',
      province: 'Andahuaylas',
      description: 'Tierra de los valientes Chankas, con la hermosa laguna de Pacucha, comunidades vivas y una tradición cultural milenaria.',
      image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
      altitude: '2,926 m.s.n.m.',
      climate: 'Frío templado',
      highlights: ['Laguna Pacucha', 'Cultura Chanka', 'Artesanía textil', 'Gastronomía andina'],
    },
    {
      nombre: 'Curahuasi',
      slug: 'curahuasi',
      province: 'Abancay',
      description: 'El valle de la chirimoya, donde el clima cálido permite el cultivo de frutas tropicales y se conserva el monolito de Saywite.',
      image: 'https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=800&q=80',
      altitude: '2,650 m.s.n.m.',
      climate: 'Cálido templado',
      highlights: ['Monolito de Saywite', 'Chirimoyas', 'Valle del Apurímac', 'Artesanía local'],
    },
    {
      nombre: 'Choquequirao',
      slug: 'choquequirao',
      province: 'Abancay / Cusco',
      description: 'La "hermana de Machu Picchu", una ciudadela inca poco visitada que se alza sobre el cañón del Apurímac.',
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80',
      altitude: '3,033 m.s.n.m.',
      climate: 'Frío de montaña',
      highlights: ['Ciudadela inca', 'Trek de 4 días', 'Vistas al cañón', 'Historia viva'],
    },
    {
      nombre: 'Valle del Apurímac',
      slug: 'valle-del-apurimac',
      province: 'Abancay',
      description: 'El río Apurímac crea uno de los cañones más profundos de América. Rafting, avistamiento de aves y comunidades ribereñas únicas.',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      altitude: '1,200 - 3,500 m.s.n.m.',
      climate: 'Variable',
      highlights: ['Rafting', 'Cóndores', 'Cañón profundo', 'Comunidades ribereñas'],
    },
  ];

  for (const d of destinos) {
    await prisma.destination.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
  }
  console.log(`✅ ${destinos.length} destinos creados/verificados`);

  // Obtener IDs para relaciones
  const abancay   = await prisma.destination.findUnique({ where: { slug: 'abancay' } });
  const choqueq   = await prisma.destination.findUnique({ where: { slug: 'choquequirao' } });
  const valle     = await prisma.destination.findUnique({ where: { slug: 'valle-del-apurimac' } });
  const andahua   = await prisma.destination.findUnique({ where: { slug: 'andahuaylas' } });

  // ── 3. Experiencias ───────────────────────────────────────
  const experiencias = [
    {
      nombre: 'Choquequirao: La Ciudad Sagrada',
      slug: 'choquequirao-trek',
      shortDescription: 'Trekking hacia la ciudadela inca perdida entre las montañas de Apurímac.',
      description: 'Choquequirao es conocida como la "hermana de Machu Picchu" y es una de las ciudadelas incas mejor conservadas del Perú. Este trek te lleva a través de paisajes espectaculares.',
      category: 'Aventura',
      location: 'Cusco - Apurímac',
      district: 'Vilcabamba / Huanipaca',
      duration: '4 días / 3 noches',
      difficulty: 'Alta',
      groupSize: '2 - 12 personas',
      price: 890,
      rating: 4.9,
      reviewsCount: 87,
      image: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&q=80'],
      includes: ['Guía local certificado', 'Hospedaje en campamento', 'Alimentación completa'],
      excludes: ['Vuelos hacia Abancay', 'Bebidas alcohólicas', 'Propinas'],
      itinerary: [
        { day: 1, title: 'Abancay → Cachora → Playa Rosalina', description: 'Partida temprana.' },
        { day: 4, title: 'Retorno a Abancay', description: 'Fin del tour.' },
      ],
      tags: ['trekking', 'historia', 'inca', 'aventura'],
      featured: true,
      destinationId: choqueq?.id,
    },
    {
      nombre: 'Cañón del Apurímac: Rafting',
      slug: 'canon-apurimac',
      shortDescription: 'Rafting y trekking en uno de los cañones más profundos de América del Sur.',
      description: 'El río Apurímac crea uno de los cañones más profundos del continente. Combina rafting en aguas clase III-IV con caminatas por comunidades ribereñas.',
      category: 'Aventura',
      location: 'Abancay',
      district: 'Abancay - Curahuasi',
      duration: '2 días / 1 noche',
      difficulty: 'Media-Alta',
      groupSize: '4 - 16 personas',
      price: 420,
      rating: 4.7,
      reviewsCount: 64,
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80'],
      includes: ['Equipo de rafting certificado', 'Guía de río experto', 'Almuerzo en el río'],
      excludes: ['Transporte a Abancay', 'Seguro de viaje'],
      tags: ['rafting', 'aventura', 'naturaleza', 'cañon'],
      featured: true,
      destinationId: valle?.id,
    },
    {
      nombre: 'Turismo Vivencial en Comunidades Chankas',
      slug: 'turismo-vivencial-chankas',
      shortDescription: 'Vive un día junto a familias de la cultura Chanka en Andahuaylas.',
      description: 'Una experiencia inmersiva que te conecta con la ancestral cultura Chanka. Participa en la siembra, la gastronomía y los rituales de las comunidades de Andahuaylas.',
      category: 'Vivencial',
      location: 'Andahuaylas',
      district: 'San Jerónimo',
      duration: '1 día',
      difficulty: 'Baja',
      groupSize: '2 - 20 personas',
      price: 120,
      rating: 4.8,
      reviewsCount: 103,
      image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&q=80'],
      includes: ['Guía local', 'Almuerzo típico', 'Actividades comunitarias'],
      excludes: ['Transporte desde su ciudad', 'Propinas'],
      tags: ['vivencial', 'cultura', 'comunidad', 'gastronomía'],
      featured: true,
      destinationId: andahua?.id,
    },
    {
      nombre: 'Laguna de Pacucha al Amanecer',
      slug: 'laguna-pacucha',
      shortDescription: 'Visita la laguna sagrada de los Chankas al amanecer y conoce sus leyendas.',
      description: 'La laguna de Pacucha es el espejo de agua más importante de Apurímac. Esta excursión al amanecer permite observar aves locales y conocer las leyendas de los Chankas.',
      category: 'Naturaleza',
      location: 'Andahuaylas',
      district: 'Pacucha',
      duration: 'Medio día',
      difficulty: 'Baja',
      groupSize: '2 - 25 personas',
      price: 85,
      rating: 4.6,
      reviewsCount: 78,
      image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80'],
      includes: ['Guía especializado', 'Desayuno típico', 'Transporte local'],
      excludes: ['Transporte desde Andahuaylas'],
      tags: ['naturaleza', 'laguna', 'aves', 'amanecer'],
      featured: false,
      destinationId: andahua?.id,
    },
    {
      nombre: 'Monolito de Saywite y Valle de las Chirimoyas',
      slug: 'saywite-curahuasi',
      shortDescription: 'Explora el enigmático monolito inca y el valle tropical de Curahuasi.',
      description: 'El monolito de Saywite es una roca labrada con más de 200 figuras que representan el cosmos andino. Luego desciende al valle cálido de Curahuasi para degustar sus famosas chirimoyas.',
      category: 'Cultural',
      location: 'Curahuasi',
      district: 'Curahuasi',
      duration: '1 día',
      difficulty: 'Baja',
      groupSize: '2 - 20 personas',
      price: 95,
      rating: 4.5,
      reviewsCount: 45,
      image: 'https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=1200&q=80'],
      includes: ['Guía arqueológico', 'Degustación de frutas'],
      excludes: ['Transporte desde Abancay'],
      tags: ['cultura', 'arqueología', 'inca', 'gastronomía'],
      featured: false,
      destinationId: null,
    },
  ];

  for (const e of experiencias) {
    await prisma.experience.upsert({
      where: { slug: e.slug },
      update: {},
      create: e,
    });
  }
  console.log(`✅ ${experiencias.length} experiencias creadas/verificadas`);

  // ── 4. Hospedajes ─────────────────────────────────────────
  const hospedajes = [
    {
      nombre: 'Casa Hacienda La Morada',
      slug: 'casa-hacienda-abancay',
      type: 'Casa Rural',
      location: 'Abancay',
      district: 'Abancay',
      address: 'Km 2, Carretera Abancay-Curahuasi, Apurímac',
      description: 'Una hacienda del siglo XIX restaurada con esmero. Rodeada de jardines con flores de la sierra, combina arquitectura colonial con comodidades actuales. Vistas al Valle del Pachachaca.',
      price: 285,
      rating: 4.8,
      reviewsCount: 94,
      capacity: 16,
      rooms: 8,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80'],
      amenities: ['WiFi', 'Estacionamiento', 'Desayuno incluido', 'Jardines', 'Chimenea', 'Vista al valle'],
      featured: true,
      destinationId: abancay?.id,
    },
    {
      nombre: 'Lodge del Caminante',
      slug: 'lodge-choquequirao',
      type: 'Lodge',
      location: 'Cachora',
      district: 'Cachora, Abancay',
      address: 'Cachora, inicio del trek a Choquequirao, Apurímac',
      description: 'El punto de partida perfecto para el trek a Choquequirao. Lodge rústico y confortable con vistas directas a los nevados. Restaurante con cocina de montaña.',
      price: 145,
      rating: 4.6,
      reviewsCount: 72,
      capacity: 20,
      rooms: 10,
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80'],
      amenities: ['Restaurante', 'Estacionamiento', 'Vistas a nevados', 'Equipaje de montaña'],
      featured: true,
      destinationId: choqueq?.id,
    },
    {
      nombre: 'Posada El Retamo',
      slug: 'posada-el-retamo',
      type: 'Hostal',
      location: 'Abancay',
      district: 'Centro Histórico',
      address: 'Jr. Arenas 342, Abancay, Apurímac',
      description: 'Hostal céntrico en Abancay, ideal para explorar la ciudad. Habitaciones cómodas, ambiente acogedor y equipo atento. A pocos pasos de la Plaza de Armas.',
      price: 80,
      rating: 4.3,
      reviewsCount: 58,
      capacity: 24,
      rooms: 12,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80'],
      amenities: ['WiFi', 'TV cable', 'Agua caliente', 'Desayuno disponible'],
      featured: false,
      destinationId: abancay?.id,
    },
    {
      nombre: 'Ecolodge Pacucha',
      slug: 'ecolodge-pacucha',
      type: 'Lodge',
      location: 'Andahuaylas',
      district: 'Pacucha',
      address: 'Orillas de la Laguna de Pacucha, Andahuaylas',
      description: 'Lodge ecológico a orillas de la laguna de Pacucha. Construido con materiales locales, ofrece vistas panorámicas y acceso directo al lago. Ideal para kayak y observación de aves.',
      price: 195,
      rating: 4.7,
      reviewsCount: 41,
      capacity: 14,
      rooms: 7,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80'],
      amenities: ['Kayaks', 'Desayuno incluido', 'Vista al lago', 'Jardín ecológico', 'WiFi'],
      featured: true,
      destinationId: andahua?.id,
    },
    {
      nombre: 'Albergue Comunitario Grau',
      slug: 'albergue-grau',
      type: 'Albergue',
      location: 'Grau',
      district: 'Provincia de Grau',
      address: 'Plaza Central, Chuquibambilla, Grau, Apurímac',
      description: 'Un albergue administrado por la comunidad de Grau. Los ingresos van directamente a la comunidad y los guías son jóvenes locales que conocen cada sendero y tradición.',
      price: 55,
      rating: 4.4,
      reviewsCount: 32,
      capacity: 18,
      rooms: 6,
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80',
      gallery: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80'],
      amenities: ['Alimentación típica', 'Guías locales', 'Actividades comunitarias'],
      featured: false,
      destinationId: null,
    },
  ];

  for (const h of hospedajes) {
    await prisma.accommodation.upsert({
      where: { slug: h.slug },
      update: {},
      create: h,
    });
  }
  console.log(`✅ ${hospedajes.length} hospedajes creados/verificados`);

  if (catalogOnly) {
    console.log('✨ Catálogo de demostración preparado.');
    return;
  }

  // ── 5. Reservas de ejemplo ─────────────────────────────────
  const expChoq = await prisma.experience.findUnique({ where: { slug: 'choquequirao-trek' } });
  const accLodge = await prisma.accommodation.findUnique({ where: { slug: 'lodge-choquequirao' } });

  const reservasExistentes = await prisma.reservation.count();
  if (reservasExistentes === 0 && expChoq && accLodge) {
    await prisma.reservation.createMany({
      data: [
        {
          codigo: 'APU-DEMO0001',
          guestNombre: 'María', guestApellido: 'Torres', guestEmail: 'maria@example.com',
          guestTelefono: '987654321',
          tipo: 'EXPERIENCIA', experienceId: expChoq.id,
          fechaLlegada: new Date('2025-03-10'), fechaSalida: new Date('2025-03-14'),
          personas: 2, noches: null,
          precioUnitario: 890, subtotal: 1780, serviceFee: 89, total: 1869,
          estado: 'CONFIRMADA',
        },
        {
          codigo: 'APU-DEMO0002',
          guestNombre: 'Carlos', guestApellido: 'Quispe', guestEmail: 'carlos@example.com',
          guestTelefono: '912345678',
          tipo: 'HOSPEDAJE', accommodationId: accLodge.id,
          fechaLlegada: new Date('2025-04-05'), fechaSalida: new Date('2025-04-08'),
          personas: 2, noches: 3,
          precioUnitario: 145, subtotal: 870, serviceFee: 44, total: 914,
          estado: 'PENDIENTE',
        },
      ],
    });
    console.log('✅ 2 reservas de ejemplo creadas');
  } else {
    console.log('⏭️  Reservas de ejemplo ya existen o recursos no disponibles');
  }

  console.log('\n✨ Seed completado exitosamente.\n');
  console.log(`  Admin: ${adminEmail}`);
  console.log('  (Cambia esta contraseña en producción)\n');
}

main()
  .catch(e => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
