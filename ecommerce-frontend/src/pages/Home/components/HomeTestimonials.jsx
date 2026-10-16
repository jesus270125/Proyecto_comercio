import { testimonials } from '../../../data/destinations';

export default function HomeTestimonials() {
  return (
    <section className="section home__testimonials" aria-labelledby="home-test-title">
      <div className="container">
        <div className="section-header centered">
          <span className="section-label">Lo que dicen los viajeros</span>
          <h2 className="section-title" id="home-test-title">
            Experiencias reales
          </h2>
          <p className="section-subtitle">
            Testimonios de viajeros que vivieron Apurímac. Datos de demostración.
          </p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((t, i) => (
            <blockquote key={t.id} className="testimonial fade-in-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="testimonial__stars">
                {[...Array(t.rating)].map((_, j) => (
                  <svg key={j} width="14" height="14" viewBox="0 0 24 24" fill="#f59e0b" stroke="none" aria-hidden="true">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className="testimonial__text">"{t.text}"</p>
              <footer className="testimonial__footer">
                <div className="testimonial__avatar" aria-hidden="true">{t.avatar}</div>
                <div>
                  <div className="testimonial__name">{t.name}</div>
                  <div className="testimonial__meta">{t.origin} · {t.date}</div>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
