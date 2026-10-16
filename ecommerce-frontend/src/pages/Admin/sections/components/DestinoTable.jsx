import { MapPin } from 'lucide-react';

export default function DestinoTable({
  filtered,
  search,
  openEditModal,
  handleTogglePublish,
  handleDelete,
}) {
  if (filtered.length === 0) {
    return (
      <div className="admin-empty">
        <div className="admin-empty__icon"><MapPin size={32} strokeWidth={1.5} /></div>
        <p>Sin destinos para "{search}"</p>
      </div>
    );
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th style={{ width: 80 }}>Imagen</th>
            <th>Destino</th>
            <th>Provincia</th>
            <th>Altitud</th>
            <th>Clima</th>
            <th>Atractivos</th>
            <th>Estado</th>
            <th style={{ textAlign: 'right' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((d) => {
            const name = d.nombre || d.name;
            const highlights = Array.isArray(d.highlights)
              ? d.highlights
              : (typeof d.highlights === 'string' ? JSON.parse(d.highlights) : []);

            return (
              <tr key={d.id}>
                <td>
                  <img
                    src={d.image}
                    alt={name}
                    style={{
                      width: 64,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 'var(--radius)',
                      display: 'block',
                      border: '1px solid var(--gray-200)',
                    }}
                    loading="lazy"
                  />
                </td>
                <td>
                  <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>{name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {d.description}
                  </div>
                </td>
                <td>
                  <span className="badge badge-green">{d.province || 'Apurímac'}</span>
                </td>
                <td style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{d.altitude || '—'}</td>
                <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{d.climate || '—'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', maxWidth: 200 }}>
                    {highlights.slice(0, 3).map((h, i) => (
                      <span key={i} style={{ background: 'var(--gray-100)', padding: '0.15rem 0.4rem', borderRadius: 3, fontSize: '0.7rem' }}>
                        {h}
                      </span>
                    ))}
                    {highlights.length > 3 && (
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>+{highlights.length - 3}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${d.publicado !== false ? 'status-confirmed' : 'status-cancelled'}`}>
                    {d.publicado !== false ? 'Publicado' : 'Oculto'}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                    <button
                      className="btn-action-edit"
                      onClick={() => openEditModal(d)}
                      title="Editar destino e imagen"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Editar
                    </button>
                    <button
                      className={`btn-action-toggle ${d.publicado !== false ? 'btn-action-toggle--hide' : 'btn-action-toggle--show'}`}
                      onClick={() => handleTogglePublish(d.id)}
                      title={d.publicado !== false ? 'Ocultar del portal público' : 'Publicar en el portal web'}
                    >
                      {d.publicado !== false ? (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          Ocultar
                        </>
                      ) : (
                        <>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          Publicar
                        </>
                      )}
                    </button>
                    <button
                      className="btn-action-delete"
                      onClick={() => handleDelete(d.id)}
                      title="Eliminar permanentemente de MySQL"
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
