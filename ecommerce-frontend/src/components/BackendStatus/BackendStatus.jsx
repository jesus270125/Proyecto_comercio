import { useEffect, useState } from 'react';
import { API_BASE } from '../../services/api';
import './BackendStatus.css';

export default function BackendStatus() {
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let stopped = false;
    let timer;
    let controller;

    async function check() {
      controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(`${API_BASE}/health`, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok) throw new Error('Servicio no disponible');
        const data = await response.json();
        if (!stopped) setUnavailable(data.status !== 'ok');
      } catch {
        if (!stopped) setUnavailable(true);
      } finally {
        clearTimeout(timeout);
        if (!stopped) timer = setTimeout(check, 30000);
      }
    }

    check();
    return () => {
      stopped = true;
      clearTimeout(timer);
      controller?.abort();
    };
  }, []);

  return unavailable ? (
    <div className="backend-status" role="alert">
      No podemos conectarnos con el servidor. Algunas funciones no están disponibles. Estamos intentando reconectar.
    </div>
  ) : null;
}
