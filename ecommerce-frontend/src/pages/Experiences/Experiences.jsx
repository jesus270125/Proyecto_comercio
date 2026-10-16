import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { experiences, experienceCategories } from '../../data/experiences';
import { experiencesService } from '../../services/api';
import ExperienceCard from '../../components/ExperienceCard/ExperienceCard';
import './Experiences.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=80';

const durations = [
  { id: 'all', label: 'Todas' },
  { id: '1', label: '1 día' },
  { id: '2-3', label: '2-3 días' },
  { id: '4+', label: '4+ días' },
];

function matchDuration(exp, filter) {
  if (filter === 'all') return true;
  const d = exp.duration || '';
  if (filter === '1') return d.startsWith('1');
  if (filter === '2-3') return d.startsWith('2') || d.startsWith('3');
  if (filter === '4+') return d.startsWith('4') || d.startsWith('5') || d.startsWith('6');
  return true;
}

export default function Experiences() {
  const [searchParams] = useSearchParams();
  const [expList, setExpList] = useState(experiences);
  const [activeCat, setActiveCat] = useState('all');
  const [activeDur, setActiveDur] = useState('all');
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState(1500);

  useEffect(() => {
    experiencesService.getAll().then(res => {
      if (res?.data && res.data.length > 0) {
        setExpList(res.data);
      }
    }).catch(() => { /* fallback */ });
  }, []);

  // Sync URL params with state
  useEffect(() => {
    const cat = searchParams.get('cat');
    const q = searchParams.get('q') || '';
    if (cat) {
      const match = experienceCategories.find(c => c.id === cat || c.label === cat);
      setActiveCat(match ? match.id : 'all');
    }
    setQuery(q);
  }, [searchParams]);

  const filtered = expList.filter(exp => {
    const catOk = activeCat === 'all' || exp.category === activeCat;
    const durOk = matchDuration(exp, activeDur);
    const priceOk = exp.price <= maxPrice;
    const nameStr = exp.name || exp.nombre || '';
    const locStr = exp.location || '';
    const catStr = exp.category || '';
    const qOk = !query || nameStr.toLowerCase().includes(query.toLowerCase()) ||
                          locStr.toLowerCase().includes(query.toLowerCase()) ||
                          catStr.toLowerCase().includes(query.toLowerCase());
    return catOk && durOk && priceOk && qOk;
  });

  return (
    <div className="experiences-page">
      {/* Hero */}
      <section className="page-hero experiences-hero" aria-label="Encabezado experiencias">
        <img src={HERO_IMG} alt="Montañas de Apurímac" className="page-hero-img" />
        <div className="overlay" />
        <div className="container page-hero-content">
          <span className="section-label" style={{ color: 'var(--green-300)' }}>Apurímac, Perú</span>
          <h1 className="experiences-hero__title">Experiencias que puedes vivir</h1>
          <p className="experiences-hero__sub">
            {experiences.length} experiencias · Aventura, cultura, naturaleza y turismo vivencial
          </p>
        </div>
      </section>

      <div className="container experiences-layout">
        {/* Filters sidebar */}
        <aside className="experiences-filters" aria-label="Filtros de experiencias">
          <h2 className="experiences-filters__title">Filtros</h2>

          {/* Search */}
          <div className="filter-section">
            <label className="filter-section__label" htmlFor="exp-search">Buscar</label>
            <div className="filter-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="exp-search"
                type="text"
                className="filter-search"
                placeholder="Buscar experiencia…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div className="filter-section">
            <p className="filter-section__label">Categoría</p>
            <div className="filter-options">
              {experienceCategories.map(cat => (
                <button
                  key={cat.id}
                  className={`filter-pill ${activeCat === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveCat(cat.id)}
                  id={`filter-cat-${cat.id}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Duration */}
          <div className="filter-section">
            <p className="filter-section__label">Duración</p>
            <div className="filter-options">
              {durations.map(d => (
                <button
                  key={d.id}
                  className={`filter-pill ${activeDur === d.id ? 'active' : ''}`}
                  onClick={() => setActiveDur(d.id)}
                  id={`filter-dur-${d.id}`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="filter-section">
            <p className="filter-section__label">
              Precio máximo: <strong>S/ {maxPrice}</strong>
            </p>
            <input
              type="range"
              min={50}
              max={1500}
              step={50}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="filter-range"
              id="filter-price"
              aria-label="Precio máximo"
            />
            <div className="filter-range-labels">
              <span>S/ 50</span>
              <span>S/ 1,500</span>
            </div>
          </div>

          {/* Reset */}
          <button
            className="btn btn-outline w-full mt-4"
            onClick={() => { setActiveCat('all'); setActiveDur('all'); setMaxPrice(1500); setQuery(''); }}
            id="filter-reset"
          >
            Limpiar filtros
          </button>
        </aside>

        {/* Grid */}
        <main className="experiences-grid-area" id="experiences-results">
          <div className="experiences-results-header">
            <p className="experiences-results-count">
              <strong>{filtered.length}</strong> experiencia{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="experiences-grid">
              {filtered.map((exp, i) => (
                <div key={exp.id} className="fade-in-up" style={{ animationDelay: `${Math.min(i * 0.06, 0.4)}s` }}>
                  <ExperienceCard experience={exp} />
                </div>
              ))}
            </div>
          ) : (
            <div className="experiences-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <h3>No encontramos experiencias</h3>
              <p>Intenta cambiar los filtros o buscar con otros términos.</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => { setActiveCat('all'); setActiveDur('all'); setMaxPrice(1500); setQuery(''); }}
              >
                Ver todas las experiencias
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
