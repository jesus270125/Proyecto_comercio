import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { reservationsService } from '../../services/api';
import BookingSummary from './BookingSummary';
import { initialForm, validateForm } from './bookingValidation';
import './Booking.css';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const tipo   = searchParams.get('tipo') || 'experiencia';
  const nombre = searchParams.get('nombre') || 'Experiencia en Apurímac';
  const precio = Number(searchParams.get('precio') || 0);
  const checkin  = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';

  useEffect(() => {
    setForm(f => ({
      ...f,
      llegada: checkin,
      salida: checkout,
      personas: searchParams.get('personas') || '2'
    }));
  }, [checkin, checkout, searchParams]);

  const nights = form.llegada && form.salida
    ? Math.max(0, Math.ceil((new Date(form.salida) - new Date(form.llegada)) / (1000*60*60*24)))
    : 1;

  const subtotal = precio * Number(form.personas) * (tipo === 'hospedaje' ? nights : 1);
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(e => { const n = {...e}; delete n[name]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      const isHospedaje = tipo.toLowerCase() === 'hospedaje';
      const targetId = parseInt(searchParams.get('id') || '1', 10);
      const payload = {
        guestNombre: form.nombre,
        guestApellido: form.apellido,
        guestEmail: form.correo,
        guestTelefono: form.telefono,
        observaciones: form.observaciones,
        tipo: isHospedaje ? 'HOSPEDAJE' : 'EXPERIENCIA',
        experienceId: !isHospedaje ? targetId : null,
        accommodationId: isHospedaje ? targetId : null,
        fechaLlegada: form.llegada,
        fechaSalida: form.salida,
        personas: parseInt(form.personas, 10) || 1,
      };

      const res = await reservationsService.create(payload);
      const reservationId = res.data?.codigo || ('APU-' + Math.random().toString(36).substr(2, 8).toUpperCase());

      navigate('/confirmacion', {
        state: {
          reservationId,
          form,
          nombreItem: nombre,
          tipo,
          precio,
          subtotal,
          serviceFee,
          total: res.data?.total ? parseFloat(res.data.total) : total,
          nights: isHospedaje ? nights : null,
          personas: Number(form.personas)
        }
      });
    } catch (err) {
      setErrors({ submit: err.message || 'Error al procesar la reserva en el servidor.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <span className="section-label">Formulario de reserva</span>
          <h1 className="booking-title">Confirma tu reserva</h1>
          <p className="booking-subtitle">
            Completa los datos. La reserva es simulada — sin pago real en esta versión.
          </p>
        </div>

        <div className="booking-layout">
          {/* Form */}
          <form className="booking-form" onSubmit={handleSubmit} noValidate id="booking-form">
            {errors.submit && (
              <div style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {errors.submit}
              </div>
            )}
            <section className="booking-section" aria-labelledby="personal-data">
              <h2 className="booking-section__title" id="personal-data">Datos personales</h2>
              <div className="booking-grid-2">
                <div className="form-group">
                  <label className="form-label" htmlFor="book-nombre">Nombre *</label>
                  <input
                    id="book-nombre"
                    name="nombre"
                    type="text"
                    className={`form-input ${errors.nombre ? 'form-input--error' : ''}`}
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                  {errors.nombre && <span className="form-error">{errors.nombre}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-apellido">Apellido *</label>
                  <input
                    id="book-apellido"
                    name="apellido"
                    type="text"
                    className={`form-input ${errors.apellido ? 'form-input--error' : ''}`}
                    placeholder="Tu apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                  {errors.apellido && <span className="form-error">{errors.apellido}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-correo">Correo electrónico *</label>
                  <input
                    id="book-correo"
                    name="correo"
                    type="email"
                    className={`form-input ${errors.correo ? 'form-input--error' : ''}`}
                    placeholder="tu@correo.com"
                    value={form.correo}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.correo && <span className="form-error">{errors.correo}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-telefono">Teléfono *</label>
                  <input
                    id="book-telefono"
                    name="telefono"
                    type="tel"
                    className={`form-input ${errors.telefono ? 'form-input--error' : ''}`}
                    placeholder="+51 999 999 999"
                    value={form.telefono}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                  {errors.telefono && <span className="form-error">{errors.telefono}</span>}
                </div>
              </div>
            </section>

            <section className="booking-section" aria-labelledby="trip-data">
              <h2 className="booking-section__title" id="trip-data">Detalles del viaje</h2>
              <div className="booking-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="book-llegada">
                    {tipo === 'hospedaje' ? 'Fecha de check-in *' : 'Fecha de llegada *'}
                  </label>
                  <input
                    id="book-llegada"
                    name="llegada"
                    type="date"
                    className={`form-input ${errors.llegada ? 'form-input--error' : ''}`}
                    value={form.llegada}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                  />
                  {errors.llegada && <span className="form-error">{errors.llegada}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-salida">
                    {tipo === 'hospedaje' ? 'Fecha de check-out *' : 'Fecha de salida *'}
                  </label>
                  <input
                    id="book-salida"
                    name="salida"
                    type="date"
                    className={`form-input ${errors.salida ? 'form-input--error' : ''}`}
                    value={form.salida}
                    min={form.llegada || new Date().toISOString().split('T')[0]}
                    onChange={handleChange}
                  />
                  {errors.salida && <span className="form-error">{errors.salida}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-personas">Número de personas</label>
                  <select
                    id="book-personas"
                    name="personas"
                    className="form-select"
                    value={form.personas}
                    onChange={handleChange}
                  >
                    {[1,2,3,4,5,6,8,10,12].map(n => (
                      <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="booking-section" aria-labelledby="observations">
              <h2 className="booking-section__title" id="observations">Observaciones</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="book-obs">
                  Comentarios adicionales (opcional)
                </label>
                <textarea
                  id="book-obs"
                  name="observaciones"
                  className="form-textarea"
                  placeholder="Alergias, necesidades especiales, preguntas…"
                  value={form.observaciones}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
            </section>

            <div className="booking-actions">
              <button
                type="submit"
                className="btn btn-primary btn-lg booking-submit"
                disabled={submitting}
                id="booking-submit-btn"
              >
                {submitting ? (
                  <>
                    <span className="booking-spinner" aria-hidden="true" />
                    Procesando…
                  </>
                ) : (
                  <>
                    Confirmar reserva
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
              <p className="booking-legal">
                Al confirmar, aceptas los términos de esta plataforma demostrativa.
                No se realizará ningún cargo real.
              </p>
            </div>
          </form>

          {/* Summary */}
          <BookingSummary
            tipo={tipo}
            nombre={nombre}
            form={form}
            nights={nights}
            precio={precio}
            subtotal={subtotal}
            serviceFee={serviceFee}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
