import { useNavigate } from 'react-router-dom';

const howItWorks = [
  { step: '01', title: 'Explora', desc: 'Navega por nuestras experiencias y hospedajes. Filtra por categoría, ubicación o precio.' },
  { step: '02', title: 'Elige', desc: 'Selecciona la experiencia o el hospedaje que te inspire. Lee los detalles y el itinerario.' },
  { step: '03', title: 'Reserva', desc: 'Completa el formulario con tus datos, fecha y número de personas. Sin pagos por ahora.' },
  { step: '04', title: 'Revisa', desc: 'Consulta el código y el estado pendiente de tu solicitud de prueba.' },
];

export default function HomeHowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="section home__how" aria-labelledby="home-how-title">
      <div className="container">
        <div className="section-header centered">
          <span className="section-label">Simple y directo</span>
          <h2 className="section-title" id="home-how-title">¿Cómo funciona?</h2>
          <div className="divider centered" />
        </div>

        <div className="how-grid">
          {howItWorks.map((item, i) => (
            <div key={item.step} className="how-card fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="how-card__step">{item.step}</div>
              <h3 className="how-card__title">{item.title}</h3>
              <p className="how-card__desc">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/experiencias')}
            id="home-how-cta"
          >
            Comenzar ahora
          </button>
        </div>
      </div>
    </section>
  );
}
