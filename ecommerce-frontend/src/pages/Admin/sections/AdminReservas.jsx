import { useEffect, useMemo, useRef, useState } from 'react';
import { adminService } from '../../../services/api';
import { ClipboardList, Check, X } from 'lucide-react';

const ESTADOS = ['todas', 'confirmada', 'pendiente', 'cancelada'];
const ESTADOS_RESERVA = {
  confirmada: { label: 'Confirmada', style: 'confirmed' },
  pendiente: { label: 'Pendiente', style: 'pending' },
  cancelada: { label: 'Cancelada', style: 'cancelled' },
  completada: { label: 'Completada', style: 'confirmed' },
};
const ESTADOS_MERCADO_PAGO = {
  PENDIENTE: 'Pendiente',
  PAGADA_PRUEBA: 'Pagado',
  RECHAZADA: 'Rechazado',
  CANCELADA: 'Cancelado o vencido',
  REEMBOLSADA: 'Reembolsado',
};

function pagoMercadoPago(status) {
  return `Mercado Pago · ${ESTADOS_MERCADO_PAGO[status] || 'Estado por confirmar'} (prueba)`;
}

function EstadoReserva({ estado }) {
  const { label, style } = ESTADOS_RESERVA[estado] || ESTADOS_RESERVA.pendiente;
  return <span className={`status-badge status-${style}`}>{label}</span>;
}

const IcSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
);
const IcCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
);
const IcX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IcTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
);
const IcEye = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
);

function IzipayManual({ reservation, onSaved }) {
  const [link, setLink] = useState(reservation.izipayLink || '');
  const [reference, setReference] = useState(reservation.izipayReference || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const paid = Boolean(reservation.izipayPaidAt);
  const save = async (markPaid) => {
    if (markPaid && !window.confirm('¿Comprobaste en Izipay que esta operación corresponde a esta reserva y al importe indicado?')) return;
    setSaving(true); setError('');
    try {
      const result = await adminService.updateIzipay(reservation.id, { link: link.trim(), reference: reference.trim(), paid: markPaid });
      onSaved(result.data);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };
  return <div style={{ display: 'grid', gap: 8, borderTop: '1px solid var(--border)', paddingTop: 12 }}>
    <strong>Enlace Izipay · gestión manual</strong>
    <span>Reserva {reservation.codigo} · Tarifa a cobrar: S/ {Number(reservation.serviceFee || 0).toFixed(2)}</span>
    <span>Saldo a coordinar: S/ {Number(reservation.subtotal || 0).toFixed(2)}</span>
    <label htmlFor="izipay-link">Enlace individual de pago</label>
    <input id="izipay-link" type="url" value={link} disabled={paid} onChange={e => setLink(e.target.value)} placeholder="https://..." />
    {!paid && <button className="btn btn-outline btn-sm" disabled={saving || !link.trim()} onClick={() => save(false)}>Guardar enlace</button>}
    {reservation.izipayLink && !paid && <p>Comparte manualmente el enlace guardado con el cliente. Confirma el importe en Izipay antes de enviarlo.</p>}
    {reservation.izipayLink && <a href={reservation.izipayLink} target="_blank" rel="noopener noreferrer">Abrir enlace guardado</a>}
    <label htmlFor="izipay-reference">Referencia de operación en Izipay</label>
    <input id="izipay-reference" value={reference} disabled={paid} onChange={e => setReference(e.target.value)} placeholder="Referencia del pago" />
    {!paid && <button className="btn btn-primary btn-sm" disabled={saving || !reservation.izipayLink || !reference.trim() || link.trim() !== reservation.izipayLink} onClick={() => save(true)}>Registrar pago verificado</button>}
    {paid && <p>Pago registrado manualmente como verificado. Referencia: {reservation.izipayReference}.</p>}
    {error && <p role="alert">{error}</p>}
  </div>;
}

export default function AdminReservas({ reservas, setReservas }) {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [selectedId, setSelectedId] = useState(null);
  const selected = reservas.find(r => r.id === selectedId);
  const pendingPaymentId = selected?.mercadoPagoTest?.status === 'PENDIENTE' ? selected.id : null;

  useEffect(() => {
    let active = true;
    let timer;

    async function refreshPayments() {
      try {
        if (document.hidden) return;
        const { data } = await adminService.getReservations();
        if (!active || !Array.isArray(data)) return;
        const payments = new Map(data.map(r => [r.id, r.mercadoPagoTest]));

        // El webhook registra el pago. Si tarda, consulta la orden pendiente que se está mostrando.
        if (payments.get(pendingPaymentId)?.status === 'PENDIENTE') {
          try {
            const result = await adminService.refreshMercadoPagoTest(pendingPaymentId);
            payments.set(pendingPaymentId, result.data);
          } catch { /* Conserva el estado registrado y vuelve a intentar en el siguiente ciclo. */ }
        }

        if (active) {
          setReservas(current => current.map(r => {
            if (!payments.has(r.id)) return r;
            const payment = payments.get(r.id);
            return payment?.status === r.mercadoPagoTest?.status && payment?.amountCents === r.mercadoPagoTest?.amountCents
              ? r
              : { ...r, mercadoPagoTest: payment };
          }));
        }
      } catch { /* Una lectura fallida no reemplaza los datos que ya están en pantalla. */ }
      finally {
        if (active) timer = setTimeout(refreshPayments, 15000);
      }
    }

    if (pendingPaymentId === null) timer = setTimeout(refreshPayments, 15000);
    else refreshPayments();
    return () => { active = false; clearTimeout(timer); };
  }, [pendingPaymentId, setReservas]);

  const filtered = useMemo(() => {
    return reservas.filter((r) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        `${r.nombre} ${r.apellido}`.toLowerCase().includes(q) ||
        r.id?.toString().toLowerCase().includes(q) ||
        (r.codigo || '').toLowerCase().includes(q) ||
        (r.nombreItem || '').toLowerCase().includes(q);
      const matchEstado = filtroEstado === 'todas' || r.estado === filtroEstado;
      return matchSearch && matchEstado;
    });
  }, [reservas, search, filtroEstado]);

  const updateEstado = async (id, estado) => {
    try {
      await adminService.updateReservationStatus(id, estado);
      const withEstado = items => items.map(r => r.id === id ? { ...r, estado } : r);
      setReservas(withEstado);
      localStorage.setItem('apu_reservas', JSON.stringify(withEstado(reservas)));
    } catch (err) {
      alert('Error al actualizar estado en el servidor: ' + err.message);
    }
  };

  const deleteReserva = async (id) => {
    if (!window.confirm('¿Eliminar esta reserva permanentemente?')) return;
    try {
      await adminService.deleteReservation(id);
      const withoutReserva = items => items.filter(r => r.id !== id);
      setReservas(withoutReserva);
      localStorage.setItem('apu_reservas', JSON.stringify(withoutReserva(reservas)));
      setSelectedId(current => current === id ? null : current);
    } catch (err) {
      alert('Error al eliminar reserva en el servidor: ' + err.message);
    }
  };

  const totals = {
    confirmada: reservas.filter(r => r.estado === 'confirmada').length,
    pendiente:  reservas.filter(r => r.estado === 'pendiente').length,
    cancelada:  reservas.filter(r => r.estado === 'cancelada').length,
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div className="admin-page-header__top">
          <div>
            <h1>Gestión de Reservas</h1>
            <p>Administra todas las reservas realizadas a través de la plataforma</p>
          </div>
        </div>
      </div>

      {/* Summary pills */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-5)', flexWrap: 'wrap' }}>
        <span className="status-badge status-confirmed">{totals.confirmada} confirmadas</span>
        <span className="status-badge status-pending">{totals.pendiente} pendientes</span>
        <span className="status-badge status-cancelled">{totals.cancelada} canceladas</span>
        <span className="status-badge" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }}>{reservas.length} total</span>
      </div>

      {/* Filters */}
      <div className="admin-filter-row">
        <div className="admin-search">
          <span className="admin-search__icon"><IcSearch /></span>
          <input
            type="search"
            placeholder="Buscar por nombre, ID, servicio…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="reservas-search"
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {ESTADOS.map((e) => (
            <button
              key={e}
              onClick={() => setFiltroEstado(e)}
              className={`filter-pill ${filtroEstado === e ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
            >
              {e.charAt(0).toUpperCase() + e.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel">
          {filtered.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon"><ClipboardList size={32} strokeWidth={1.5} /></div>
              <p>{reservas.length === 0 ? 'Aún no se han registrado reservas.' : 'Sin resultados para esta búsqueda.'}</p>
              {reservas.length === 0 && (
                <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--text-light)' }}>
                  Las reservas aparecen aquí automáticamente cuando usuarios realizan una reserva en el sitio.
                </p>
              )}
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Fechas</th>
                    <th>Total</th>
                    <th>Pago</th>
                    <th>Estado de reserva</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      style={{ cursor: 'pointer', background: selectedId === r.id ? 'var(--green-50)' : '' }}
                      onClick={() => setSelectedId(r.id)}
                    >
                      <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{r.nombre} {r.apellido}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.correo}</div>
                      </td>
                      <td style={{ maxWidth: 160 }}>
                        <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 150 }}>{r.nombreItem}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{r.tipo}</div>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                        <div>{r.llegada}</div>
                        <div>→ {r.salida}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>S/ {Number(r.total || 0).toLocaleString('es-PE')}</td>
                      <td>{r.mercadoPagoTest ? pagoMercadoPago(r.mercadoPagoTest.status) : r.izipayTest ? (r.izipayTest.status === 'PAGADA_PRUEBA' ? 'Izipay pagada (prueba)' : `Izipay ${r.izipayTest.status.toLowerCase()} (prueba)`) : r.izipayPaidAt ? 'Verificado manualmente' : r.izipayLink ? 'Enlace pendiente' : r.pagoPrueba?.status === 'PAGADA_PRUEBA' ? 'Pagada (prueba)' : r.pagoPrueba?.status === 'VENCIDA' ? 'Vencida (prueba)' : r.pagoPrueba ? 'Pendiente (prueba)' : r.estadoPago === 'SIMULADO' ? 'Simulado' : 'Sin pago'}</td>
                      <td><EstadoReserva estado={r.estado} /></td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="admin-btn-icon" title="Ver detalle" aria-haspopup="dialog" onClick={() => setSelectedId(r.id)}>
                            <IcEye />
                          </button>
                          {r.estado !== 'confirmada' && (
                            <button className="admin-btn-icon admin-btn-icon--success" title="Confirmar" onClick={() => updateEstado(r.id, 'confirmada')}>
                              <IcCheck />
                            </button>
                          )}
                          {r.estado !== 'cancelada' && (
                            <button className="admin-btn-icon admin-btn-icon--danger" title="Cancelar" onClick={() => updateEstado(r.id, 'cancelada')}>
                              <IcX />
                            </button>
                          )}
                          <button className="admin-btn-icon admin-btn-icon--danger" title="Eliminar" onClick={() => deleteReserva(r.id)}>
                            <IcTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      {selected && (
        <ReservaDetalle
          key={selected.id}
          reservation={selected}
          onClose={() => setSelectedId(null)}
          onUpdateEstado={updateEstado}
          onPaymentChange={data => setReservas(current => current.map(r => r.id === selected.id ? { ...r, ...data } : r))}
        />
      )}
    </div>
  );
}

function ReservaDetalle({ reservation, onClose, onUpdateEstado, onPaymentChange }) {
  const dialogRef = useRef(null);
  const { mercadoPagoTest, izipayTest, pagoPrueba } = reservation;

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  const close = () => {
    dialogRef.current.close();
    onClose();
  };

  const refreshIzipay = async () => {
    try {
      const { data } = await adminService.refreshIzipayTest(reservation.id);
      onPaymentChange({ izipayTest: data });
    } catch (err) {
      alert('No se pudo consultar Izipay: ' + err.message);
    }
  };

  let paymentLabel = 'Sin pago registrado';
  if (mercadoPagoTest) paymentLabel = pagoMercadoPago(mercadoPagoTest.status);
  else if (reservation.izipayPaidAt) paymentLabel = 'Verificado manualmente';
  else if (reservation.izipayLink) paymentLabel = 'Enlace pendiente';
  else if (pagoPrueba?.status === 'PAGADA_PRUEBA') paymentLabel = 'Prueba pagada — sin cobro real';
  else if (pagoPrueba?.status === 'VENCIDA') paymentLabel = 'Prueba vencida';
  else if (pagoPrueba) paymentLabel = 'Pago de prueba pendiente';
  else if (reservation.estadoPago === 'SIMULADO') paymentLabel = 'Simulado — sin cobro real';

  const testPayment = mercadoPagoTest || pagoPrueba;

  return (
    <dialog
      ref={dialogRef}
      className="admin-reservation-dialog admin-panel"
      aria-labelledby="admin-reservation-title"
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="admin-reservation-dialog__card">
        <header className="admin-panel__header">
          <div>
            <h2 id="admin-reservation-title" className="admin-panel__title">Detalle de la reserva</h2>
            <span className="admin-reservation-dialog__code">{reservation.codigo}</span>
          </div>
          <button type="button" className="admin-btn-icon" onClick={close} aria-label="Cerrar detalle"><IcX /></button>
        </header>
        <div className="admin-panel__body">
          <dl className="admin-reservation-dialog__data">
            <div>
              <dt>Cliente</dt>
              <dd><strong>{reservation.nombre} {reservation.apellido}</strong></dd>
              <dd>{reservation.correo}</dd>
              <dd>{reservation.telefono}</dd>
            </div>
            <div>
              <dt>Servicio</dt>
              <dd><strong>{reservation.nombreItem}</strong></dd>
              <dd>{reservation.tipo}</dd>
            </div>
            <div>
              <dt>Fechas</dt>
              <dd>Llegada: <strong>{reservation.llegada}</strong></dd>
              <dd>Salida: <strong>{reservation.salida}</strong></dd>
              <dd>Personas: <strong>{reservation.personas}</strong></dd>
            </div>
            <div>
              <dt>Estado de reserva</dt>
              <dd><EstadoReserva estado={reservation.estado} /></dd>
            </div>
            {reservation.observaciones && (
              <div className="admin-reservation-dialog__notes">
                <dt>Notas</dt>
                <dd>{reservation.observaciones}</dd>
              </div>
            )}
          </dl>

          <dl className="admin-reservation-dialog__payment">
            <div>
              <dt>Pago</dt>
              <dd><strong role="status">{paymentLabel}</strong></dd>
            </div>
            {testPayment && (
              <div>
                <dt>Tarifa de prueba</dt>
                <dd><strong>S/ {(testPayment.amountCents / 100).toFixed(2)}</strong></dd>
              </div>
            )}
            <div>
              <dt>Total de la reserva</dt>
              <dd><strong>S/ {Number(reservation.total || 0).toFixed(2)}</strong></dd>
            </div>
          </dl>

          {izipayTest && (
            <div>
              <p>Estado Izipay de prueba: <strong>{izipayTest.status}</strong> · S/ {(izipayTest.amountCents / 100).toFixed(2)}</p>
              <button type="button" className="btn btn-outline btn-sm" onClick={refreshIzipay}>Consultar a Izipay</button>
            </div>
          )}
          {!izipayTest && !mercadoPagoTest && <IzipayManual reservation={reservation} onSaved={onPaymentChange} />}
        </div>
        <footer className="admin-reservation-dialog__actions">
          {reservation.estado !== 'cancelada' && (
            <button type="button" className="btn btn-outline btn-sm admin-reservation-dialog__cancel" onClick={() => onUpdateEstado(reservation.id, 'cancelada')}>
              <X size={14} /> Cancelar reserva
            </button>
          )}
          {reservation.estado !== 'confirmada' && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onUpdateEstado(reservation.id, 'confirmada')}>
              <Check size={14} /> Confirmar reserva
            </button>
          )}
        </footer>
      </div>
    </dialog>
  );
}
