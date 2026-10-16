/* ── AdminDashboard ── */
import { useMemo } from 'react';
import { ClipboardList } from 'lucide-react';

const IconTrend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

export default function AdminDashboard({ reservas, experiences, accommodations }) {
  const confirmed = reservas.filter(r => r.estado === 'confirmada').length;
  const pending   = reservas.filter(r => r.estado === 'pendiente').length;
  const totalIngresos = reservas
    .filter(r => r.estado !== 'cancelada')
    .reduce((acc, r) => acc + (Number(r.total) || 0), 0);

  const recent = [...reservas].reverse().slice(0, 6);

  const popularExp = useMemo(() => {
    const count = {};
    reservas.forEach(r => {
      if (r.tipo === 'experiencia') count[r.nombreItem] = (count[r.nombreItem] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [reservas]);

  const stats = [
    {
      label: 'Reservas totales',
      value: reservas.length,
      icon: <IcCalendar />, cls: 'green',
      sub: `${confirmed} confirmadas`,
    },
    {
      label: 'Ingresos proyectados',
      value: `S/ ${totalIngresos.toLocaleString('es-PE')}`,
      icon: <IcMoney />, cls: 'earth',
      sub: 'Reservas no canceladas',
    },
    {
      label: 'Experiencias activas',
      value: experiences.length,
      icon: <IcMap />, cls: 'olive',
      sub: 'En catálogo',
    },
    {
      label: 'Hospedajes activos',
      value: accommodations.length,
      icon: <IcHome />, cls: 'cream',
      sub: 'Disponibles',
    },
  ];

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <h1>Dashboard</h1>
        <p>Resumen general de la plataforma Apurímac Turismo</p>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        {stats.map((s) => (
          <div className="admin-stat-card" key={s.label}>
            <div className="admin-stat-card__header">
              <span className="admin-stat-card__label">{s.label}</span>
              <span className={`admin-stat-card__icon admin-stat-card__icon--${s.cls}`}>{s.icon}</span>
            </div>
            <div className="admin-stat-card__value">{s.value}</div>
            <div className="admin-stat-card__sub">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="admin-grid-2" style={{ gap: 'var(--space-6)' }}>
        {/* Recent reservas */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <span className="admin-panel__title">Últimas reservas</span>
          </div>
          {recent.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty__icon"><ClipboardList size={32} strokeWidth={1.5} /></div>
              <p>Aún no hay reservas registradas.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((r) => (
                    <tr key={r.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.id}</td>
                      <td style={{ fontWeight: 500 }}>{r.nombre} {r.apellido}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>S/ {Number(r.total || 0).toLocaleString('es-PE')}</td>
                      <td>
                        <span className={`status-badge status-${r.estado || 'pendiente'}`}>
                          {r.estado === 'confirmada' ? 'Confirmada' : r.estado === 'cancelada' ? 'Cancelada' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Experiencias populares */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <span className="admin-panel__title">Experiencias populares</span>
          </div>
          {popularExp.length === 0 ? (
            <div style={{ padding: 'var(--space-5)' }}>
              {experiences.slice(0, 5).map((e) => (
                <div className="admin-catalog-card" key={e.id}>
                  <img src={e.image} alt={e.name} className="admin-catalog-card__img" loading="lazy" />
                  <div className="admin-catalog-card__info">
                    <div className="admin-catalog-card__name">{e.name}</div>
                    <div className="admin-catalog-card__meta">{e.category} · {e.duration}</div>
                  </div>
                  <div className="admin-catalog-card__price">S/ {e.price}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-panel__body">
              {popularExp.map(([name, count]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-3) 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{name}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: 'var(--text-xs)', color: 'var(--green-700)', fontWeight: 600 }}>
                    <IconTrend /> {count} {count === 1 ? 'reserva' : 'reservas'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Estado */}
      <div className="admin-panel" style={{ marginTop: 'var(--space-6)' }}>
        <div className="admin-panel__header">
          <span className="admin-panel__title">Estado del sistema</span>
          <span className="status-badge status-confirmed">Operativo</span>
        </div>
        <div className="admin-panel__body">
          <div className="admin-grid-2" style={{ gap: 'var(--space-4)' }}>
            {[
              { label: 'Versión', value: 'V3.0 — Full Stack (REST API + MySQL)' },
              { label: 'Backend', value: 'Conectado (Node.js + Express en :4000)' },
              { label: 'Persistencia', value: 'MySQL 8.0 (Prisma ORM)' },
              { label: 'Autenticación', value: 'JWT + bcrypt (Roles ADMIN / USER)' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* mini icons */
function IcCalendar() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}
function IcMoney() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
}
function IcMap() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z"/></svg>;
}
function IcHome() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5v10a1 1 0 01-1 1H4a1 1 0 01-1-1z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
