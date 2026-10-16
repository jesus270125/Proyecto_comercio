// Mock data - Hospedajes en Apurímac
// Contenido demostrativo para la V1

export const accommodations = [
  {
    id: 1,
    slug: "casa-hacienda-abancay",
    name: "Casa Hacienda La Morada",
    type: "Casa Rural",
    location: "Abancay",
    district: "Abancay",
    address: "Km 2, Carretera Abancay-Curahuasi, Apurímac",
    description: "Una hacienda del siglo XIX restaurada con esmero, donde la historia y el confort moderno se fusionan. Rodeada de jardines con flores de la sierra, La Morada ofrece una experiencia de hospedaje única que combina la arquitectura colonial con las comodidades actuales. Desde sus corredores se contempla el Valle del Pachachaca.",
    price: 285,
    rating: 4.8,
    reviews: 94,
    capacity: 16,
    rooms: 8,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80",
      "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&q=80"
    ],
    amenities: [
      "WiFi", "Estacionamiento", "Desayuno incluido", "Jardines",
      "Sala de estar", "Chimenea", "Vista al valle", "Guía de experiencias"
    ],
    featured: true,
    nearExperiences: [1, 2, 7]
  },
  {
    id: 2,
    slug: "lodge-choquequirao",
    name: "Lodge del Caminante",
    type: "Lodge",
    location: "Cachora",
    district: "Cachora, Abancay",
    address: "Cachora, inicio del trek a Choquequirao, Apurímac",
    description: "El punto de partida perfecto para el trek a Choquequirao. El Lodge del Caminante es un alojamiento rústico y confortable, diseñado para aventureros. Las habitaciones tienen vistas directas a los nevados y el valle del Apurímac. El restaurante ofrece cocina de montaña con productos locales.",
    price: 145,
    rating: 4.6,
    reviews: 72,
    capacity: 20,
    rooms: 10,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1526136522736-fb9f8da7df6d?w=1200&q=80"
    ],
    amenities: [
      "WiFi", "Restaurante", "Desayuno incluido", "Estacionamiento",
      "Alquiler de equipo de trekking", "Guía de ruta", "Terraza con vistas"
    ],
    featured: true,
    nearExperiences: [1, 2, 9]
  },
  {
    id: 3,
    slug: "hotel-turistas-abancay",
    name: "Hotel del Valle Abancay",
    type: "Hotel",
    location: "Abancay",
    district: "Abancay",
    address: "Jr. Arenas 108, Abancay, Apurímac",
    description: "El hotel de referencia en el centro de Abancay, con 30 años de historia atendiendo viajeros. Ubicado a pocas cuadras de la Plaza Mayor, ofrece habitaciones amplias, restaurant con vista a los jardines y una atención personalizada que hace sentir al huésped como en casa.",
    price: 110,
    rating: 4.3,
    reviews: 187,
    capacity: 40,
    rooms: 20,
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80"
    ],
    amenities: [
      "WiFi", "Restaurante", "Bar", "Estacionamiento",
      "Servicio de habitaciones", "Televisión", "Agua caliente"
    ],
    featured: false,
    nearExperiences: [3, 6, 7]
  },
  {
    id: 4,
    slug: "hospedaje-vivencial-talavera",
    name: "Tambo Comunitario Talavera",
    type: "Casa Vivencial",
    location: "Talavera",
    district: "Talavera, Andahuaylas",
    address: "Comunidad de Llañucancha, Talavera, Apurímac",
    description: "Una experiencia de hospedaje auténtica con familias quechuas de Talavera. Cada visitante se aloja en una habitación cómoda dentro del predio familiar. Las comidas son preparadas con productos del huerto propio y los días incluyen actividades de la vida comunitaria. Es mucho más que un hospedaje: es una inmersión cultural completa.",
    price: 95,
    rating: 5.0,
    reviews: 28,
    capacity: 8,
    rooms: 4,
    image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80"
    ],
    amenities: [
      "Alimentación típica incluida",
      "Actividades culturales",
      "Taller de tejido",
      "Guía cultural",
      "Fuego de leña",
      "Jardín medicinal"
    ],
    featured: true,
    nearExperiences: [4, 8, 11]
  },
  {
    id: 5,
    slug: "cabana-riveras-apurimac",
    name: "Cabaña Las Orquídeas",
    type: "Cabaña",
    location: "Curahuasi",
    district: "Curahuasi, Abancay",
    address: "Sector Chochibamba, Curahuasi, Apurímac",
    description: "Tres cabañas independientes rodeadas de jardines de orquídeas silvestres y frutales en el cálido valle de Curahuasi, famoso por sus chirimoyas. Cada cabaña tiene vista al nevado Ampay y cuenta con terraza privada. Ideal para parejas que buscan tranquilidad y naturaleza.",
    price: 195,
    rating: 4.9,
    reviews: 41,
    capacity: 6,
    rooms: 3,
    image: "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=1200&q=80",
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80",
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80"
    ],
    amenities: [
      "WiFi", "Desayuno incluido", "Terraza privada",
      "Jacuzzi exterior", "Cocina equipada", "Vista al nevado",
      "Jardín de orquídeas", "Chirimoya fresca del huerto"
    ],
    featured: true,
    nearExperiences: [3, 7, 10]
  },
  {
    id: 6,
    slug: "posada-rio-apurimac",
    name: "Posada del Río Apurímac",
    type: "Hospedaje Rural",
    location: "Valle del Apurímac",
    district: "Huanipaca, Abancay",
    address: "Sector Poltoccsa, Huanipaca, Apurímac",
    description: "Un hospedaje rural ubicado en las riberas del río Apurímac, ideal para los amantes del rafting y el trekking. Las habitaciones tienen ventanas al río y se escucha el sonido del agua toda la noche. El restaurante sirve truchas del río preparadas al momento.",
    price: 125,
    rating: 4.5,
    reviews: 63,
    capacity: 12,
    rooms: 6,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80"
    ],
    amenities: [
      "WiFi", "Restaurante de truchas",
      "Acceso al río", "Kayak disponible",
      "Fogón nocturno", "Guía de río"
    ],
    featured: false,
    nearExperiences: [2, 9, 10]
  },
  {
    id: 7,
    slug: "eco-lodge-ampay",
    name: "Eco Lodge Santuario Ampay",
    type: "Eco Lodge",
    location: "Abancay",
    district: "Abancay",
    address: "Sector Rontoccocha, entrada al Santuario Ampay, Apurímac",
    description: "Un eco lodge construido con materiales locales y sostenibles en las faldas del Santuario Nacional de Ampay. La arquitectura respeta el entorno y cada habitación está diseñada para minimizar el impacto ambiental. Los paneles solares proveen energía limpia y el agua proviene de manantiales naturales del santuario.",
    price: 165,
    rating: 4.7,
    reviews: 55,
    capacity: 10,
    rooms: 5,
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=80",
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80",
      "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1200&q=80"
    ],
    amenities: [
      "Energía solar", "Agua de manantial",
      "Desayuno orgánico", "Senderos privados al santuario",
      "Observatorio de estrellas", "WiFi", "Guía naturalista"
    ],
    featured: false,
    nearExperiences: [7, 9, 10]
  },
  {
    id: 8,
    slug: "casa-vivencial-andahuaylas",
    name: "Casa Vivencial Qhapaq",
    type: "Casa Vivencial",
    location: "Andahuaylas",
    district: "Andahuaylas",
    address: "Barrio Los Chankas, Andahuaylas, Apurímac",
    description: "Una casa familiar en el centro de Andahuaylas que ofrece hospedaje con experiencia cultural incluida. La familia Quispe-Chuquimia lleva tres generaciones enseñando la cultura Chanka a los visitantes. Las habitaciones son cómodas y el desayuno incluye productos frescos del mercado local.",
    price: 85,
    rating: 4.6,
    reviews: 39,
    capacity: 10,
    rooms: 5,
    image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
    ],
    amenities: [
      "WiFi", "Desayuno incluido",
      "Actividades culturales", "Clases de quechua",
      "Cocina disponible", "Sala de estar"
    ],
    featured: false,
    nearExperiences: [4, 5, 8, 11]
  },
  {
    id: 9,
    slug: "hosteria-pacucha",
    name: "Hostería Orillas de Pacucha",
    type: "Hostería",
    location: "Andahuaylas",
    district: "Pacucha, Andahuaylas",
    address: "Orillas de la Laguna Pacucha, Andahuaylas, Apurímac",
    description: "Ubicada a orillas de la laguna de Pacucha, esta hostería ofrece vistas espectaculares sobre el espejo de agua. Las habitaciones tienen ventanas panorámicas y desde la terraza se puede ver el reflejo de los cerros en la laguna al amanecer. El restaurante especializado en truchas es uno de los más reconocidos de la provincia.",
    price: 135,
    rating: 4.7,
    reviews: 81,
    capacity: 16,
    rooms: 8,
    image: "https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=1200&q=80",
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80",
      "https://images.unsplash.com/photo-1439853949212-36089b8e6e2a?w=1200&q=80"
    ],
    amenities: [
      "Vista a la laguna", "Restaurante de truchas",
      "Canotaje incluido", "WiFi",
      "Pesca deportiva", "Desayuno incluido", "Botes privados"
    ],
    featured: true,
    nearExperiences: [5, 8, 11, 12]
  },
  {
    id: 10,
    slug: "albergue-comunal-grau",
    name: "Albergue Comunitario de Grau",
    type: "Albergue Comunitario",
    location: "Grau",
    district: "Grau, Apurímac",
    address: "Plaza principal de Grau, Apurímac",
    description: "Un albergue administrado por la comunidad de Grau, una de las provincias menos visitadas y más auténticas de Apurímac. Los ingresos van directamente a la comunidad y los guías son jóvenes locales que conocen cada sendero, cada historia y cada plato tradicional de la zona.",
    price: 65,
    rating: 4.8,
    reviews: 24,
    capacity: 14,
    rooms: 7,
    image: "https://images.unsplash.com/photo-1526136522736-fb9f8da7df6d?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1526136522736-fb9f8da7df6d?w=1200&q=80",
      "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
    ],
    amenities: [
      "Administración comunitaria", "Alimentación típica",
      "Guías locales jóvenes", "Taller artesanal",
      "Chimenea", "Agua caliente"
    ],
    featured: false,
    nearExperiences: [12, 4, 8]
  }
];

export const accommodationTypes = [
  { id: "all", label: "Todos" },
  { id: "Casa Vivencial", label: "Casa Vivencial" },
  { id: "Lodge", label: "Lodge" },
  { id: "Eco Lodge", label: "Eco Lodge" },
  { id: "Hotel", label: "Hotel" },
  { id: "Cabaña", label: "Cabaña" },
  { id: "Hospedaje Rural", label: "Hospedaje Rural" },
  { id: "Casa Rural", label: "Casa Rural" },
  { id: "Hostería", label: "Hostería" },
  { id: "Albergue Comunitario", label: "Albergue Comunitario" }
];
