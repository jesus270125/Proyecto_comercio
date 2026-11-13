export default function BookingSummary({ tipo, nombre, form, nights, precio, subtotal, serviceFee, total }) {
  return (
    <aside className="booking-summary" aria-label="Resumen de reserva">
      <div className="booking-summary__card">
        <h2 className="booking-summary__title">Tu reserva</h2>

        <div className="booking-summary__item-name">
          <span className="booking-summary__badge">{tipo === 'hospedaje' ? 'Hospedaje' : 'Experiencia'}</span>
          <h3>{nombre}</h3>
        </div>

        <div className="booking-summary__rows">
          {form.llegada && (
            <div className="booking-summary__row">
              <span>{tipo === 'hospedaje' ? 'Check-in' : 'Llegada'}</span>
              <strong>{new Date(form.llegada + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          )}
          {form.salida && (
            <div className="booking-summary__row">
              <span>{tipo === 'hospedaje' ? 'Check-out' : 'Salida'}</span>
              <strong>{new Date(form.salida + 'T12:00:00').toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          )}
          {tipo === 'hospedaje' && nights > 0 && (
            <div className="booking-summary__row">
              <span>Noches</span>
              <strong>{nights}</strong>
            </div>
          )}
          <div className="booking-summary__row">
            <span>Personas</span>
            <strong>{form.personas}</strong>
          </div>
        </div>

        {tipo !== 'hospedaje' || nights > 0 ? <div className="booking-summary__prices">
          <div className="booking-summary__row">
            <span>
              S/ {precio} × {form.personas} {Number(form.personas) > 1 ? 'personas' : 'persona'}
              {tipo === 'hospedaje' && nights > 0 && ` × ${nights} noche${nights > 1 ? 's' : ''}`}
            </span>
            <span>S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="booking-summary__row">
            <span>Tarifa de servicio (5%)</span>
            <span>S/ {serviceFee.toFixed(2)}</span>
          </div>
          <div className="booking-summary__total">
            <strong>Total estimado</strong>
            <strong className="booking-summary__total-val">S/ {total.toFixed(2)}</strong>
          </div>
          <div className="booking-summary__row"><span>Adelanto de referencia (tarifa de servicio)</span><span>S/ {serviceFee.toFixed(2)}</span></div>
          <div className="booking-summary__row"><span>Saldo de referencia</span><span>S/ {subtotal.toFixed(2)}</span></div>
        </div> : <p>Selecciona las fechas para calcular el importe.</p>}

        <div className="booking-summary__note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>
            Solicitud de prueba sin pago real. El servidor calcula el importe definitivo al registrarla.
          </p>
        </div>
      </div>
    </aside>
  );
}
