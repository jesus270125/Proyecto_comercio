import { useState, useMemo, useEffect } from 'react';
import { adminService } from '../../../services/api';
import { Map } from 'lucide-react';
import ExperienciaDrawer from './components/ExperienciaDrawer';

const IcSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const CATS = ['Todas', 'Aventura', 'Cultural', 'Naturaleza', 'Vivencial', 'Gastronómica'];

const defaultExpState = {
  nombre: '',
  shortDescription: '',
  description: '',
  category: 'Aventura',
  location: 'Abancay',
  duration: '1 día',
  difficulty: 'Media',
  groupSize: '', district: '', gallery: '', includes: '', excludes: '', tags: '', itinerary: [],
  price: '',
  image: '',
  featured: false,
};

export default function AdminExperiencias({ experiences, setExperiences }) {
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(defaultExpState);

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
    return experiences.filter((e) => {
      const q = search.toLowerCase();
      const matchQ = !q || (e.name || e.nombre || '').toLowerCase().includes(q) || (e.location || '').toLowerCase().includes(q);
      const matchCat = cat === 'Todas' || e.category === cat;
      return matchQ && matchCat;
    });
  }, [experiences, search, cat]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(defaultExpState);
    setModalOpen(true);
  };

  const openEditModal = (exp) => {
    setEditingId(exp.id);
    setForm({
      nombre: exp.nombre || exp.name || '',
      shortDescription: exp.shortDescription || '',
      description: exp.description || exp.shortDescription || '',
      category: exp.category || 'Aventura',
      location: exp.location || 'Abancay',
      duration: exp.duration || '1 día',
      difficulty: exp.difficulty || 'Media',
      district: exp.district || '', groupSize: exp.groupSize || '',
      gallery: (exp.gallery || []).join('\n'), includes: (exp.includes || []).join('\n'),
      excludes: (exp.excludes || []).join('\n'), tags: (exp.tags || []).join('\n'),
      itinerary: Array.isArray(exp.itinerary) ? exp.itinerary.map(day => ({ ...day })) : [],
      price: exp.price !== undefined ? exp.price : '',
      image: exp.image || '',
      featured: exp.featured || false,
    });
    setModalOpen(true);
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await adminService.togglePublishExperience(id);
      setExperiences((prev) =>
        prev.map((e) => (e.id === id ? { ...e, publicado: res.data.publicado } : e))
      );
    } catch (err) {
      alert('Error al cambiar publicación: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta experiencia? Esta acción se guardará en MySQL.')) return;
    try {
      await adminService.deleteExperience(id);
      setExperiences((prev) => prev.filter((e) => e.id !== id));
    } catch (err) {
      alert('Error al eliminar experiencia: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.price || !form.shortDescription || !form.image) {
      alert('Por favor completa nombre, precio, descripción e imagen.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        description: form.description || form.shortDescription,
        price: parseFloat(form.price),
        ...Object.fromEntries(['gallery', 'includes', 'excludes', 'tags'].map(key => [key, form[key].split('\n').map(value => value.trim()).filter(Boolean)])),
        itinerary: form.itinerary.filter(day => day.title.trim() || day.description.trim()).map((day, index) => ({ day: index + 1, title: day.title.trim(), description: day.description.trim() })),
      };

      if (editingId) {
        // Actualizar existente
        const res = await adminService.updateExperience(editingId, payload);
        const updated = {
          ...res.data,
          name: res.data.nombre,
          price: parseFloat(res.data.price),
        };
        setExperiences((prev) =>
          prev.map((e) => (e.id === editingId ? { ...e, ...updated } : e))
        );
      } else {
        // Crear nuevo
        const res = await adminService.createExperience(payload);
        const created = {
          ...res.data,
          name: res.data.nombre,
          reviews: 0,
          price: parseFloat(res.data.price),
          rating: 0,
        };
        setExperiences((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setForm(defaultExpState);
    } catch (err) {
      alert('Error al guardar experiencia: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div className="admin-page-header__top">
          <div>
            <h1>Experiencias</h1>
            <p>Catálogo de experiencias turísticas persistente en MySQL — {experiences.length} en total</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: 'var(--text-sm)' }}
            onClick={openCreateModal}
            id="btn-nueva-experiencia"
          >
            + Nueva experiencia
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filter-row">
        <div className="admin-search">
          <span className="admin-search__icon"><IcSearch /></span>
          <input
            type="search"
            placeholder="Buscar experiencia…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="exp-search"
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {CATS.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`filter-pill ${cat === c ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-panel">
        {filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty__icon"><Map size={32} strokeWidth={1.5} /></div>
            <p>Sin resultados para "{search}"</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 64 }}>Imagen</th>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Ubicación</th>
                  <th>Duración</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th style={{ textAlign: 'right' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <img
                        src={e.image}
                        alt={e.name || e.nombre}
                        style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 'var(--radius)', display: 'block', border: '1px solid var(--gray-200)' }}
                        loading="lazy"
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', maxWidth: 200 }}>{e.name || e.nombre}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{e.duration}</div>
                    </td>
                    <td>
                      <span className="badge badge-green">{e.category}</span>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{e.location}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{e.duration}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>S/ {e.price}</td>
                    <td>
                      <span className={`status-badge ${e.publicado !== false ? 'status-confirmed' : 'status-cancelled'}`}>
                        {e.publicado !== false ? 'Publicada' : 'Oculta'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          className="btn-action-edit"
                          onClick={() => openEditModal(e)}
                          title="Editar experiencia e imagen"
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                          Editar
                        </button>
                        <button
                          className={`btn-action-toggle ${e.publicado !== false ? 'btn-action-toggle--hide' : 'btn-action-toggle--show'}`}
                          onClick={() => handleTogglePublish(e.id)}
                          title={e.publicado !== false ? 'Ocultar de la vista pública' : 'Publicar en el portal web'}
                        >
                          {e.publicado !== false ? (
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
                          onClick={() => handleDelete(e.id)}
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

      {/* Drawer Crear / Editar Experiencia */}
      <ExperienciaDrawer
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

