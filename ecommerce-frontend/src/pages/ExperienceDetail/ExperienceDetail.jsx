import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { experiences } from '../../data/experiences';
import { accommodations } from '../../data/accommodations';
import { experiencesService } from '../../services/api';
import AccommodationCard from '../../components/AccommodationCard/AccommodationCard';
import './ExperienceDetail.css';

function StarRating({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} estrellas`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export default function ExperienceDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [experience, setExperience] = useState(() => experiences.find(e => e.slug === slug));
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    experiencesService.getBySlug(slug)
      .then(res => {
        if (res?.data) {
          setExperience(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, [slug]);

  if (!experience) {
    return (
      <div className="detail-not-found container">
        <h2>Experiencia no encontrada</h2>
        <p>La experiencia que buscas no existe.</p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/experiencias')}>
          Ver experiencias
        </button>
      </div>
    );
  }

  const relatedAcc = accommodations.filter(a => experience.relatedAccommodations?.includes(a.id)).slice(0, 3);

  return (
    <div className="exp-detail">
      {/* Gallery Hero */}
      <section className="exp-detail__gallery" aria-label="Galería de imágenes">
        <div className="exp-detail__gallery-main">
          <img
            src={experience.gallery[activeImg]}
            alt={`${experience.name} - imagen ${activeImg + 1}`}
            className="exp-detail__gallery-img"
          />
          <button
            className="exp-detail__gallery-back"
            onClick={() => navigate('/experiencias')}
            aria-label="Volver a experiencias"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver
          </button>
        </div>
        {experience.gallery.length > 1 && (
          <div className="exp-detail__gallery-thumbs">
            {experience.gallery.map((img, i) => (
              <button
                key={i}
                className={`exp-detail__gallery-thumb ${i === activeImg ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <img src={img} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="container exp-detail__layout">
        {/* Main Content */}
        <article className="exp-detail__main">
          {/* Header */}
          <header className="exp-detail__header">
            <div className="exp-detail__meta-top">
              <span className="badge badge-green">{experience.category}</span>
              <span className="exp-detail__location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {experience.location}
              </span>
            </div>
            <h1 className="exp-detail__title">{experience.name}</h1>
            <p className="exp-detail__tagline font-serif">{experience.shortDescription}</p>

            <div className="exp-detail__stats">
              <div className="exp-detail__stat">
                <StarRating rating={experience.rating} />
                <span><strong>{experience.rating}</strong> ({experience.reviews} reseñas)</span>
              </div>
              <span className="exp-detail__stat-div" />
              <div className="exp-detail__stat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                <span>{experience.duration}</span>
              </div>
              <span className="exp-detail__stat-div" />
              <div className="exp-detail__stat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                <span>{experience.groupSize}</span>
              </div>
              {experience.difficulty && (
                <>
                  <span className="exp-detail__stat-div" />
                  <div className="exp-detail__stat">
                    <span>Dificultad:</span>
                    <strong className="exp-detail__difficulty">{experience.difficulty}</strong>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Description */}
          <section className="exp-detail__section" aria-labelledby="desc-heading">
            <h2 className="exp-detail__section-title" id="desc-heading">Sobre la experiencia</h2>
            <p className="exp-detail__description">{experience.description}</p>
          </section>

          {/* Includes / Excludes */}
          <section className="exp-detail__includes-section" aria-labelledby="inc-heading">
            <h2 className="exp-detail__section-title" id="inc-heading">¿Qué incluye?</h2>
            <div className="exp-detail__inc-grid">
              <div>
                <h3 className="exp-detail__inc-title exp-detail__inc-title--yes">Incluye</h3>
                <ul className="exp-detail__inc-list">
                  {experience.includes.map((item, i) => (
                    <li key={i} className="exp-detail__inc-item exp-detail__inc-item--yes">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="exp-detail__inc-title exp-detail__inc-title--no">No incluye</h3>
                <ul className="exp-detail__inc-list">
                  {experience.excludes.map((item, i) => (
                    <li key={i} className="exp-detail__inc-item exp-detail__inc-item--no">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Itinerary */}
          {experience.itinerary?.length > 0 && (
            <section className="exp-detail__section" aria-labelledby="itin-heading">
              <h2 className="exp-detail__section-title" id="itin-heading">Itinerario</h2>
              <div className="exp-detail__itinerary">
                {experience.itinerary.map(day => (
                  <div key={day.day} className="exp-detail__day">
                    <div className="exp-detail__day-num">Día {day.day}</div>
                    <div className="exp-detail__day-content">
                      <h3 className="exp-detail__day-title">{day.title}</h3>
                      <p className="exp-detail__day-desc">{day.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tags */}
          {experience.tags?.length > 0 && (
            <div className="exp-detail__tags">
              {experience.tags.map(tag => (
                <span key={tag} className="badge badge-cream">#{tag}</span>
              ))}
            </div>
          )}

          {/* Related accommodations */}
          {relatedAcc.length > 0 && (
            <section className="exp-detail__section" aria-labelledby="related-heading">
              <h2 className="exp-detail__section-title" id="related-heading">Hospedajes relacionados</h2>
              <div className="exp-detail__related-grid">
                {relatedAcc.map(acc => (
                  <AccommodationCard key={acc.id} accommodation={acc} />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Booking Sidebar */}
        <aside className="exp-detail__sidebar" aria-label="Panel de reserva">
          <div className="exp-detail__booking-card">
            <div className="exp-detail__price-display">
              <span className="exp-detail__price-from">Desde</span>
              <span className="exp-detail__price-val">S/ {experience.price}</span>
              <span className="exp-detail__price-unit">/ persona</span>
            </div>

            <div className="exp-detail__booking-info">
              <div className="exp-detail__booking-row">
                <span>Duración</span>
                <strong>{experience.duration}</strong>
              </div>
              <div className="exp-detail__booking-row">
                <span>Grupo</span>
                <strong>{experience.groupSize}</strong>
              </div>
              {experience.difficulty && (
                <div className="exp-detail__booking-row">
                  <span>Dificultad</span>
                  <strong>{experience.difficulty}</strong>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary btn-lg w-full"
              onClick={() => navigate(`/reservar?tipo=experiencia&id=${experience.id}&nombre=${encodeURIComponent(experience.name)}&precio=${experience.price}`)}
              id="exp-detail-reservar"
            >
              Reservar experiencia
            </button>

            <p className="exp-detail__booking-note">
              Sin pagos. La reserva es simulada — Versión 1 académica.
            </p>

            <div className="exp-detail__booking-guarantees">
              <div className="exp-detail__guarantee">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                Reserva segura y sin comisiones
              </div>
              <div className="exp-detail__guarantee">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                Guías locales certificados
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
