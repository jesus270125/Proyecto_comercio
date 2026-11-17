import { useEffect, useState } from 'react';
import { reservationsService } from '../../services/api';

export default function IzipayTestPayment({ payment }) {
  const [status, setStatus] = useState('PENDIENTE');
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    let timer;
    async function check() {
      try {
        const result = await reservationsService.getIzipayTestStatus(payment.accessToken);
        if (!active) return;
        setStatus(result.status); setError('');
        if (result.status === 'PENDIENTE') timer = setTimeout(check, 15000);
      } catch {
        if (active) { setError('No se pudo consultar el pago. Volveremos a intentarlo.'); timer = setTimeout(check, 30000); }
      }
    }
    check();
    return () => { active = false; clearTimeout(timer); };
  }, [payment.accessToken]);
  return <div className="confirmation-disclaimer" role="status" style={{ display: 'block' }}>
    <strong>Tarifa de prueba: S/ {(payment.amountCents / 100).toFixed(2)}</strong>
    <p>{status === 'PAGADA_PRUEBA' ? 'Pago de prueba verificado con Izipay. No se cobró dinero real.' : status === 'VENCIDA' ? 'El enlace de prueba ya no está vigente.' : 'Pago de prueba pendiente. Usa únicamente tarjetas de prueba.'}</p>
    {status === 'PENDIENTE' && <a className="btn btn-primary" href={payment.url} target="_blank" rel="noopener noreferrer">Abrir Izipay de prueba</a>}
    {error && <p role="alert">{error}</p>}
  </div>;
}
