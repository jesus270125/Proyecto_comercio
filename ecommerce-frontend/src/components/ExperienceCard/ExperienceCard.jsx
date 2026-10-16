import { Link } from 'react-router-dom';
import './ExperienceCard.css';

const categoryColors = {
  Aventura:    { bg: '#fff4e6', text: '#c05c00' },
  Cultura:     { bg: '#eef5e6', text: '#3d6b1f' },
  Naturaleza:  { bg: '#e6f4f0', text: '#1a6b55' },
  Vivencial:   { bg: '#f0e6ff', text: '#5a2d91' },
  Gastronomía: { bg: '#fff0e6', text: '#8a3800' },
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

export default function ExperienceCard({ experience }) {
  const { id, name, image, location, category, shortDescription, price, rating, reviews, duration, difficulty } = experience;
  const colors = categoryColors[category] || { bg: '#f0f0f0', text: '#555' };

  return (
    <article className="exp-card card">
      {/* Image */}
      <div className="card-img-wrap">
        <img
          src={image}
          alt={name}
          className="card-img"
          loading="lazy"
        />
        <span
          className="exp-card__category badge"
          style={{ background: colors.bg, color: colors.text }}
        >
          {category}
        </span>
        {difficulty && (
          <span className={`exp-card__difficulty badge-diff diff-${difficulty.toLowerCase().replace('-', '')}`}>
            {difficulty}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="exp-card__body">
        <div className="exp-card__meta">
          <span className="exp-card__location">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {location}
          </span>
          <span className="exp-card__duration">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {duration}
          </span>
        </div>

        <h3 className="exp-card__title">{name}</h3>
        <p className="exp-card__desc">{shortDescription}</p>

        <div className="exp-card__footer">
          <div className="exp-card__rating">
            <StarRating rating={rating} />
            <span className="exp-card__rating-num">{rating}</span>
            <span className="exp-card__reviews">({reviews})</span>
          </div>
          <div className="exp-card__price">
            <span className="exp-card__price-from">Desde</span>
            <span className="exp-card__price-val">S/ {price}</span>
          </div>
        </div>

        <Link
          to={`/experiencias/${experience.slug}`}
          className="btn btn-outline w-full exp-card__cta"
          id={`exp-card-cta-${id}`}
        >
          Ver experiencia
        </Link>
      </div>
    </article>
  );
}
