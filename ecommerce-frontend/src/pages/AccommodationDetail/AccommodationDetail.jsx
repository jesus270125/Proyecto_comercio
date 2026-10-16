import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { accommodations } from '../../data/accommodations';
import { experiences } from '../../data/experiences';
import { accommodationsService } from '../../services/api';
import ExperienceCard from '../../components/ExperienceCard/ExperienceCard';
import './AccommodationDetail.css';

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

const amenityIcons = {
  'WiFi': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>,
  'Restaurante': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>,
  'default': <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
};

export default function AccommodationDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [accommodation, setAccommodation] = useState(() => accommodations.find(a => a.slug === slug));
  const [activeImg, setActiveImg] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  useEffect(() => {
    accommodationsService.getBySlug(slug)
      .then(res => {
        if (res?.data) {
          setAccommodation(prev => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
  }, [slug]);

  if (!accommodation) {
    return (
      <div className="detail-not-found container">
        <h2>Hospedaje no encontrado</h2>
        <p>El hospedaje que buscas no existe.</p>
        <button className="btn btn-primary mt-6" onClick={() => navigate('/hospedajes')}>
          Ver hospedajes
        </button>
      </div>
    );
  }

  const nearExp = experiences.filter(e => accommodation.nearExperiences?.includes(e.id)).slice(0, 2);

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000*60*60*24)))
    : 0;
  const total = nights * accommodation.price;

  const handleReservar = () => {
    const params = new URLSearchParams({
      tipo: 'hospedaje',
      id: accommodation.id,
      nombre: accommodation.name,
      precio: accommodation.price,
      ...(checkIn && { checkin: checkIn }),
      ...(checkOut && { checkout: checkOut }),
      personas: guests
    });
    navigate(`/reservar?${params.toString()}`);
  };

  return (
    <div className="acc-detail">
      {/* Gallery */}
      <section className="acc-detail__gallery" aria-label="Galería de fotos">
        <div className="acc-detail__gallery-main">
          <img
            src={accommodation.gallery[activeImg]}
            alt={`${accommodation.name} - foto ${activeImg + 1}`}
            className="acc-detail__gallery-img"
          />
          <button
            className="exp-detail__gallery-back"
            onClick={() => navigate('/hospedajes')}
            aria-label="Volver a hospedajes"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Volver
          </button>
        </div>
        {accommodation.gallery.length > 1 && (
          <div className="exp-detail__gallery-thumbs">
            {accommodation.gallery.map((img, i) => (
              <button
                key={i}
                className={`exp-detail__gallery-thumb ${i === activeImg ? 'active' : ''}`}
                onClick={() => setActiveImg(i)}
                aria-label={`Ver foto ${i + 1}`}
              >
                <img src={img} alt="" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="container acc-detail__layout">
        {/* Main */}
        <article className="acc-detail__main">
          <header className="acc-detail__header">
            <div className="acc-detail__meta-top">
              <span className="badge badge-green">{accommodation.type}</span>
              <span className="exp-detail__location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {accommodation.district || accommodation.location}
              </span>
            </div>

            <h1 className="acc-detail__title">{accommodation.name}</h1>

            <div className="exp-detail__stats">
              <div className="exp-detail__stat">
                <StarRating rating={accommodation.rating} />
                <span><strong>{accommodation.rating}</strong> ({accommodation.reviews} reseñas)</span>
              </div>
              <span className="exp-detail__stat-div" />
              <div className="exp-detail__stat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                <span>{accommodation.rooms} habitaciones</span>
              </div>
              <span className="exp-detail__stat-div" />
              <div className="exp-detail__stat">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                </svg>
                <span>Hasta {accommodation.capacity} personas</span>
              </div>
            </div>
          </header>

          <section className="exp-detail__section" aria-labelledby="acc-desc">
            <h2 className="exp-detail__section-title" id="acc-desc">Sobre el hospedaje</h2>
            <p className="exp-detail__description">{accommodation.description}</p>
          </section>

          <section className="exp-detail__section" aria-labelledby="acc-amenities">
            <h2 className="exp-detail__section-title" id="acc-amenities">Servicios y comodidades</h2>
            <div className="acc-detail__amenities">
              {accommodation.amenities.map((a, i) => (
                <div key={i} className="acc-detail__amenity">
                  <span className="acc-detail__amenity-icon" aria-hidden="true">
                    {amenityIcons[a] || amenityIcons.default}
                  </span>
                  {a}
                </div>
              ))}
            </div>
          </section>

          {nearExp.length > 0 && (
            <section className="exp-detail__section" aria-labelledby="acc-near">
              <h2 className="exp-detail__section-title" id="acc-near">Experiencias cercanas</h2>
              <div className="exp-detail__related-grid">
                {nearExp.map(exp => (
                  <ExperienceCard key={exp.id} experience={exp} />
                ))}
              </div>
            </section>
          )}
        </article>

        {/* Booking sidebar */}
        <aside className="exp-detail__sidebar" aria-label="Panel de reserva">
          <div className="exp-detail__booking-card">
            <div className="exp-detail__price-display">
              <span className="exp-detail__price-from">Por noche</span>
              <span className="exp-detail__price-val">S/ {accommodation.price}</span>
            </div>

            <div className="acc-detail__booking-form">
              <div className="acc-detail__dates">
                <div className="form-group">
                  <label className="form-label" htmlFor="acc-checkin">Check-in</label>
                  <input
                    id="acc-checkin"
                    type="date"
                    className="form-input"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={e => setCheckIn(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="acc-checkout">Check-out</label>
                  <input
                    id="acc-checkout"
                    type="date"
                    className="form-input"
                    value={checkOut}
                    min={checkIn || new Date().toISOString().split('T')[0]}
                    onChange={e => setCheckOut(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="acc-guests">Personas</label>
                <select
                  id="acc-guests"
                  className="form-select"
                  value={guests}
                  onChange={e => setGuests(Number(e.target.value))}
                >
                  {Array.from({ length: accommodation.capacity }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                  ))}
                </select>
              </div>
            </div>

            {nights > 0 && (
              <div className="acc-detail__calc">
                <div className="exp-detail__booking-row">
                  <span>S/ {accommodation.price} × {nights} noche{nights > 1 ? 's' : ''}</span>
                  <strong>S/ {total}</strong>
                </div>
                <div className="exp-detail__booking-row acc-detail__total">
                  <span>Total estimado</span>
                  <strong className="text-primary">S/ {total}</strong>
                </div>
              </div>
            )}

            <button
              className="btn btn-primary btn-lg w-full"
              onClick={handleReservar}
              id="acc-detail-reservar"
            >
              Reservar hospedaje
            </button>
            <p className="exp-detail__booking-note">
              Sin pagos reales. La reserva es simulada — V1 académica.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
