import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import BackendStatus from './components/BackendStatus/BackendStatus';
import Home from './pages/Home/Home';
import Experiences from './pages/Experiences/Experiences';
import ExperienceDetail from './pages/ExperienceDetail/ExperienceDetail';
import Accommodations from './pages/Accommodations/Accommodations';
import AccommodationDetail from './pages/AccommodationDetail/AccommodationDetail';
import Destinations from './pages/Destinations/Destinations';
import Booking from './pages/Booking/Booking';
import BookingConfirmation from './pages/BookingConfirmation/BookingConfirmation';
import AdminLayout from './pages/Admin/AdminLayout';
import './App.css';

/* Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      {/* ── Admin routes (own layout, no public navbar/footer) ── */}
      <Route path="/admin/*" element={<AdminLayout />} />

      {/* ── Public routes ── */}
      <Route path="/*" element={
        <>
          <ScrollToTop />
          <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
          <Navbar />
          <main className="app-main" id="main-content" tabIndex="-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/destinos" element={<Destinations />} />
              <Route path="/experiencias" element={<Experiences />} />
              <Route path="/experiencias/:slug" element={<ExperienceDetail />} />
              <Route path="/hospedajes" element={<Accommodations />} />
              <Route path="/hospedajes/:slug" element={<AccommodationDetail />} />
              <Route path="/reservar" element={<Booking />} />
              <Route path="/confirmacion" element={<BookingConfirmation />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </>
      } />
    </Routes>
  );
}

function NotFound() {
  return (
    <div style={{ paddingTop: 'calc(var(--navbar-h) + 6rem)', textAlign: 'center', minHeight: '60vh' }}>
      <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>404</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
        La página que buscas no existe.
      </p>
      <a href="/" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-flex' }}>
        Volver al inicio
      </a>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <BackendStatus />
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
