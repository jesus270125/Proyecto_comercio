import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { reservationsService, experiencesService, accommodationsService } from '../../services/api';
import BookingSummary from './BookingSummary';
import { initialForm, validateForm } from './bookingValidation';
import './Booking.css';

export default function Booking() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...initialForm, llegada: searchParams.get('checkin') || '', salida: searchParams.get('checkout') || '', personas: searchParams.get('personas') || '2' }));
  const [today] = useState(() => new Date().toISOString().split('T')[0]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [itemResult, setItemResult] = useState(null);
  const [demoEnabled, setDemoEnabled] = useState(false);
  const [paymentStep, setPaymentStep] = useState(false);
  const [culqiTest, setCulqiTest] = useState(false);

  useEffect(() => {
    let active = true;
    reservationsService.getPaymentDemo().then(result => {
      if (active) setDemoEnabled(result.enabled === true);
    }).catch(() => {});
    reservationsService.getPaymentTest().then(result => {
      if (active) setCulqiTest(result.enabled === true);
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  const tipo   = searchParams.get('tipo') || 'experiencia';
  const itemId = searchParams.get('id');
  const itemKey = `${tipo}:${itemId}`;
  useEffect(() => {
    let active = true;
    if (!['experiencia', 'hospedaje'].includes(tipo) || !/^\d+$/.test(itemId || '')) {
      Promise.resolve().then(() => { if (active) setItemResult({ key: itemKey, error: 'Selecciona una experiencia o un hospedaje del catálogo.' }); });
      return () => { active = false; };
    }
    const service = tipo === 'hospedaje' ? accommodationsService : experiencesService;
    service.getAll().then(res => {
      const item = res.data?.find(entry => String(entry.id) === itemId);
      if (active) setItemResult({ key: itemKey, item, error: item ? '' : 'Este servicio ya no está disponible.' });
    }).catch(() => { if (active) setItemResult({ key: itemKey, error: 'No se pudo consultar el precio. Inténtalo de nuevo.' }); });
    return () => { active = false; };
  }, [tipo, itemId, itemKey]);
  const item = itemResult?.key === itemKey ? itemResult.item : null;
  const itemError = itemResult?.key === itemKey ? itemResult.error : '';
  const nombre = item?.name || '';
  const precio = Number(item?.price || 0);
  const nights = form.llegada && form.salida
    ? Math.max(0, Math.ceil((new Date(form.salida) - new Date(form.llegada)) / (1000*60*60*24)))
    : 0;

  const subtotal = precio * Number(form.personas) * (tipo === 'hospedaje' ? nights : 1);
  const serviceFee = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setPaymentStep(false);
    if (errors[name]) setErrors(e => { const n = {...e}; delete n[name]; return n; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!item) return;
    const errs = validateForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    if (demoEnabled && !paymentStep) {
      setPaymentStep(true);
      return;
    }
    setSubmitting(true);
    try {
      const isHospedaje = tipo.toLowerCase() === 'hospedaje';
      const targetId = Number(itemId);
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
        pagoSimulado: demoEnabled && !culqiTest,
      };

      const res = await reservationsService.create(payload);
      if (!res.data?.codigo) throw new Error('No se recibió la confirmación del servidor.');
      const reservationId = res.data.codigo;

      navigate('/confirmacion', {
        state: {
          reservationId,
          form,
          nombreItem: nombre,
          tipo,
          precio: Number(res.data.precioUnitario),
          subtotal: Number(res.data.subtotal),
          serviceFee: Number(res.data.serviceFee),
          total: Number(res.data.total),
          nights: isHospedaje ? nights : null,
          personas: Number(form.personas),
          pagoSimulado: res.data.estadoPago === 'SIMULADO',
          testPayment: res.data.testPayment,
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
          <h1 className="booking-title">Registra tu solicitud</h1>
          <p className="booking-subtitle">
            {culqiTest ? 'Entorno de prueba: pagarás la tarifa con Culqi de prueba. No se realizará un cobro real.' : demoEnabled ? 'Prueba el flujo de reserva y adelanto. No se realizará ningún cobro real.' : 'Completa los datos. La reserva es simulada — sin pago real en esta versión.'}
          </p>
        </div>

        <div className="booking-layout">
          {/* Form */}
          <form className="booking-form" onSubmit={handleSubmit} noValidate id="booking-form">
            {(errors.submit || itemError) && (
              <div role="alert" style={{ background: '#fef2f2', border: '1px solid #f87171', color: '#991b1b', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                {errors.submit || itemError}
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
                    aria-invalid={Boolean(errors.nombre)}
                    aria-describedby={errors.nombre ? 'error-nombre' : undefined}
                    type="text"
                    className={`form-input ${errors.nombre ? 'form-input--error' : ''}`}
                    placeholder="Tu nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    autoComplete="given-name"
                  />
                  {errors.nombre && <span id="error-nombre" className="form-error">{errors.nombre}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-apellido">Apellido *</label>
                  <input
                    id="book-apellido"
                    name="apellido"
                    aria-invalid={Boolean(errors.apellido)}
                    aria-describedby={errors.apellido ? 'error-apellido' : undefined}
                    type="text"
                    className={`form-input ${errors.apellido ? 'form-input--error' : ''}`}
                    placeholder="Tu apellido"
                    value={form.apellido}
                    onChange={handleChange}
                    autoComplete="family-name"
                  />
                  {errors.apellido && <span id="error-apellido" className="form-error">{errors.apellido}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-correo">Correo electrónico *</label>
                  <input
                    id="book-correo"
                    name="correo"
                    aria-invalid={Boolean(errors.correo)}
                    aria-describedby={errors.correo ? 'error-correo' : undefined}
                    type="email"
                    className={`form-input ${errors.correo ? 'form-input--error' : ''}`}
                    placeholder="tu@correo.com"
                    value={form.correo}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                  {errors.correo && <span id="error-correo" className="form-error">{errors.correo}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-telefono">Teléfono *</label>
                  <input
                    id="book-telefono"
                    name="telefono"
                    aria-invalid={Boolean(errors.telefono)}
                    aria-describedby={errors.telefono ? 'error-telefono' : undefined}
                    type="tel"
                    className={`form-input ${errors.telefono ? 'form-input--error' : ''}`}
                    placeholder="+51 999 999 999"
                    value={form.telefono}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                  {errors.telefono && <span id="error-telefono" className="form-error">{errors.telefono}</span>}
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
                    aria-invalid={Boolean(errors.llegada)}
                    aria-describedby={errors.llegada ? 'error-llegada' : undefined}
                    type="date"
                    className={`form-input ${errors.llegada ? 'form-input--error' : ''}`}
                    value={form.llegada}
                    min={today}
                    onChange={handleChange}
                  />
                  {errors.llegada && <span id="error-llegada" className="form-error">{errors.llegada}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="book-salida">
                    {tipo === 'hospedaje' ? 'Fecha de check-out *' : 'Fecha de salida *'}
                  </label>
                  <input
                    id="book-salida"
                    name="salida"
                    aria-invalid={Boolean(errors.salida)}
                    aria-describedby={errors.salida ? 'error-salida' : undefined}
                    type="date"
                    className={`form-input ${errors.salida ? 'form-input--error' : ''}`}
                    value={form.salida}
                    min={form.llegada || today}
                    onChange={handleChange}
                  />
                  {errors.salida && <span id="error-salida" className="form-error">{errors.salida}</span>}
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
              {demoEnabled && paymentStep && (
                <div role="status" style={{ padding: '1rem', marginBottom: '1rem', background: '#fff8e1', borderRadius: '0.5rem' }}>
                  <strong>Simulación de pago</strong>
                  <p>Adelanto de prueba: S/ {serviceFee.toFixed(2)}. Saldo de referencia: S/ {subtotal.toFixed(2)}.</p>
                  <p>No ingreses datos bancarios. Al continuar se registrará un pago simulado, sin cargo real.</p>
                  <button type="button" onClick={() => setPaymentStep(false)}>Volver a revisar los datos</button>
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary btn-lg booking-submit"
                disabled={submitting || !item}
                id="booking-submit-btn"
              >
                {submitting ? (
                  <>
                    <span className="booking-spinner" aria-hidden="true" />
                    Procesando…
                  </>
                ) : (
                  <>
                    {culqiTest ? 'Continuar al pago de prueba' : demoEnabled ? (paymentStep ? 'Simular pago y registrar solicitud' : 'Continuar a la simulación de pago') : 'Registrar solicitud'}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </>
                )}
              </button>
              <p className="booking-legal">
                {culqiTest ? 'Solo prueba de billeteras: la tarifa debe estar entre S/ 6 y S/ 500. No se realizará ningún cargo real.' : 'Se registrará una solicitud de prueba. No se realizará ningún cargo real.'}
              </p>
            </div>
          </form>

          {/* Summary */}
          {item ? <BookingSummary
            tipo={tipo}
            nombre={nombre}
            form={form}
            nights={nights}
            precio={precio}
            subtotal={subtotal}
            serviceFee={serviceFee}
            total={total}
          /> : <aside className="booking-summary" aria-live="polite">{itemError || 'Consultando disponibilidad y precio…'}</aside>}
        </div>
      </div>
    </div>
  );
}
