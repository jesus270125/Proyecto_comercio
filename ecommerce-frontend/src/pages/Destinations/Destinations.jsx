import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { destinations as staticDestinations } from '../../data/destinations';
import { destinationsService } from '../../services/api';
import './Destinations.css';

const HERO_BG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600&q=85';

export default function Destinations() {
  const navigate = useNavigate();
  const [destList, setDestList] = useState(staticDestinations);
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Todas');

  useEffect(() => {
    destinationsService.getAll()
      .then((res) => {
        if (res?.data && res.data.length > 0) {
          setDestList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const provinces = useMemo(() => {
    const set = new Set();
    destList.forEach((d) => {
      if (d.province) {
        d.province.split('/').forEach((p) => set.add(p.trim()));
      }
    });
    return ['Todas', ...Array.from(set)];
  }, [destList]);

  const filtered = useMemo(() => {
    return destList.filter((d) => {
      if (d.publicado === false) return false;
      const q = search.toLowerCase();
      const name = (d.name || d.nombre || '').toLowerCase();
      const desc = (d.description || '').toLowerCase();
      const prov = (d.province || '').toLowerCase();
      const matchQ = !q || name.includes(q) || desc.includes(q) || prov.includes(q);
      const matchProv =
        selectedProvince === 'Todas' ||
        (d.province && d.province.includes(selectedProvince));
      return matchQ && matchProv;
    });
  }, [destList, search, selectedProvince]);

  return (
    <div className="destinations-page fade-in">
      {/* ── Hero ── */}
      <section className="destinations-hero" aria-label="Portada de destinos">
        <img src={HERO_BG} alt="Paisaje andino de Apurímac" className="page-hero-img" />
        <div className="overlay" />
        <div className="container page-hero-content">
          <span className="section-label" style={{ color: 'var(--green-300)' }}>
            Región Apurímac, Perú
          </span>
          <h1 className="destinations-hero__title">Destinos y Provincias</h1>
          <p className="destinations-hero__sub">
            Descubre los valles, lagunas sagradas y ciudadelas incas que forman la geografía viva de Apurímac.
          </p>
        </div>
      </section>

      <div className="container">
        {/* ── Toolbar: Search & Filter ── */}
        <div className="destinations-toolbar">
          <div className="destinations-toolbar__card">
            <div className="destinations-search">
              <span className="destinations-search__icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </span>
              <input
                type="search"
                className="destinations-search__input"
                placeholder="Buscar por ciudad, valle o atractivo…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                id="destinations-search-input"
              />
            </div>

            <div className="destinations-pills">
              {provinces.map((prov) => (
                <button
                  key={prov}
                  type="button"
                  className={`dest-pill ${selectedProvince === prov ? 'active' : ''}`}
                  onClick={() => setSelectedProvince(prov)}
                >
                  {prov}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Destinations Cards Grid ── */}
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ fontSize: 'var(--text-lg)', color: 'var(--text-muted)' }}>
              No se encontraron destinos para "{search}".
            </p>
            <button
              className="btn btn-primary mt-4"
              onClick={() => { setSearch(''); setSelectedProvince('Todas'); }}
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="destinations-grid">
            {filtered.map((dest) => {
              const name = dest.name || dest.nombre;
              const highlights = Array.isArray(dest.highlights)
                ? dest.highlights
                : (typeof dest.highlights === 'string' ? JSON.parse(dest.highlights) : []);

              return (
                <article key={dest.id || dest.slug} className="dest-card">
                  <div className="dest-card__img-wrap">
                    <img
                      src={dest.image}
                      alt={name}
                      className="dest-card__img"
                      loading="lazy"
                    />
                    <div className="dest-card__badges">
                      <span className="dest-badge-prov">{dest.province || 'Apurímac'}</span>
                      {dest.altitude && (
                        <span className="dest-badge-alt">{dest.altitude}</span>
                      )}
                    </div>
                  </div>

                  <div className="dest-card__body">
                    <div className="dest-card__header">
                      <h2 className="dest-card__title">{name}</h2>
                      {dest.climate && (
                        <span className="dest-card__climate">{dest.climate}</span>
                      )}
                    </div>

                    <p className="dest-card__desc">{dest.description}</p>

                    {highlights && highlights.length > 0 && (
                      <div className="dest-card__highlights">
                        <div className="dest-card__highlights-title">Atractivos principales</div>
                        <div className="dest-card__tags">
                          {highlights.map((h, i) => (
                            <span key={i} className="dest-tag">{h}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="dest-card__actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => navigate(`/experiencias?q=${encodeURIComponent(name)}`)}
                        title={`Ver experiencias en ${name}`}
                      >
                        Experiencias
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={() => navigate(`/hospedajes?q=${encodeURIComponent(name)}`)}
                        title={`Ver hospedajes en ${name}`}
                      >
                        Hospedajes
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ── Informative Callout Banner ── */}
        {/* ── Informative Callout Banner (High-contrast & Polished) ── */}
        <section className="destinations-banner" aria-label="Información geográfica de Apurímac">
          <div className="destinations-banner__badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Geografía y Cultura Viva
          </div>
          <h2 className="destinations-banner__title">
            De la profundidad del cañón a las <em>nieves del Ampay</em>
          </h2>
          <p className="destinations-banner__text">
            Apurímac combina alturas que superan los 4,000 metros con cañones subtropicales a solo 1,200 m.s.n.m.
            Esta variedad climática permite recorrer ciudadelas incas, lagunas glaciares y valles de frutales en un mismo viaje.
          </p>
          <div className="destinations-banner__actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/experiencias')}>
              Explorar experiencias vivenciales
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/hospedajes')}>
              Buscar dónde quedarte
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
