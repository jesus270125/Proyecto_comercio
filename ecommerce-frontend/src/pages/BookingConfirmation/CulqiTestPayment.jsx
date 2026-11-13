import { useEffect, useRef, useState } from 'react';
import { reservationsService } from '../../services/api';

export default function CulqiTestPayment({ payment, form }) {
  const [status, setStatus] = useState('PENDIENTE');
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);
  const checkout = useRef(null);

  useEffect(() => {
    let active = true;
    const script = document.createElement('script');
    script.src = 'https://js.culqi.com/checkout-js';
    script.onload = () => { if (active) setReady(true); };
    script.onerror = () => { if (active) setError('No se pudo cargar Culqi. Intenta recargar la página.'); };
    document.body.appendChild(script);
    return () => { active = false; script.remove(); };
  }, []);

  useEffect(() => {
    let active = true;
    let timer;
    async function check() {
      try {
        const result = await reservationsService.getTestPaymentStatus(payment.accessToken);
        if (active) { setStatus(result.status); setError(''); }
        if (active && result.status === 'PENDIENTE') timer = setTimeout(check, 15000);
      } catch {
        if (active) { setError('No se pudo verificar el pago. Seguiremos intentando.'); timer = setTimeout(check, 30000); }
      }
    }
    check();
    return () => { active = false; clearTimeout(timer); };
  }, [payment.accessToken]);

  function openCheckout() {
    if (!window.CulqiCheckout) { setError('Culqi aún no está disponible. Inténtalo otra vez.'); return; }
    const methods = { tarjeta: false, yape: false, billetera: true, bancaMovil: false, agente: false, cuotealo: false };
    const instance = new window.CulqiCheckout(payment.publicKey, {
      settings: { title: 'Apurímac Turismo — Prueba', currency: 'PEN', amount: payment.amountCents, order: payment.orderId },
      client: { email: form.correo, firstName: form.nombre, lastName: form.apellido },
      options: { lang: 'es', modal: true, installments: false, paymentMethods: methods, paymentMethodsSort: ['billetera'] },
    });
    instance.culqi = () => {
      if (instance.order) { setError(''); }
      else if (instance.error) setError('No se completó la prueba de pago. Inténtalo nuevamente.');
    };
    checkout.current = instance;
    instance.open();
  }

  return <div className="confirmation-disclaimer" role="status" style={{ display: 'block' }}>
    <strong>Pago de prueba de la tarifa: S/ {(payment.amountCents / 100).toFixed(2)}</strong>
    <p>{status === 'PAGADA_PRUEBA' ? 'Pago de prueba confirmado por Culqi. No se cobró dinero real.' : status === 'VENCIDA' ? 'La orden de prueba venció.' : 'Pendiente de pago de prueba. No se cobrará dinero real.'}</p>
    {status === 'PENDIENTE' && <button type="button" className="btn btn-primary" disabled={!ready} onClick={openCheckout}>Abrir Culqi de prueba</button>}
    {error && <p role="alert">{error}</p>}
    <p>Esta prueba usa billeteras móviles y no reserva disponibilidad real.</p>
  </div>;
}
