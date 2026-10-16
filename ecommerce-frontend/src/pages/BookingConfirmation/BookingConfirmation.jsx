import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './BookingConfirmation.css';

export default function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state || !state.reservationId) {
    return (
      <div className="confirmation-page">
        <div className="container confirmation-empty">
          <h2>No hay reserva activa</h2>
          <p>Parece que llegaste aquí sin completar una reserva.</p>
          <button className="btn btn-primary mt-6" onClick={() => navigate('/experiencias')}>
            Explorar experiencias
          </button>
        </div>
      </div>
    );
  }

  const { reservationId, form, nombreItem, tipo, precio, subtotal, serviceFee, total, nights, personas } = state;

  /* ── Persist reservation to localStorage so admin can read it ── */
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('apu_reservas') || '[]');
    const alreadySaved = stored.some((r) => r.id === reservationId);
    if (!alreadySaved) {
      const entry = {
        id: reservationId,
        nombre: form.nombre,
        apellido: form.apellido,
        correo: form.correo,
        telefono: form.telefono,
        llegada: form.llegada,
        salida: form.salida,
        personas,
        observaciones: form.observaciones,
        nombreItem,
        tipo,
        precio,
        subtotal,
        serviceFee,
        total,
        nights,
        estado: 'pendiente',
        creadoEn: new Date().toISOString(),
      };
      localStorage.setItem('apu_reservas', JSON.stringify([...stored, entry]));
    }
  // Only run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-card fade-in-up">
          {/* Success icon */}
          <div className="confirmation-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--white)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          <span className="section-label" style={{ color: 'var(--primary)', textAlign: 'center', display: 'block' }}>
            Reserva confirmada
          </span>
          <h1 className="confirmation-title">
            ¡Gracias, {form.nombre}!
          </h1>
          <p className="confirmation-subtitle">
            Tu reserva ha sido registrada exitosamente. Recibirás un correo de confirmación
            en <strong>{form.correo}</strong> (simulado).
          </p>

          {/* Reservation ID */}
          <div className="confirmation-id-block">
            <span className="confirmation-id-label">Código de reserva</span>
            <span className="confirmation-id-val">{reservationId}</span>
          </div>

          {/* Details */}
          <div className="confirmation-details">
            <h2 className="confirmation-details__title">Detalles de la reserva</h2>

            <div className="confirmation-details__grid">
              <div className="confirmation-detail">
                <span className="confirmation-detail__label">
                  {tipo === 'hospedaje' ? 'Hospedaje' : 'Experiencia'}
                </span>
                <span className="confirmation-detail__val">{nombreItem}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail__label">Nombre</span>
                <span className="confirmation-detail__val">{form.nombre} {form.apellido}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail__label">Correo</span>
                <span className="confirmation-detail__val">{form.correo}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail__label">Teléfono</span>
                <span className="confirmation-detail__val">{form.telefono}</span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail__label">
                  {tipo === 'hospedaje' ? 'Check-in' : 'Fecha de llegada'}
                </span>
                <span className="confirmation-detail__val">
                  {new Date(form.llegada + 'T12:00:00').toLocaleDateString('es-PE', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail__label">
                  {tipo === 'hospedaje' ? 'Check-out' : 'Fecha de salida'}
                </span>
                <span className="confirmation-detail__val">
                  {new Date(form.salida + 'T12:00:00').toLocaleDateString('es-PE', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
              <div className="confirmation-detail">
                <span className="confirmation-detail__label">Personas</span>
                <span className="confirmation-detail__val">{personas}</span>
              </div>
              {nights && (
                <div className="confirmation-detail">
                  <span className="confirmation-detail__label">Noches</span>
                  <span className="confirmation-detail__val">{nights}</span>
                </div>
              )}
            </div>

            {form.observaciones && (
              <div className="confirmation-detail confirmation-detail--full">
                <span className="confirmation-detail__label">Observaciones</span>
                <span className="confirmation-detail__val">{form.observaciones}</span>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="confirmation-pricing">
            <div className="confirmation-pricing__row">
              <span>Subtotal</span>
              <span>S/ {subtotal}</span>
            </div>
            <div className="confirmation-pricing__row">
              <span>Tarifa de servicio</span>
              <span>S/ {serviceFee}</span>
            </div>
            <div className="confirmation-pricing__total">
              <strong>Total</strong>
              <strong>S/ {total}</strong>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="confirmation-disclaimer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p>
              Esta es una reserva <strong>simulada</strong> — Versión 1 académica.
              No se ha realizado ningún cargo real. En una versión futura, esta confirmación
              llegaría al correo del usuario y se almacenaría en una base de datos.
            </p>
          </div>

          {/* Actions */}
          <div className="confirmation-actions">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/')}
              id="confirmation-home"
            >
              Volver al inicio
            </button>
            <button
              className="btn btn-outline btn-lg"
              onClick={() => navigate('/experiencias')}
              id="confirmation-explore"
            >
              Seguir explorando
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
