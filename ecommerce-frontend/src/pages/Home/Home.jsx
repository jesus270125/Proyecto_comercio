import { useState, useEffect } from 'react';
import { Mountain, Landmark, Leaf, Users, UtensilsCrossed, Sunset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { experiences } from '../../data/experiences';
import { accommodations } from '../../data/accommodations';
import { destinations } from '../../data/destinations';
import { experiencesService, accommodationsService } from '../../services/api';
import ExperienceCard from '../../components/ExperienceCard/ExperienceCard';
import AccommodationCard from '../../components/AccommodationCard/AccommodationCard';
import SearchBar from './components/SearchBar';
import HomeHero from './components/HomeHero';
import HomeEditorial from './components/HomeEditorial';
import HomeHowItWorks from './components/HomeHowItWorks';
import HomeTestimonials from './components/HomeTestimonials';
import './Home.css';

const categories = [
  { id: 'aventura',   label: 'Aventura',    Icon: Mountain,          desc: 'Trekking, rafting y montañismo en paisajes extremos.' },
  { id: 'cultura',    label: 'Cultura',     Icon: Landmark,          desc: 'Arqueología, historia inca y tradiciones vivas.' },
  { id: 'naturaleza', label: 'Naturaleza',  Icon: Leaf,              desc: 'Santuarios, lagunas y biodiversidad andina única.' },
  { id: 'vivencial',  label: 'Vivencial',   Icon: Users,             desc: 'Vive con comunidades quechuas auténticas.' },
  { id: 'gastronomia',label: 'Gastronomía', Icon: UtensilsCrossed,   desc: 'Sabores ancestrales, chicha y cocina andina.' },
  { id: 'descanso',   label: 'Descanso',    Icon: Sunset,            desc: 'Cabañas, lodges y paz en paisajes andinos.' },
];

export default function Home() {
  const navigate = useNavigate();
  const [featuredExperiences, setFeaturedExperiences] = useState(() =>
    experiences.filter(e => e.featured).slice(0, 4)
  );
  const [featuredAccommodations, setFeaturedAccommodations] = useState(() =>
    accommodations.filter(a => a.featured).slice(0, 3)
  );

  useEffect(() => {
    experiencesService.getAll({ featured: 'true' })
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setFeaturedExperiences(res.data.slice(0, 4));
        }
      })
      .catch(() => {});

    accommodationsService.getAll({ featured: 'true' })
      .then(res => {
        if (res?.data && res.data.length > 0) {
          setFeaturedAccommodations(res.data.slice(0, 3));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home">
      {/* ── HERO ─────────────────────────────────────────── */}
      <HomeHero />

      {/* ── SEARCH BAR ──────────────────────────────────── */}
      <section className="home__searchbar-wrap" aria-label="Buscador">
        <div className="container">
          <SearchBar />
        </div>
      </section>

      {/* ── EXPERIENCIAS DESTACADAS ──────────────────────── */}
      <section className="section home__experiences" aria-labelledby="home-experiences-title">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Lo que puedes vivir</span>
            <h2 className="section-title" id="home-experiences-title">
              Experiencias que transforman
            </h2>
            <p className="section-subtitle">
              Desde el trekking a Choquequirao hasta el turismo vivencial en comunidades
              quechuas. Cada experiencia está pensada para que te lleves algo real.
            </p>
          </div>

          <div className="grid-4">
            {featuredExperiences.map((exp, i) => (
              <div key={exp.id} className="fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
                <ExperienceCard experience={exp} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/experiencias')}
              id="home-ver-todas-exp"
            >
              Ver todas las experiencias
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── EDITORIAL / DESTINO ─────────────────────────── */}
      <HomeEditorial />

      {/* ── CATEGORÍAS ──────────────────────────────────── */}
      <section className="section home__categories" aria-labelledby="home-cats-title">
        <div className="container">
          <div className="section-header centered">
            <span className="section-label">Encuentra tu estilo</span>
            <h2 className="section-title" id="home-cats-title">Explora por categoría</h2>
            <div className="divider centered" />
          </div>

          <div className="categories-grid">
            {categories.map(cat => (
              <button
                key={cat.id}
                className="category-card"
                onClick={() => navigate(`/experiencias?cat=${cat.label}`)}
                id={`cat-${cat.id}`}
              >
                <span className="category-card__icon" aria-hidden="true"><cat.Icon size={28} strokeWidth={1.5} /></span>
                <h3 className="category-card__title">{cat.label}</h3>
                <p className="category-card__desc">{cat.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOSPEDAJES DESTACADOS ───────────────────────── */}
      <section className="section home__accommodations" aria-labelledby="home-acc-title">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Dónde quedarte</span>
            <h2 className="section-title" id="home-acc-title">
              Hospedajes con historia
            </h2>
            <p className="section-subtitle">
              Desde haciendas coloniales hasta cabañas en el bosque o casas vivenciales
              con familias quechuas. Cada lugar tiene su propia personalidad.
            </p>
          </div>

          <div className="grid-3">
            {featuredAccommodations.map((acc, i) => (
              <div key={acc.id} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <AccommodationCard accommodation={acc} />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/hospedajes')}
              id="home-ver-todos-hospedajes"
            >
              Ver todos los hospedajes
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────── */}
      <HomeHowItWorks />

      {/* ── TESTIMONIOS ─────────────────────────────────── */}
      <HomeTestimonials />

      {/* ── DESTINOS ─────────────────────────────────────── */}
      <section className="section home__destinations" aria-labelledby="home-dest-title">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Lugares que explorar</span>
            <h2 className="section-title" id="home-dest-title">
              Destinos de Apurímac
            </h2>
          </div>

          <div className="destinations-grid">
            {destinations.slice(0, 4).map((dest, i) => (
              <button
                key={dest.id}
                className={`dest-card ${i === 0 ? 'dest-card--large' : ''}`}
                onClick={() => navigate('/destinos')}
                id={`dest-card-${dest.id}`}
              >
                <img src={dest.image} alt={dest.name} className="dest-card__img" loading="lazy" />
                <div className="dest-card__overlay" />
                <div className="dest-card__content">
                  <span className="dest-card__altitude">{dest.altitude}</span>
                  <h3 className="dest-card__name">{dest.name}</h3>
                  <p className="dest-card__prov">{dest.province}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/destinos')}
              id="home-ver-destinos"
            >
              Ver todos los destinos
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────── */}
      <section className="home__cta-final" aria-label="Llamada a la acción final">
        <div className="container home__cta-final-inner">
          <div className="home__cta-final-text">
            <span className="section-label" style={{ color: 'var(--green-300)' }}>Lista para partir</span>
            <h2 className="home__cta-final-title">
              Vive el lugar.<br />
              <span className="font-serif">Quédate en él.</span>
            </h2>
            <p>
              Apurímac te espera con sus montañas, sus comunidades y sus experiencias que no
              encontrarás en ningún otro lugar del mundo.
            </p>
          </div>
          <div className="home__cta-final-actions">
            <button
              className="btn btn-white btn-lg"
              onClick={() => navigate('/experiencias')}
              id="cta-final-exp"
            >
              Explorar experiencias
            </button>
            <button
              className="btn btn-ghost btn-lg"
              onClick={() => navigate('/hospedajes')}
              id="cta-final-hosp"
            >
              Ver hospedajes
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
