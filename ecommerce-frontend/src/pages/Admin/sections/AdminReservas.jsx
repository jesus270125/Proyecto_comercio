import { useState, useMemo } from 'react';
import { adminService } from '../../../services/api';
import { ClipboardList, Check, X } from 'lucide-react';

const ESTADOS = ['todas', 'confirmada', 'pendiente', 'cancelada'];

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

export default function AdminReservas({ reservas, setReservas }) {
  const [search, setSearch] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todas');
  const [selected, setSelected] = useState(null);

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
      const updated = reservas.map((r) =>
        r.id === id ? { ...r, estado } : r
      );
      setReservas(updated);
      localStorage.setItem('apu_reservas', JSON.stringify(updated));
      if (selected?.id === id) setSelected({ ...selected, estado });
    } catch (err) {
      alert('Error al actualizar estado en el servidor: ' + err.message);
    }
  };

  const deleteReserva = async (id) => {
    if (!window.confirm('¿Eliminar esta reserva permanentemente?')) return;
    try {
      await adminService.deleteReservation(id);
      const updated = reservas.filter((r) => r.id !== id);
      setReservas(updated);
      localStorage.setItem('apu_reservas', JSON.stringify(updated));
      if (selected?.id === id) setSelected(null);
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

      <div style={{ display: 'flex', gap: 'var(--space-5)', alignItems: 'flex-start' }}>
        {/* Table */}
        <div className="admin-panel" style={{ flex: 1, minWidth: 0 }}>
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
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      style={{ cursor: 'pointer', background: selected?.id === r.id ? 'var(--green-50)' : '' }}
                      onClick={() => setSelected(r)}
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
                      <td>
                        <span className={`status-badge status-${r.estado || 'pendiente'}`}>
                          {r.estado === 'confirmada' ? 'Confirmada' : r.estado === 'cancelada' ? 'Cancelada' : 'Pendiente'}
                        </span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button className="admin-btn-icon" title="Ver detalle" onClick={() => setSelected(r)}>
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

        {/* Detail panel */}
        {selected && (
          <div className="admin-panel" style={{ width: 300, flexShrink: 0, position: 'sticky', top: 80 }}>
            <div className="admin-panel__header">
              <span className="admin-panel__title">Detalle</span>
              <button className="admin-btn-icon" onClick={() => setSelected(null)} title="Cerrar"><IcX /></button>
            </div>
            <div className="admin-panel__body" style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>ID Reserva</div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginTop: 2 }}>{selected.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Cliente</div>
                  <div style={{ fontWeight: 600, marginTop: 2 }}>{selected.nombre} {selected.apellido}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{selected.correo}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{selected.telefono}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Servicio</div>
                  <div style={{ fontWeight: 500, marginTop: 2 }}>{selected.nombreItem}</div>
                  <div style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{selected.tipo}</div>
                </div>
                <div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Fechas</div>
                  <div style={{ marginTop: 2 }}>Llegada: <strong>{selected.llegada}</strong></div>
                  <div>Salida: <strong>{selected.salida}</strong></div>
                  <div>Personas: <strong>{selected.personas}</strong></div>
                </div>
                {selected.observaciones && (
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Notas</div>
                    <div style={{ marginTop: 2, color: 'var(--text-muted)', fontStyle: 'italic' }}>{selected.observaciones}</div>
                  </div>
                )}
                <div style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Total</span>
                    <strong style={{ color: 'var(--primary)', fontSize: 'var(--text-base)' }}>S/ {Number(selected.total || 0).toLocaleString('es-PE')}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {selected.estado !== 'confirmada' && (
                    <button className="btn btn-primary btn-sm w-full" onClick={() => updateEstado(selected.id, 'confirmada')}>
                      <Check size={14} /> Confirmar reserva
                    </button>
                  )}
                  {selected.estado !== 'cancelada' && (
                    <button
                      className="btn btn-outline btn-sm w-full"
                      style={{ color: '#dc2626', borderColor: '#dc2626' }}
                      onClick={() => updateEstado(selected.id, 'cancelada')}
                    >
                      <X size={14} /> Cancelar reserva
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
