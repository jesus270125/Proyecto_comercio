import { useState, useEffect } from 'react';
import { useNavigate, NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/authStore';
import { experiences } from '../../data/experiences';
import { accommodations } from '../../data/accommodations';
import AdminDashboard from './sections/AdminDashboard';
import AdminReservas from './sections/AdminReservas';
import AdminDestinos from './sections/AdminDestinos';
import AdminExperiencias from './sections/AdminExperiencias';
import AdminHospedajes from './sections/AdminHospedajes';
import AdminPerfil from './sections/AdminPerfil';
import './Admin.css';

/* ─── Icons ─────────────────────────────────────── */
const IconGrid = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconMap = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
  </svg>
);
const IconHome = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const IconSite = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
  </svg>
);
const IconMenu = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);

/* ─── NAV ITEMS ─────────────────────────────────── */
const NAV = [
  { to: '/admin',              label: 'Dashboard',     icon: <IconGrid /> },
  { to: '/admin/reservas',     label: 'Reservas',      icon: <IconCalendar /> },
  { to: '/admin/destinos',     label: 'Destinos',      icon: <IconPin /> },
  { to: '/admin/experiencias', label: 'Experiencias',  icon: <IconMap /> },
  { to: '/admin/hospedajes',   label: 'Hospedajes',    icon: <IconHome /> },
  { to: '/admin/perfil',       label: 'Mi perfil',     icon: <IconUser /> },
];

import { adminService } from '../../services/api';

/* ─── Protected Admin Layout ─────────────────────── */
export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [reservas, setReservas] = useState([]);
  const [dests, setDests] = useState([]);
  const [exps, setExps] = useState(experiences);
  const [accs, setAccs] = useState(accommodations);

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate('/', { replace: true });
      return;
    }

    let isMounted = true;
    Promise.allSettled([
      adminService.getReservations(),
      adminService.getExperiences(),
      adminService.getAccommodations(),
      adminService.getDestinations()
    ]).then(([resRes, expRes, accRes, destRes]) => {
      if (!isMounted) return;
      if (resRes.status === 'fulfilled' && resRes.value.data) {
        setReservas(resRes.value.data);
      } else {
        try {
          setReservas(JSON.parse(localStorage.getItem('apu_reservas') || '[]'));
        } catch { /* ignore */ }
      }

      if (destRes.status === 'fulfilled' && destRes.value.data) {
        setDests(destRes.value.data.map(d => ({
          ...d,
          name: d.nombre || d.name,
        })));
      }

      if (expRes.status === 'fulfilled' && expRes.value.data) {
        setExps(expRes.value.data.map(e => ({
          ...e,
          name: e.nombre || e.name,
          reviews: e.reviewsCount || e.reviews || 0,
          price: parseFloat(e.price),
        })));
      }

      if (accRes.status === 'fulfilled' && accRes.value.data) {
        setAccs(accRes.value.data.map(a => ({
          ...a,
          name: a.nombre || a.name,
          reviews: a.reviewsCount || a.reviews || 0,
          price: parseFloat(a.price),
        })));
      }
    });

    return () => { isMounted = false; };
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="admin-layout">
      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="admin-sidebar__logo">
          <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
            <path d="M14 2L26 22H2L14 2Z" fill="currentColor" opacity="0.9"/>
            <circle cx="14" cy="19" r="4" fill="currentColor" opacity="0.5"/>
          </svg>
          <div>
            <div className="admin-sidebar__logo-main">APURÍMAC</div>
            <div className="admin-sidebar__logo-sub">Panel Admin</div>
          </div>
        </div>

        {/* User badge */}
        <div className="admin-sidebar__user">
          <div className="admin-sidebar__avatar" aria-hidden="true">
            {user.nombre.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="admin-sidebar__user-name">{user.nombre}</div>
            <div className="admin-sidebar__user-role">Administrador</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar__nav" aria-label="Menú del panel">
          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `admin-nav-link ${isActive ? 'active' : ''}`
              }
              onClick={closeSidebar}
            >
              <span className="admin-nav-link__icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer links */}
        <div className="admin-sidebar__footer">
          <a
            href="/"
            className="admin-nav-link admin-nav-link--muted"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeSidebar}
          >
            <span className="admin-nav-link__icon"><IconSite /></span>
            <span>Ver sitio web</span>
          </a>
          <button
            className="admin-nav-link admin-nav-link--danger"
            onClick={handleLogout}
            id="admin-logout-btn"
          >
            <span className="admin-nav-link__icon"><IconLogout /></span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="admin-overlay" onClick={closeSidebar} aria-hidden />
      )}

      {/* ── Main ── */}
      <div className="admin-main">
        {/* Topbar */}
        <header className="admin-topbar">
          <button
            className="admin-topbar__burger"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Abrir menú"
            id="admin-sidebar-toggle"
          >
            <IconMenu />
          </button>
          <div className="admin-topbar__right">
            <span className="admin-topbar__user">
              {user.nombre}
            </span>
            <div className="admin-topbar__avatar" aria-hidden>
              {user.nombre.charAt(0)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="admin-content">
          <Routes>
            <Route index element={
              <AdminDashboard
                reservas={reservas}
                experiences={exps}
                accommodations={accs}
              />
            }/>
            <Route path="reservas" element={
              <AdminReservas reservas={reservas} setReservas={setReservas} />
            }/>
            <Route path="destinos" element={
              <AdminDestinos destinations={dests} setDestinations={setDests} />
            }/>
            <Route path="experiencias" element={
              <AdminExperiencias experiences={exps} setExperiences={setExps} />
            }/>
            <Route path="hospedajes" element={
              <AdminHospedajes accommodations={accs} setAccommodations={setAccs} />
            }/>
            <Route path="perfil" element={<AdminPerfil user={user} />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
