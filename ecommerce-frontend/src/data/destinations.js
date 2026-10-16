// Mock data - Destinos y testimonios
// Contenido demostrativo para la V1

export const destinations = [
  {
    id: 1,
    name: "Abancay",
    province: "Abancay",
    description: "La capital de Apurímac, conocida como 'La Ciudad de las Retamas', rodeada del Santuario Nacional de Ampay y el cañón del Pachachaca.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    highlights: ["Santuario Ampay", "Centro histórico", "Valle del Pachachaca", "Gastronomía local"],
    altitude: "2,377 m.s.n.m.",
    climate: "Templado",
    experiences: [1, 2, 6, 7, 9, 10],
    accommodations: [1, 2, 3, 5, 6, 7]
  },
  {
    id: 2,
    name: "Andahuaylas",
    province: "Andahuaylas",
    description: "Tierra de los valientes Chankas, con la hermosa laguna de Pacucha, comunidades vivas y una tradición cultural milenaria.",
    image: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    highlights: ["Laguna Pacucha", "Cultura Chanka", "Artesanía textil", "Gastronomía andina"],
    altitude: "2,926 m.s.n.m.",
    climate: "Frío templado",
    experiences: [4, 5, 8, 11, 12],
    accommodations: [8, 9, 10]
  },
  {
    id: 3,
    name: "Curahuasi",
    province: "Abancay",
    description: "El valle de la chirimoya, donde el clima cálido permite el cultivo de frutas tropicales y se conserva el monolito de Saywite.",
    image: "https://images.unsplash.com/photo-1467377791767-c929b5dc9a23?w=800&q=80",
    highlights: ["Monolito de Saywite", "Chirimoyas", "Valle del Apurímac", "Artesanía local"],
    altitude: "2,650 m.s.n.m.",
    climate: "Cálido templado",
    experiences: [3, 10],
    accommodations: [5]
  },
  {
    id: 4,
    name: "Choquequirao",
    province: "Abancay / Cusco",
    description: "La 'hermana de Machu Picchu', una ciudadela inca poco visitada que se alza sobre el cañón del Apurímac. Considerada el Machu Picchu oculto del Perú.",
    image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=80",
    highlights: ["Ciudadela inca", "Trek de 4 días", "Vistas al cañón", "Historia viva"],
    altitude: "3,033 m.s.n.m.",
    climate: "Frío de montaña",
    experiences: [1],
    accommodations: [2]
  },
  {
    id: 5,
    name: "Valle del Apurímac",
    province: "Abancay",
    description: "El río Apurímac crea uno de los cañones más profundos de América. Rafting, avistamiento de aves y comunidades ribereñas únicas.",
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=80",
    highlights: ["Rafting", "Cóndores", "Cañón profundo", "Comunidades ribereñas"],
    altitude: "1,200 - 3,500 m.s.n.m.",
    climate: "Variable por altitud",
    experiences: [2, 10],
    accommodations: [6]
  },
  {
    id: 6,
    name: "Grau",
    province: "Grau",
    description: "La provincia más occidental de Apurímac, casi desconocida para el turismo masivo. Autenticidad pura, naturaleza sin explorar y comunidades que viven como hace siglos.",
    image: "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80",
    highlights: ["Turismo vivencial auténtico", "Naturaleza intacta", "Cultura viva", "Sin masificación"],
    altitude: "2,500 - 4,500 m.s.n.m.",
    climate: "Frío",
    experiences: [12],
    accommodations: [10]
  }
];

export const testimonials = [
  {
    id: 1,
    name: "María Fernanda Reyes",
    origin: "Lima, Perú",
    avatar: "MF",
    rating: 5,
    experience: "Choquequirao: La Ciudad Sagrada",
    text: "Fue la experiencia más impresionante de mi vida. Cuatro días de trekking agotador pero cada paso valió la pena. Llegar a Choquequirao y no encontrarte con cientos de turistas es algo que no tiene precio. Los guías locales son increíbles y la comida del campamento, deliciosa. Apurímac me robó el corazón.",
    date: "Marzo 2026"
  },
  {
    id: 2,
    name: "Thomas Müller",
    origin: "Berlín, Alemania",
    avatar: "TM",
    rating: 5,
    experience: "Turismo Vivencial: Vida Andina",
    text: "I spent 3 days with a Quechua family in Talavera and it completely changed my view of travel. No hotels, no Instagram moments — just real life, real food, real people. Learning to weave with the grandmother while the children played around us was... indescribable. This is what travel should be.",
    date: "Enero 2026"
  },
  {
    id: 3,
    name: "Claudia Espinoza",
    origin: "Arequipa, Perú",
    avatar: "CE",
    rating: 5,
    experience: "Cabaña Las Orquídeas",
    text: "Fui con mi esposo a celebrar nuestro aniversario y fue exactamente lo que necesitábamos. Las cabañas son preciosas, el jardín de orquídeas al amanecer es mágico, y el desayuno con chirimoyas frescas del huerto es algo que recordaremos siempre. Ya estamos planeando volver.",
    date: "Febrero 2026"
  },
  {
    id: 4,
    name: "Jorge Alcántara",
    origin: "Cusco, Perú",
    avatar: "JA",
    rating: 4,
    experience: "Cañón del Apurímac",
    text: "El rafting fue una experiencia intensa y muy profesional. El equipo de guías conoce el río a la perfección y en todo momento nos sentimos seguros. El campamento en la orilla del río con el sonido del agua fue una noche que no olvidaré. Recomendado 100% para amantes de la aventura.",
    date: "Abril 2026"
  },
  {
    id: 5,
    name: "Valentina Torres",
    origin: "Buenos Aires, Argentina",
    avatar: "VT",
    rating: 5,
    experience: "Laguna de Pacucha",
    text: "Llegué a Andahuaylas de paso y terminé quedándome 5 días por la Laguna de Pacucha. El canotaje al amanecer con los cerros reflejados en el agua es una imagen que llevaré siempre. La Hostería Orillas de Pacucha fue perfecta: vistas increíbles y las mejores truchas que comí en el Perú.",
    date: "Mayo 2026"
  },
  {
    id: 6,
    name: "Rodrigo Vargas",
    origin: "Santiago, Chile",
    avatar: "RV",
    rating: 5,
    experience: "Santuario Nacional de Ampay",
    text: "El bosque de intiyoc es algo que no existe en ningún otro lugar del mundo. Caminar entre esos árboles milenarios con el nevado de fondo es una experiencia casi espiritual. El guía local conocía el nombre de cada planta, cada pájaro, cada historia. Apurímac es un tesoro oculto.",
    date: "Junio 2026"
  }
];
