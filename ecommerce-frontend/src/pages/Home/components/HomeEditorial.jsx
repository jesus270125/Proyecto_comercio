import { useNavigate } from 'react-router-dom';

export default function HomeEditorial() {
  const navigate = useNavigate();

  return (
    <section className="home__editorial section-sm" aria-labelledby="home-editorial-title">
      <div className="container">
        <div className="editorial">
          <div className="editorial__img-wrap">
            <img
              src="https://images.unsplash.com/photo-1448375240586-882707db888b?w=900&q=80"
              alt="Bosque de intiyoc en el Santuario Nacional de Ampay"
              className="editorial__img"
            />
            <div className="editorial__img-badge">
              <span className="editorial__img-badge-num">2,377</span>
              <span className="editorial__img-badge-label">m.s.n.m.</span>
            </div>
          </div>
          <div className="editorial__content">
            <span className="section-label">Sobre Apurímac</span>
            <h2 className="section-title" id="home-editorial-title">
              El río que habla.
              <br />
              <em className="font-serif">El lugar que te queda.</em>
            </h2>
            <div className="divider" />
            <p>
              Apurímac, cuyo nombre en quechua significa "Gran Oráculo" o "El río que habla",
              es uno de los departamentos menos explorados y más fascinantes del Perú.
            </p>
            <p>
              Sus paisajes van desde el fondo de los cañones más profundos del continente
              hasta los pajonales de puna donde el cóndor reina. Sus comunidades conservan
              tradiciones que se remontan al Imperio Inca y su gastronomía es una de las
              más ricas y desconocidas del país.
            </p>
            <p>
              Esta plataforma nace con la misión de conectar viajeros con lo auténtico:
              guías locales reales, hospedajes que son hogares, experiencias que transforman.
            </p>
            <button
              className="btn btn-primary mt-6"
              onClick={() => navigate('/destinos')}
              id="home-editorial-cta"
            >
              Explorar destinos
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
