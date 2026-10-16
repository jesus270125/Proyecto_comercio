import { useState, useMemo, useEffect } from 'react';
import { adminService } from '../../../services/api';
import { Home } from 'lucide-react';
import HospedajeDrawer from './components/HospedajeDrawer';

const IcSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const TIPOS = ['Todos', 'Casa Rural', 'Lodge', 'Albergue', 'Hotel', 'Hostal'];

const defaultAccState = {
  nombre: '', description: '', type: 'Casa Rural', location: 'Abancay',
  district: 'Centro Histórico', price: '', capacity: '4', rooms: '2',
  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80', featured: false,
};

export default function AdminHospedajes({ accommodations, setAccommodations }) {
  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultAccState);

  // Bloquear scroll de la página principal mientras el panel está abierto
  useEffect(() => {
    if (modalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [modalOpen]);

  const filtered = useMemo(() => {
    return accommodations.filter((a) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        (a.name || a.nombre || '').toLowerCase().includes(q) ||
        (a.location || '').toLowerCase().includes(q) ||
        (a.type || '').toLowerCase().includes(q);
      const matchTipo = tipo === 'Todos' || a.type === tipo;
      return matchQ && matchTipo;
    });
  }, [accommodations, search, tipo]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultAccState);
    setModalOpen(true);
  };

  const openEditModal = (acc) => {
    setEditingId(acc.id);
    setForm({
      nombre: acc.nombre || acc.name || '',
      description: acc.description || '',
      type: acc.type || 'Casa Rural',
      location: acc.location || 'Abancay',
      district: acc.district || '',
      price: acc.price !== undefined ? acc.price : '',
      capacity: acc.capacity ? acc.capacity.toString() : '4',
      rooms: acc.rooms ? acc.rooms.toString() : '2',
      image: acc.image || '',
      featured: acc.featured || false,
    });
    setModalOpen(true);
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await adminService.togglePublishAccommodation(id);
      setAccommodations((prev) =>
        prev.map((a) => (a.id === id ? { ...a, publicado: res.data.publicado } : a))
      );
    } catch (err) {
      alert('Error al cambiar publicación: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este hospedaje? Esta acción se guardará en MySQL.')) return;
    try {
      await adminService.deleteAccommodation(id);
      setAccommodations((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      alert('Error al eliminar hospedaje: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.price || !form.description || !form.image) {
      alert('Por favor completa nombre, precio, descripción e imagen.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        capacity: parseInt(form.capacity) || 2,
        rooms: parseInt(form.rooms) || 1,
      };

      if (editingId) {
        // Actualizar existente
        const res = await adminService.updateAccommodation(editingId, payload);
        const updated = {
          ...res.data,
          name: res.data.nombre,
          price: parseFloat(res.data.price),
        };
        setAccommodations((prev) =>
          prev.map((a) => (a.id === editingId ? { ...a, ...updated } : a))
        );
      } else {
        // Crear nuevo
        const res = await adminService.createAccommodation(payload);
        const created = {
          ...res.data,
          name: res.data.nombre,
          reviews: 0,
          price: parseFloat(res.data.price),
          rating: 5.0,
        };
        setAccommodations((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setForm(defaultAccState);
    } catch (err) {
      alert('Error al guardar hospedaje: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div className="admin-page-header__top">
          <div>
            <h1>Hospedajes</h1>
            <p>Catálogo de alojamientos persistente en MySQL — {accommodations.length} en total</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: 'var(--text-sm)' }}
            onClick={openCreateModal}
            id="btn-nuevo-hospedaje"
          >
            + Nuevo hospedaje
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filter-row">
        <div className="admin-search">
          <span className="admin-search__icon"><IcSearch /></span>
          <input
            type="search"
            placeholder="Buscar hospedaje o ubicación…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="hosp-search"
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {TIPOS.map((t) => (
            <button
              key={t}
              onClick={() => setTipo(t)}
              className={`filter-pill ${tipo === t ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty__icon"><Home size={32} strokeWidth={1.5} /></div>
            <p>Sin resultados para "{search}"</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Imagen</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Ubicación</th>
                  <th>Capacidad</th>
                  <th>Precio/noche</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a.id}>
                    <td>
                      <img
                        src={a.image}
                        alt={a.name || a.nombre}
                        style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 'var(--radius)', display: 'block', border: '1px solid var(--gray-200)' }}
                        loading="lazy"
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', maxWidth: 200 }}>{a.name || a.nombre}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{a.district || a.location}</div>
                    </td>
                    <td>
                      <span className="badge badge-earth">{a.type}</span>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{a.location}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{a.capacity ? `${a.capacity} pers.` : '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>S/ {a.price}</td>
                    <td>
                      <span className={`status-badge ${a.publicado !== false ? 'status-confirmed' : 'status-cancelled'}`}>
                        {a.publicado !== false ? 'Publicado' : 'Oculto'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn-action-edit"
                          onClick={() => openEditModal(a)}
                          title="Editar hospedaje e imagen"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </button>
                        <button
                          className={`btn-action-toggle ${a.publicado !== false ? 'btn-action-toggle--hide' : 'btn-action-toggle--show'}`}
                          onClick={() => handleTogglePublish(a.id)}
                          title={a.publicado !== false ? 'Ocultar de la vista pública' : 'Publicar en el portal web'}
                        >
                          {a.publicado !== false ? (
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
                          onClick={() => handleDelete(a.id)}
                          title="Eliminar permanentemente de MySQL"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          Eliminar
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

      {/* Drawer Crear / Editar Hospedaje */}
      <HospedajeDrawer
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        editingId={editingId}
        form={form}
        setForm={setForm}
        handleSubmit={handleSubmit}
        saving={saving}
      />
    </div>
  );
}

