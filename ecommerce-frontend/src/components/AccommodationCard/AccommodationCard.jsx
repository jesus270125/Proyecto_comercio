import { Link } from 'react-router-dom';
import { Home, Tent, Leaf, Hotel, Mountain, Sunset, Users } from 'lucide-react';
import './AccommodationCard.css';

const typeIcons = {
  'Casa Rural':           Home,
  'Lodge':                Tent,
  'Eco Lodge':            Leaf,
  'Hotel':                Hotel,
  'Cabaña':               Mountain,
  'Hospedaje Rural':      Home,
  'Hostería':             Sunset,
  'Casa Vivencial':       Users,
  'Albergue Comunitario': Users,
};

function StarRating({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} de 5 estrellas`}>
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </span>
  );
}

export default function AccommodationCard({ accommodation }) {
  const { id, name, image, location, type, description, price, rating, reviews, rooms, capacity } = accommodation;
  const IconComp = typeIcons[type] || Home;

  return (
    <article className="acc-card card">
      <div className="card-img-wrap">
        <img src={image} alt={name} className="card-img" loading="lazy" />
        <span className="acc-card__type badge badge-white">
          <IconComp size={13} strokeWidth={2} aria-hidden="true" /> {type}
        </span>
      </div>

      <div className="acc-card__body">
        <div className="acc-card__location">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          {location}
        </div>

        <h3 className="acc-card__name">{name}</h3>
        <p className="acc-card__desc">{description}</p>

        <div className="acc-card__info">
          <span className="acc-card__info-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {rooms} habitaciones
          </span>
          <span className="acc-card__info-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            {capacity} personas
          </span>
        </div>

        <div className="acc-card__footer">
          <div className="acc-card__rating">
            {Number(rating) > 0 && Number(reviews) > 0 ? <><StarRating rating={rating} /><span className="acc-card__rating-num">{rating}</span><span className="acc-card__reviews">({reviews}, ejemplo)</span></> : <span className="acc-card__reviews">Sin valoraciones</span>}
          </div>
          <div className="acc-card__price">
            <span className="acc-card__price-from">Por persona / noche</span>
            <span className="acc-card__price-val">S/ {price}</span>
          </div>
        </div>

        <Link
          to={`/hospedajes/${accommodation.slug}`}
          className="btn btn-primary w-full acc-card__cta"
          id={`acc-card-cta-${id}`}
        >
          Ver hospedaje
        </Link>
      </div>
    </article>
  );
}
