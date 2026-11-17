import { useEffect, useState } from 'react';
import { reservationsService } from '../../services/api';

export default function MercadoPagoTestPayment({ payment }) {
  const [status, setStatus] = useState('PENDIENTE');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let timer;
    async function check() {
      try {
        const result = await reservationsService.getMercadoPagoTestStatus(payment.accessToken);
        if (!active) return;
        setStatus(result.status);
        setError('');
        if (result.status === 'PENDIENTE') timer = setTimeout(check, 15000);
      } catch {
        if (active) { setError('No se pudo consultar el pago. Volveremos a intentarlo.'); timer = setTimeout(check, 30000); }
      }
    }
    check();
    return () => { active = false; clearTimeout(timer); };
  }, [payment.accessToken]);
  const messages = {
    PENDIENTE: 'Pago de prueba pendiente. Usa únicamente datos de prueba.',
    PAGADA_PRUEBA: 'Pago de prueba verificado. No se cobró dinero real.',
    RECHAZADA: 'El pago de prueba fue rechazado.',
    CANCELADA: 'El pago de prueba fue cancelado o venció.',
    REEMBOLSADA: 'El pago de prueba fue reembolsado total o parcialmente.',
  };
  return <div className="confirmation-disclaimer" role="status" style={{ display: 'block' }}>
    <strong>Tarifa de prueba: S/ {(payment.amountCents / 100).toFixed(2)}</strong>
    <p>{messages[status] || 'Consultando el estado del pago de prueba.'}</p>
    {status === 'PENDIENTE' && <a className="btn btn-primary" href={payment.url} target="_blank" rel="noopener noreferrer">Abrir Mercado Pago de prueba</a>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
