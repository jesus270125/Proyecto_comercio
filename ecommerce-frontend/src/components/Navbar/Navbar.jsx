import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../LoginModal/LoginModal';
import './Navbar.css';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Páginas con portada oscura o foto inmersiva donde el menú inicia transparente.
  // En las demás (como /reservar, /confirmacion, etc.), inicia sólido con texto oscuro.
  const hasDarkHero =
    pathname === '/' ||
    pathname.startsWith('/experiencias') ||
    pathname.startsWith('/hospedajes') ||
    pathname === '/destinos';

  const isSolid = scrolled || !hasDarkHero;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`navbar ${isSolid ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <Link to="/" className="navbar__logo" onClick={closeMenu}>
          <span className="navbar__logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L26 22H2L14 2Z" fill="currentColor" opacity="0.9"/>
              <circle cx="14" cy="19" r="4" fill="currentColor" opacity="0.5"/>
            </svg>
          </span>
          <span className="navbar__logo-text">
            <span className="navbar__logo-main">APURÍMAC</span>
            <span className="navbar__logo-sub">turismo</span>
          </span>
        </Link>

        {/* Nav links – desktop */}
        <nav className="navbar__nav" aria-label="Navegación principal">
          <NavLink to="/" end className={({isActive}) => `navbar__link ${isActive ? 'active' : ''}`}>
            Inicio
          </NavLink>
          <NavLink to="/experiencias" className={({isActive}) => `navbar__link ${isActive ? 'active' : ''}`}>
            Experiencias
          </NavLink>
          <NavLink to="/hospedajes" className={({isActive}) => `navbar__link ${isActive ? 'active' : ''}`}>
            Hospedajes
          </NavLink>
          <NavLink to="/destinos" className={({isActive}) => `navbar__link ${isActive ? 'active' : ''}`}>
            Destinos
          </NavLink>
        </nav>

        {/* CTA – desktop */}
        <div className="navbar__actions">
          {isAdmin ? (
            <>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => navigate('/admin')}
                id="navbar-admin-btn"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                Panel Admin
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => { logout(); navigate('/'); }}
                id="navbar-logout-btn"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setLoginOpen(true)}
                id="navbar-login-btn"
              >
                Iniciar sesión
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate('/experiencias')}
                id="navbar-cta-explorar"
              >
                Explorar
              </button>
            </>
          )}
        </div>

        {/* Hamburger */}
        <button
          className={`navbar__burger ${menuOpen ? 'open' : ''}`}
          onClick={() => setMenuOpen(p => !p)}
          aria-label="Menú"
          aria-expanded={menuOpen}
          id="navbar-burger"
        >
          <span /><span /><span />
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`navbar__mobile ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        <nav className="navbar__mobile-nav">
          <Link to="/" className="navbar__mobile-link" onClick={closeMenu}>Inicio</Link>
          <Link to="/experiencias" className="navbar__mobile-link" onClick={closeMenu}>Experiencias</Link>
          <Link to="/hospedajes" className="navbar__mobile-link" onClick={closeMenu}>Hospedajes</Link>
          <Link to="/destinos" className="navbar__mobile-link" onClick={closeMenu}>Destinos</Link>
          {isAdmin ? (
            <>
              <Link to="/admin" className="navbar__mobile-link" onClick={closeMenu}>Panel Admin</Link>
              <button
                className="btn btn-primary w-full mt-4"
                onClick={() => { logout(); navigate('/'); closeMenu(); }}
                id="navbar-mobile-logout-btn"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <button
                className="btn btn-outline w-full mt-4"
                onClick={() => { setLoginOpen(true); closeMenu(); }}
                id="navbar-mobile-login-btn"
              >
                Iniciar sesión
              </button>
              <button
                className="btn btn-primary w-full"
                onClick={() => { navigate('/experiencias'); closeMenu(); }}
              >
                Explorar ahora
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Login Modal */}
      <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
    </header>
  );
}
