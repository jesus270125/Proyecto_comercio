// Mock data - Contenido demostrativo para la V1
// Los datos son ficticios y tienen fines académicos/demostrativos

export const experiences = [
  {
    id: 1,
    slug: "choquequirao-trek",
    name: "Choquequirao: La Ciudad Sagrada",
    shortDescription: "Trekking hacia la ciudadela inca perdida entre las montañas de Apurímac, una de las maravillas ocultas del Perú.",
    description: "Choquequirao es conocida como la 'hermana de Machu Picchu' y es una de las ciudadelas incas mejor conservadas del Perú. Este trek te lleva a través de paisajes espectaculares, cruzando quebradas profundas, bosques nublados y terrazas andinas. La experiencia combina historia, naturaleza y aventura en un entorno que pocas personas han pisado. Los guías locales de las comunidades cercanas comparten sus conocimientos sobre la historia inca y la cultura viva de Apurímac.",
    category: "Aventura",
    location: "Cusco - Apurímac",
    district: "Vilcabamba / Huanipaca",
    duration: "4 días / 3 noches",
    difficulty: "Alta",
    groupSize: "2 - 12 personas",
    price: 890,
    rating: 4.9,
    reviews: 87,
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=1200&q=80",
      "https://images.unsplash.com/photo-1580501170888-80668882d0df?w=1200&q=80",
      "https://images.unsplash.com/photo-1535185384036-28bbc8035f28?w=1200&q=80",
      "https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?w=1200&q=80"
    ],
    includes: [
      "Guía local certificado",
      "Hospedaje en campamento o lodge",
      "Alimentación completa (D/A/C)",
      "Equipo de acampada",
      "Acémilas de carga",
      "Botiquín de primeros auxilios"
    ],
    excludes: [
      "Vuelos o transporte hacia Abancay",
      "Bebidas alcohólicas",
      "Propinas",
      "Gastos personales",
      "Seguro de viaje"
    ],
    itinerary: [
      { day: 1, title: "Abancay → Cachora → Playa Rosalina", description: "Partida temprana desde Abancay hacia Cachora (2,900 m). Descenso de 4 horas hasta el río Apurímac. Campamento en Playa Rosalina." },
      { day: 2, title: "Playa Rosalina → Marampata", description: "Ascenso pronunciado de 5-6 horas. Cruce de quebradas con vistas espectaculares. Llegada al campamento de Marampata." },
      { day: 3, title: "Marampata → Choquequirao → Marampata", description: "Visita completa a la ciudadela. Exploración de terrazas, templos y edificaciones incas. Tarde libre." },
      { day: 4, title: "Marampata → Cachora → Abancay", description: "Retorno a Cachora. Transfer a Abancay. Fin del tour." }
    ],
    tags: ["trekking", "historia", "inca", "aventura", "naturaleza"],
    relatedAccommodations: [1, 2, 5],
    featured: true
  },
  {
    id: 2,
    slug: "canon-apurimac",
    name: "Cañón del Apurímac",
    shortDescription: "Rafting y trekking en uno de los cañones más profundos de América del Sur, donde el río Apurímac nace con fuerza.",
    description: "El río Apurímac nace en los nevados de Arequipa y crea uno de los cañones más profundos del continente antes de unirse al Ucayali. Esta experiencia combina rafting en aguas rápidas de clase III y IV con caminatas por senderos que revelan la biodiversidad única de la región. Las comunidades ribereñas ofrecen una ventana auténtica a la vida andina.",
    category: "Aventura",
    location: "Abancay",
    district: "Abancay - Curahuasi",
    duration: "2 días / 1 noche",
    difficulty: "Media-Alta",
    groupSize: "4 - 16 personas",
    price: 420,
    rating: 4.7,
    reviews: 64,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80"
    ],
    includes: [
      "Equipo de rafting certificado",
      "Guía de río experto",
      "Almuerzo en el río",
      "Hospedaje 1 noche",
      "Transporte desde Abancay"
    ],
    excludes: [
      "Desayuno día 1",
      "Bebidas",
      "Propinas",
      "Seguro de viaje"
    ],
    itinerary: [
      { day: 1, title: "Abancay → Río Apurímac", description: "Briefing de seguridad. Inicio del descenso en rafting. Campamento nocturno en la ribera." },
      { day: 2, title: "Rafting continúa → Retorno", description: "Segunda jornada de remo. Trekking en zonas accesibles. Retorno a Abancay." }
    ],
    tags: ["rafting", "aventura", "río", "cañón", "agua"],
    relatedAccommodations: [1, 3, 6],
    featured: true
  },
  {
    id: 3,
    slug: "saywite-arqueologia",
    name: "Saywite: Monumento Arqueológico",
    shortDescription: "Visita guiada al monolito de Saywite, una de las piezas de ingeniería inca más enigmáticas del Perú.",
    description: "El Monolito de Saywite es una piedra tallada con más de 200 figuras geométricas y animales que representa la cosmovisión andina. Ubicado cerca de Curahuasi, este sitio arqueológico ofrece una experiencia única de arqueología inca. La visita incluye recorrido por los andenes y fuentes de agua del complejo, con explicaciones detalladas de guías especializados.",
    category: "Cultura",
    location: "Curahuasi",
    district: "Curahuasi, Abancay",
    duration: "1 día",
    difficulty: "Baja",
    groupSize: "2 - 20 personas",
    price: 85,
    rating: 4.6,
    reviews: 112,
    image: "https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=1200&q=80",
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200&q=80",
      "https://images.unsplash.com/photo-1580501170888-80668882d0df?w=1200&q=80"
    ],
    includes: [
      "Guía arqueológico local",
      "Entrada al complejo",
      "Almuerzo típico",
      "Transporte desde Abancay"
    ],
    excludes: [
      "Bebidas",
      "Propinas",
      "Gastos personales"
    ],
    itinerary: [
      { day: 1, title: "Abancay → Saywite → Curahuasi → Abancay", description: "Visita completa al monolito. Recorrido por los andenes. Almuerzo en Curahuasi. Degustación de chirimoya fresca. Retorno." }
    ],
    tags: ["arqueología", "cultura", "inca", "historia", "monolito"],
    relatedAccommodations: [2, 4, 7],
    featured: true
  },
  {
    id: 4,
    slug: "turismo-vivencial-comunidad",
    name: "Turismo Vivencial: Vida Andina",
    shortDescription: "Comparte la vida cotidiana con familias quechuas, aprende técnicas ancestrales y vive la cultura viva de Apurímac.",
    description: "Esta experiencia te sumerge en la vida real de las comunidades andinas de Apurímac. Vivirás con una familia local, participarás en actividades agrícolas, aprenderás a preparar platos tradicionales como el chuño, el moraya y la chicha de jora. Conocerás las técnicas de tejido andino y participarás en rituales de conexión con la Pachamama. Es una experiencia transformadora que va más allá del turismo convencional.",
    category: "Vivencial",
    location: "Andahuaylas",
    district: "Talavera, Andahuaylas",
    duration: "3 días / 2 noches",
    difficulty: "Baja",
    groupSize: "1 - 6 personas",
    price: 350,
    rating: 5.0,
    reviews: 43,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80"
    ],
    includes: [
      "Hospedaje con familia local",
      "Alimentación completa (típica)",
      "Actividades culturales",
      "Clases de tejido andino",
      "Traslados internos",
      "Guía cultural bilingüe"
    ],
    excludes: [
      "Transporte desde Andahuaylas",
      "Compras en mercados locales",
      "Gastos personales"
    ],
    itinerary: [
      { day: 1, title: "Llegada y bienvenida", description: "Recepción con la familia. Recorrido por la comunidad. Cena típica compartida." },
      { day: 2, title: "Vida andina activa", description: "Actividades agrícolas. Preparación de platos típicos. Taller de tejido. Tarde libre." },
      { day: 3, title: "Ceremonia y despedida", description: "Pequeña ceremonia de agradecimiento. Preparación de chicha. Despedida." }
    ],
    tags: ["vivencial", "comunidad", "cultura", "quechua", "auténtico"],
    relatedAccommodations: [4, 8, 9],
    featured: true
  },
  {
    id: 5,
    slug: "laguna-pacucha",
    name: "Laguna de Pacucha",
    shortDescription: "La laguna más grande de Apurímac, rodeada de totoras y aves andinas. Ideal para senderismo, canotaje y fotografía.",
    description: "La Laguna de Pacucha se encuentra a 3,100 metros de altitud y es el espejo de agua más grande del departamento de Apurímac. Sus aguas tranquilas reflejan los cerros circundantes y albergan una rica fauna de aves acuáticas. La actividad de canotaje en la laguna es muy popular, así como el senderismo por sus orillas donde podrás observar totoras y aves como el zambullidor y la gaviota andina.",
    category: "Naturaleza",
    location: "Andahuaylas",
    district: "Pacucha, Andahuaylas",
    duration: "1 día",
    difficulty: "Baja",
    groupSize: "2 - 15 personas",
    price: 65,
    rating: 4.5,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80",
      "https://images.unsplash.com/photo-1439853949212-36089b8e6e2a?w=1200&q=80",
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=1200&q=80"
    ],
    includes: [
      "Guía local",
      "Canotaje 1 hora",
      "Almuerzo a orillas de la laguna",
      "Transporte desde Andahuaylas"
    ],
    excludes: [
      "Bebidas adicionales",
      "Alquiler de equipo fotográfico",
      "Propinas"
    ],
    itinerary: [
      { day: 1, title: "Andahuaylas → Pacucha → Andahuaylas", description: "Llegada temprana. Canotaje en la laguna. Senderismo por las orillas. Observación de aves. Almuerzo. Retorno." }
    ],
    tags: ["laguna", "naturaleza", "canotaje", "aves", "fotografía"],
    relatedAccommodations: [8, 9, 10],
    featured: false
  },
  {
    id: 6,
    slug: "gastronomia-apurimac",
    name: "Ruta Gastronómica de Apurímac",
    shortDescription: "Un recorrido por los sabores auténticos de Apurímac: chicha, chuño, picantes y postres andinos en mercados y casas locales.",
    description: "La gastronomía de Apurímac es una de las más ricas y menos conocidas del Perú. Esta ruta te lleva por mercados locales, restaurantes de cocina ancestral y hogares donde se preparan platos como el patasca, el timpu, el chupe de quinua y los tamales de Abancay. También visitarás productores de chicha artesanal y aprenderás sobre el proceso tradicional de preparación.",
    category: "Gastronomía",
    location: "Abancay",
    district: "Abancay",
    duration: "1 día",
    difficulty: "Baja",
    groupSize: "2 - 10 personas",
    price: 95,
    rating: 4.8,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
      "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200&q=80",
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80"
    ],
    includes: [
      "Guía gastronómico",
      "Degustaciones incluidas",
      "Almuerzo típico completo",
      "Visita a mercado Ayahuarcuna",
      "Taller de preparación de chicha"
    ],
    excludes: [
      "Compras en mercado",
      "Bebidas adicionales",
      "Transporte propio al inicio"
    ],
    itinerary: [
      { day: 1, title: "Mercado → Restaurantes → Taller", description: "Recorrido por el mercado central. Visita a restaurante de cocina andina. Taller de chicha artesanal. Almuerzo de cierre." }
    ],
    tags: ["gastronomía", "cocina", "chicha", "cultura", "mercado"],
    relatedAccommodations: [1, 3, 6],
    featured: false
  },
  {
    id: 7,
    slug: "bosque-ampay",
    name: "Santuario Nacional de Ampay",
    shortDescription: "Trekking por el único bosque de intiyoc del mundo, donde el árbol endémico de Apurímac crece junto a nevados eternos.",
    description: "El Santuario Nacional de Ampay protege el único bosque de intiyoc (Podocarpus glomeratus) del planeta, conocido localmente como 'ulcumano'. Este santuario rodea el nevado Ampay y alberga lagunas de altura, orquídeas, bromelias y una fauna rica en aves endémicas. El trekking por sus senderos es una experiencia única de biodiversidad andina.",
    category: "Naturaleza",
    location: "Abancay",
    district: "Abancay",
    duration: "1 día",
    difficulty: "Media",
    groupSize: "2 - 12 personas",
    price: 75,
    rating: 4.7,
    reviews: 93,
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80",
      "https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=1200&q=80",
      "https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1200&q=80"
    ],
    includes: [
      "Guía naturalista local",
      "Entrada al santuario",
      "Almuerzo tipo fiambre",
      "Bastones de trekking"
    ],
    excludes: [
      "Transporte propio al inicio",
      "Equipo fotográfico",
      "Propinas"
    ],
    itinerary: [
      { day: 1, title: "Abancay → Santuario Ampay → Abancay", description: "Inicio del trekking. Laguna Uspaccocha. Bosque de intiyoc. Observación de orquídeas. Retorno." }
    ],
    tags: ["santuario", "trekking", "bosque", "biodiversidad", "naturaleza"],
    relatedAccommodations: [1, 3, 5],
    featured: false
  },
  {
    id: 8,
    slug: "andahuaylillas-textiles",
    name: "Ruta del Tejido Andino",
    shortDescription: "Aprende de tejedoras de comunidades andinas las técnicas milenarias de tejido con lana de alpaca y uso de tintes naturales.",
    description: "Las comunidades de Apurímac son custodias de técnicas de tejido andino que tienen miles de años de antigüedad. En esta experiencia visitarás talleres comunitarios donde las tejedoras trabajan en telar de cintura usando lana de alpaca y oveja teñida con plantas naturales como la nogalina, la cochinilla y el índigo. Podrás aprender los patrones básicos y llevarte tu propia pieza elaborada.",
    category: "Cultura",
    location: "Andahuaylas",
    district: "Kaquiabamba, Andahuaylas",
    duration: "2 días / 1 noche",
    difficulty: "Baja",
    groupSize: "1 - 8 personas",
    price: 220,
    rating: 4.9,
    reviews: 31,
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
    ],
    includes: [
      "Hospedaje 1 noche en comunidad",
      "Alimentación típica",
      "Taller de tejido (pieza para llevar)",
      "Visita a productores de tintes naturales",
      "Guía cultural"
    ],
    excludes: [
      "Transporte al punto de inicio",
      "Compra de piezas adicionales",
      "Gastos personales"
    ],
    itinerary: [
      { day: 1, title: "Llegada y taller de tintes", description: "Recepción. Visita a recolectores de plantas tintóreas. Inicio del taller de tejido. Cena comunitaria." },
      { day: 2, title: "Tejido y feria local", description: "Continuación del taller. Visita a feria artesanal local. Fin de la pieza. Despedida." }
    ],
    tags: ["tejido", "artesanía", "alpaca", "cultura", "comunidad"],
    relatedAccommodations: [8, 9, 10],
    featured: false
  },
  {
    id: 9,
    slug: "nevado-ampay-ascenso",
    name: "Ascenso al Nevado Ampay",
    shortDescription: "Para montañistas experimentados: ascenso al nevado Ampay (5,235 m), el glaciar guardián de Abancay.",
    description: "El Nevado Ampay es el guardián espiritual de Abancay y representa uno de los desafíos montañísticos más significativos de Apurímac. El ascenso requiere experiencia en alta montaña y equipamiento técnico. La recompensa es una vista panorámica de 360° sobre los valles de Apurímac, el nevado Salkantay y en días despejados, la cordillera occidental. La experiencia incluye pernocte en campamento de altura.",
    category: "Aventura",
    location: "Abancay",
    district: "Abancay",
    duration: "3 días / 2 noches",
    difficulty: "Alta",
    groupSize: "2 - 6 personas",
    price: 680,
    rating: 4.8,
    reviews: 22,
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
      "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=1200&q=80"
    ],
    includes: [
      "Guía de alta montaña certificado",
      "Equipo técnico de montañismo",
      "Campamento de altura",
      "Alimentación completa",
      "Oxígeno de emergencia"
    ],
    excludes: [
      "Equipo personal (botas, ropa térmica)",
      "Seguro de montaña",
      "Gastos médicos de emergencia"
    ],
    itinerary: [
      { day: 1, title: "Abancay → Campamento Base (4,200 m)", description: "Aclimatación. Instalación de campamento. Cena." },
      { day: 2, title: "Intento de cima (5,235 m)", description: "Salida a las 3:00 am. Ascenso técnico. Cumbre. Descenso a campamento." },
      { day: 3, title: "Descenso y retorno", description: "Levantamiento de campamento. Descenso al santuario. Retorno a Abancay." }
    ],
    tags: ["montañismo", "nevado", "alta montaña", "aventura", "trekking"],
    relatedAccommodations: [1, 5, 6],
    featured: false
  },
  {
    id: 10,
    slug: "apurimac-birdwatching",
    name: "Avistamiento de Aves del Apurímac",
    shortDescription: "Observa más de 200 especies de aves en los valles de Apurímac, desde colibríes hasta el majestuoso cóndor andino.",
    description: "El Valle del Apurímac es uno de los hotspots de avistamiento de aves más importantes de Sudamérica, con más de 400 especies registradas. Esta experiencia está diseñada para birders de todos los niveles. Con guías ornitólogos locales explorarás hábitats que van desde el fondo de los cañones hasta los pajonales de puna, donde el cóndor andino reina en los cielos.",
    category: "Naturaleza",
    location: "Abancay - Curahuasi",
    district: "Valle del Apurímac",
    duration: "2 días / 1 noche",
    difficulty: "Baja",
    groupSize: "1 - 8 personas",
    price: 310,
    rating: 4.9,
    reviews: 47,
    image: "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?w=1200&q=80",
      "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=1200&q=80",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=1200&q=80"
    ],
    includes: [
      "Guía ornitólogo local",
      "Binoculares de alta gama",
      "Lista de aves de la zona",
      "Hospedaje 1 noche",
      "Alimentación completa",
      "Transporte"
    ],
    excludes: [
      "Equipo fotográfico propio",
      "Propinas",
      "Gastos personales"
    ],
    itinerary: [
      { day: 1, title: "Abancay → Valle del Apurímac", description: "Salida al amanecer (hora dorada). Recorrido por el cañón. Avistamiento de cóndores. Campamento." },
      { day: 2, title: "Amanecer en los pajonales → Retorno", description: "Avistamiento matutino en puna. Observación de colibríes. Retorno a Abancay." }
    ],
    tags: ["aves", "cóndor", "naturaleza", "birdwatching", "fotografía"],
    relatedAccommodations: [2, 6, 7],
    featured: false
  },
  {
    id: 11,
    slug: "comunidad-chicha",
    name: "El Arte de la Chicha de Jora",
    shortDescription: "Una experiencia cultural inmersiva para aprender el proceso ancestral de elaboración de la chicha de jora en Apurímac.",
    description: "La chicha de jora es la bebida sagrada de los Andes y en Apurímac se produce con técnicas que se remontan al Imperio Inca. En esta experiencia conocerás el proceso completo: desde la selección del maíz, la fermentación en tinajas de barro hasta el ritual de la primera proba. Las chicheras locales serán tus maestras en este viaje de sabores y tradición.",
    category: "Gastronomía",
    location: "Andahuaylas",
    district: "Andahuaylas",
    duration: "1 día",
    difficulty: "Baja",
    groupSize: "2 - 12 personas",
    price: 75,
    rating: 4.6,
    reviews: 55,
    image: "https://images.unsplash.com/photo-1559564484-fdf5e61c2b1c?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1559564484-fdf5e61c2b1c?w=1200&q=80",
      "https://images.unsplash.com/photo-1575218823251-f9d47ee52ddc?w=1200&q=80"
    ],
    includes: [
      "Guía cultural",
      "Degustación incluida",
      "Almuerzo típico",
      "Visita a chichería tradicional"
    ],
    excludes: [
      "Transporte",
      "Compras",
      "Gastos personales"
    ],
    itinerary: [
      { day: 1, title: "Visita → Taller → Degustación", description: "Visita al maizal. Proceso de elaboración. Degustación guiada. Almuerzo de cierre." }
    ],
    tags: ["chicha", "gastronomía", "ancestral", "cultura", "maíz"],
    relatedAccommodations: [8, 9, 10],
    featured: false
  },
  {
    id: 12,
    slug: "circuito-comunidades-rurales",
    name: "Circuito de Comunidades Rurales",
    shortDescription: "Un circuito de 5 días por las comunidades más auténticas de Apurímac: tejidos, agricultura, cocina y vida andina real.",
    description: "Este circuito extendido te lleva a conocer cuatro comunidades distintas en diferentes pisos ecológicos de Apurímac. Desde el valle cálido hasta la puna fría, cada comunidad tiene sus propias tradiciones, cultivos y formas de vida. Un viaje que transforma la perspectiva y genera conexiones humanas reales.",
    category: "Vivencial",
    location: "Apurímac",
    district: "Abancay, Andahuaylas, Grau",
    duration: "5 días / 4 noches",
    difficulty: "Media",
    groupSize: "2 - 8 personas",
    price: 1200,
    rating: 5.0,
    reviews: 18,
    image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80"
    ],
    includes: [
      "Hospedaje con familias locales (4 noches)",
      "Alimentación completa",
      "Guía cultural permanente",
      "Transporte entre comunidades",
      "Actividades culturales en cada comunidad",
      "Certificado de participación"
    ],
    excludes: [
      "Vuelos o buses a Abancay",
      "Gastos personales",
      "Propinas",
      "Seguro de viaje"
    ],
    itinerary: [
      { day: 1, title: "Abancay → Comunidad del valle bajo", description: "Recepción. Recorrido. Cena y primera noche." },
      { day: 2, title: "Comunidad agrícola de mediana altitud", description: "Actividades agrícolas. Cocina andina. Tejido." },
      { day: 3, title: "Comunidad de puna", description: "Pastoreo de alpacas. Preparación de chuño. Noche de estrellas." },
      { day: 4, title: "Comunidad artesanal", description: "Cerámica. Tejido. Feria local." },
      { day: 5, title: "Retorno a Abancay", description: "Ceremonia de despedida. Retorno." }
    ],
    tags: ["circuito", "comunidades", "vivencial", "cultura", "alpacas"],
    relatedAccommodations: [4, 8, 9, 10],
    featured: false
  }
];

export const experienceCategories = [
  { id: "all", label: "Todas" },
  { id: "Aventura", label: "Aventura" },
  { id: "Cultura", label: "Cultura" },
  { id: "Naturaleza", label: "Naturaleza" },
  { id: "Vivencial", label: "Vivencial" },
  { id: "Gastronomía", label: "Gastronomía" }
];
