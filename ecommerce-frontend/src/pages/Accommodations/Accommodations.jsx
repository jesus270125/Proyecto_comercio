import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accommodations, accommodationTypes } from '../../data/accommodations';
import { accommodationsService } from '../../services/api';
import AccommodationCard from '../../components/AccommodationCard/AccommodationCard';
import './Accommodations.css';

const HERO_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=80';

const locations = [
  { id: 'all', label: 'Todos' },
  { id: 'Abancay', label: 'Abancay' },
  { id: 'Andahuaylas', label: 'Andahuaylas' },
  { id: 'Curahuasi', label: 'Curahuasi' },
  { id: 'Grau', label: 'Grau' },
];

export default function Accommodations() {
  const [accList, setAccList] = useState(accommodations);
  const [activeType, setActiveType] = useState('all');
  const [activeLocation, setActiveLocation] = useState('all');
  const [maxPrice, setMaxPrice] = useState(400);
  const [minRating, setMinRating] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    accommodationsService.getAll().then(res => {
      if (res?.data && res.data.length > 0) {
        setAccList(res.data);
      }
    }).catch(() => { /* fallback */ });
  }, []);

  const filtered = accList.filter(acc => {
    const typeOk = activeType === 'all' || acc.type === activeType;
    const locOk = activeLocation === 'all' || acc.location === activeLocation || acc.district?.includes(activeLocation);
    const priceOk = acc.price <= maxPrice;
    const ratingOk = acc.rating >= minRating;
    const nameStr = acc.name || acc.nombre || '';
    const locStr = acc.location || '';
    const typeStr = acc.type || '';
    const qOk = !query || nameStr.toLowerCase().includes(query.toLowerCase()) ||
                          locStr.toLowerCase().includes(query.toLowerCase()) ||
                          typeStr.toLowerCase().includes(query.toLowerCase());
    return typeOk && locOk && priceOk && ratingOk && qOk;
  });

  return (
    <div className="accommodations-page">
      {/* Hero */}
      <section className="page-hero accommodations-hero" aria-label="Encabezado hospedajes">
        <img src={HERO_IMG} alt="Hospedaje en Apurímac" className="page-hero-img" />
        <div className="overlay" />
        <div className="container page-hero-content">
          <span className="section-label" style={{ color: 'var(--green-300)' }}>Dónde quedarte</span>
          <h1 className="accommodations-hero__title">Hospedajes en Apurímac</h1>
          <p className="accommodations-hero__sub">
            {accommodations.length} alojamientos · Desde casas vivenciales hasta lodges y cabañas
          </p>
        </div>
      </section>

      <div className="container accommodations-layout">
        {/* Filters */}
        <aside className="accommodations-filters" aria-label="Filtros de hospedajes">
          <h2 className="accommodations-filters__title">Filtros</h2>

          {/* Search */}
          <div className="filter-section">
            <label className="filter-section__label" htmlFor="acc-search">Buscar</label>
            <div className="filter-search-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                id="acc-search"
                type="text"
                className="filter-search"
                placeholder="Buscar hospedaje…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Type */}
          <div className="filter-section">
            <p className="filter-section__label">Tipo de hospedaje</p>
            <div className="filter-options">
              {accommodationTypes.slice(0, 5).map(t => (
                <button
                  key={t.id}
                  className={`filter-pill ${activeType === t.id ? 'active' : ''}`}
                  onClick={() => setActiveType(t.id)}
                  id={`filter-type-${t.id}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="filter-options">
              {accommodationTypes.slice(5).map(t => (
                <button
                  key={t.id}
                  className={`filter-pill ${activeType === t.id ? 'active' : ''}`}
                  onClick={() => setActiveType(t.id)}
                  id={`filter-type-${t.id}-2`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="filter-section">
            <p className="filter-section__label">Ubicación</p>
            <div className="filter-options">
              {locations.map(l => (
                <button
                  key={l.id}
                  className={`filter-pill ${activeLocation === l.id ? 'active' : ''}`}
                  onClick={() => setActiveLocation(l.id)}
                  id={`filter-loc-${l.id}`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="filter-section">
            <p className="filter-section__label">
              Precio máximo por noche: <strong>S/ {maxPrice}</strong>
            </p>
            <input
              type="range"
              min={60}
              max={400}
              step={20}
              value={maxPrice}
              onChange={e => setMaxPrice(Number(e.target.value))}
              className="filter-range"
              id="filter-acc-price"
              aria-label="Precio máximo por noche"
            />
            <div className="filter-range-labels">
              <span>S/ 60</span>
              <span>S/ 400</span>
            </div>
          </div>

          {/* Rating */}
          <div className="filter-section">
            <p className="filter-section__label">Calificación mínima</p>
            <div className="filter-options">
              {[0, 4, 4.5, 4.8].map(r => (
                <button
                  key={r}
                  className={`filter-pill ${minRating === r ? 'active' : ''}`}
                  onClick={() => setMinRating(r)}
                  id={`filter-rating-${r}`}
                >
                  {r === 0 ? 'Todas' : `★ ${r}+`}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn btn-outline w-full mt-4"
            onClick={() => { setActiveType('all'); setActiveLocation('all'); setMaxPrice(400); setMinRating(0); setQuery(''); }}
            id="filter-acc-reset"
          >
            Limpiar filtros
          </button>
        </aside>

        {/* Grid */}
        <main className="accommodations-grid-area" id="accommodations-results">
          <div className="accommodations-results-header">
            <p className="accommodations-results-count">
              <strong>{filtered.length}</strong> hospedaje{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className="accommodations-grid">
              {filtered.map((acc, i) => (
                <div key={acc.id} className="fade-in-up" style={{ animationDelay: `${Math.min(i * 0.06, 0.4)}s` }}>
                  <AccommodationCard accommodation={acc} />
                </div>
              ))}
            </div>
          ) : (
            <div className="accommodations-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <h3>No encontramos hospedajes</h3>
              <p>Prueba con otros filtros o amplía el rango de precio.</p>
              <button
                className="btn btn-primary mt-4"
                onClick={() => { setActiveType('all'); setActiveLocation('all'); setMaxPrice(400); setMinRating(0); setQuery(''); }}
              >
                Ver todos los hospedajes
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
