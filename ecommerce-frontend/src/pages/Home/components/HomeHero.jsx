import { useNavigate } from 'react-router-dom';

export default function HomeHero() {
  const navigate = useNavigate();

  return (
    <section className="hero" aria-label="Portada principal">
      <div className="hero__bg">
        <img
          src="/images/choquequirao_limpia_fullhd.jpg"
          alt="Ciudadela de Choquequirao entre las montañas de Apurímac"
          className="hero__img"
        />
        <div className="hero__overlay" />
      </div>

      <div className="container hero__content">
        <span className="section-label hero__eyebrow">Apurímac, Perú</span>
        <h1 className="hero__title">
          Descubre Apurímac<br />
          <span className="hero__title-accent font-serif">de una forma diferente</span>
        </h1>
        <p className="hero__subtitle">
          Vive experiencias auténticas, conoce nuestras comunidades y encuentra
          hospedajes donde el viaje se convierte en algo mucho más.
        </p>
        <div className="hero__actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/experiencias')}
            id="hero-cta-experiencias"
          >
            Explorar experiencias
          </button>
          <button
            className="btn btn-ghost btn-lg"
            onClick={() => navigate('/hospedajes')}
            id="hero-cta-hospedajes"
          >
            Ver hospedajes
          </button>
        </div>

        {/* Stats */}
        <div className="hero__stats">
          <div className="hero__stat">
            <strong>12+</strong><span>Experiencias únicas</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <strong>10+</strong><span>Hospedajes auténticos</span>
          </div>
          <div className="hero__stat-divider" />
          <div className="hero__stat">
            <strong>6</strong><span>Destinos en Apurímac</span>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="hero__scroll-hint" aria-hidden="true">
        <div className="hero__scroll-line" />
      </div>
    </section>
  );
}
