import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { reservationsService } from '../../services/api';
import './BookingConfirmation.css';

const mercadoPagoStatus = {
  CREANDO: 'El enlace de pago aún no está disponible.',
  PENDIENTE: 'Pago de la tarifa pendiente.',
  EN_PROCESO: 'Mercado Pago está procesando el pago.',
  PAGADA: 'Tarifa acreditada. La reserva sigue su proceso de confirmación.',
  RECHAZADA: 'Mercado Pago rechazó el pago.',
  CANCELADA: 'El pago se canceló o venció.',
  REEMBOLSADA: 'Se reembolsó la tarifa.',
  REEMBOLSO_PARCIAL: 'La tarifa se reembolsó parcialmente.',
  CONTRACARGO: 'El pago tiene un contracargo.',
};

export function MercadoPagoPayment({ code, token, initialPayment }) {
  const [payment, setPayment] = useState(initialPayment);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const status = payment?.status;

  useEffect(() => {
    if (!token || (status && !['PENDIENTE', 'EN_PROCESO'].includes(status))) return;
    let active = true;
    let timer;
    let checks = 0;
    const poll = async () => {
      let current;
      try {
        current = await reservationsService.getMercadoPagoStatus(code, token);
        if (!active) return;
        setPayment(current);
        setError('');
      } catch (err) {
        if (active) setError(err.message);
      }
      if (active && ++checks < 20 && (!current || ['PENDIENTE', 'EN_PROCESO'].includes(current.status))) {
        timer = setTimeout(poll, 12000);
      }
    };
    void poll();
    return () => { active = false; clearTimeout(timer); };
  }, [code, token, status]);

  async function check(prepare) {
    setBusy(true);
    try {
      const current = await (prepare ? reservationsService.retryMercadoPago(code, token) : reservationsService.getMercadoPagoStatus(code, token));
      setPayment(current);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!token) return <p>Consulta el pago desde el navegador donde iniciaste la reserva. Si ya lo cerraste, contacta a administración con tu código.</p>;

  return (
    <div>
      {payment && <p>Tarifa de servicio: <strong>S/ {(payment.amountCents / 100).toFixed(2)}</strong></p>}
      <p role="status">{mercadoPagoStatus[status] || 'Consultando el estado del pago…'}</p>
      {error && <p role="alert">{error}</p>}
      <div className="confirmation-actions">
        {payment?.url && <a className="btn btn-primary" href={payment.url}>Pagar tarifa en Mercado Pago</a>}
        {status === 'CREANDO' ? (
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => check(true)}>Preparar enlace de pago</button>
        ) : (
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => check(false)}>Consultar pago</button>
        )}
      </div>
    </div>
  );
}

export default function MercadoPagoReturn() {
  const [params] = useSearchParams();
  const code = params.get('reserva');
  let token;
  if (/^APU-[A-Z0-9]{1,16}$/.test(code || '')) {
    try { token = sessionStorage.getItem(`mp-reserva:${code}`); } catch { /* muestra el mensaje de acceso */ }
  }
  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-card">
          <h1 className="confirmation-title">Estado del pago</h1>
          {code && <p className="confirmation-id-block">Reserva {code}</p>}
          <MercadoPagoPayment key={code} code={code} token={token} />
        </div>
      </div>
    </div>
  );
}
