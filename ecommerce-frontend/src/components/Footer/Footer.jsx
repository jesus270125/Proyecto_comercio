import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L26 22H2L14 2Z" fill="currentColor" opacity="0.9"/>
              <circle cx="14" cy="19" r="4" fill="currentColor" opacity="0.5"/>
            </svg>
            <div>
              <div className="footer__logo-main">APURÍMAC</div>
              <div className="footer__logo-sub">turismo</div>
            </div>
          </div>
          <p className="footer__tagline">
            Vive el lugar. Quédate en él.
          </p>
          <p className="footer__desc">
            Plataforma de turismo vivencial y hospedajes auténticos en Apurímac, Perú.
            Conectamos viajeros con experiencias y comunidades reales.
          </p>
          {/* Social icons (decorativos en V1) */}
          <div className="footer__social">
            <a href="#" className="footer__social-link" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="3"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
            </a>
            <a href="#" className="footer__social-link" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="#" className="footer__social-link" aria-label="YouTube">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div className="footer__col">
          <h4 className="footer__heading">Explorar</h4>
          <ul className="footer__links">
            <li><Link to="/experiencias">Experiencias</Link></li>
            <li><Link to="/hospedajes">Hospedajes</Link></li>
            <li><Link to="/destinos">Destinos</Link></li>
            <li><Link to="/reservar">Reservar</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Destinos</h4>
          <ul className="footer__links">
            <li><Link to="/destinos">Abancay</Link></li>
            <li><Link to="/destinos">Andahuaylas</Link></li>
            <li><Link to="/destinos">Curahuasi</Link></li>
            <li><Link to="/destinos">Choquequirao</Link></li>
            <li><Link to="/destinos">Valle del Apurímac</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Información</h4>
          <ul className="footer__links">
            <li><a href="#">¿Cómo funciona?</a></li>
            <li><a href="#">Guías locales</a></li>
            <li><a href="#">Políticas de reserva</a></li>
            <li><a href="#">Preguntas frecuentes</a></li>
            <li><a href="#">Contacto</a></li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} Apurímac Turismo · Plataforma demostrativa — V1 académica</p>
          <p className="footer__bottom-note">Desarrollado por Jesús Alejandro Morón Luna · Proyecto universitario</p>
        </div>
      </div>
    </footer>
  );
}
