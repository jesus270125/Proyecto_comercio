import { useState, useMemo, useEffect } from 'react';
import { adminService } from '../../../services/api';
import DestinoDrawer from './components/DestinoDrawer';
import DestinoTable from './components/DestinoTable';

const IcSearch = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const initialDestState = {
  nombre: '',
  province: '',
  description: '',
  image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  altitude: '2,400 m.s.n.m.',
  climate: 'Templado',
  highlightsStr: 'Centro histórico, Mirador natural, Gastronomía',
};

const PROVINCIAS = ['Todas', 'Abancay', 'Andahuaylas', 'Curahuasi', 'Choquequirao', 'Valle del Apurímac'];

export default function AdminDestinos({ destinations = [], setDestinations }) {
  const [search, setSearch] = useState('');
  const [filtroProvincia, setFiltroProvincia] = useState('Todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialDestState);

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
    return destinations.filter((d) => {
      const q = search.toLowerCase();
      const name = (d.nombre || d.name || '').toLowerCase();
      const prov = (d.province || '').toLowerCase();
      const desc = (d.description || '').toLowerCase();
      const matchSearch = !q || name.includes(q) || prov.includes(q) || desc.includes(q);
      const matchProv =
        filtroProvincia === 'Todas' ||
        name.includes(filtroProvincia.toLowerCase()) ||
        prov.includes(filtroProvincia.toLowerCase());
      return matchSearch && matchProv;
    });
  }, [destinations, search, filtroProvincia]);

  const openCreateModal = () => {
    setEditingId(null);
    setForm(initialDestState);
    setModalOpen(true);
  };

  const openEditModal = (dest) => {
    setEditingId(dest.id);
    const highlights = Array.isArray(dest.highlights)
      ? dest.highlights.join(', ')
      : (typeof dest.highlights === 'string' ? JSON.parse(dest.highlights).join(', ') : '');

    setForm({
      nombre: dest.nombre || dest.name || '',
      province: dest.province || '',
      description: dest.description || '',
      image: dest.image || '',
      altitude: dest.altitude || '',
      climate: dest.climate || '',
      highlightsStr: highlights,
    });
    setModalOpen(true);
  };

  const handleTogglePublish = async (id) => {
    try {
      const res = await adminService.togglePublishDestination(id);
      setDestinations((prev) =>
        prev.map((d) => (d.id === id ? { ...d, publicado: res.data.publicado } : d))
      );
    } catch (err) {
      alert('Error al cambiar visibilidad: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este destino? Esta acción se guardará en MySQL.')) return;
    try {
      await adminService.deleteDestination(id);
      setDestinations((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      alert('Error al eliminar destino: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.description.trim() || !form.image.trim()) {
      alert('Nombre, descripción e imagen son obligatorios.');
      return;
    }

    setSaving(true);
    const highlightsArr = form.highlightsStr
      ? form.highlightsStr.split(',').map((h) => h.trim()).filter(Boolean)
      : [];

    const payload = {
      nombre: form.nombre,
      province: form.province,
      description: form.description,
      image: form.image,
      altitude: form.altitude,
      climate: form.climate,
      highlights: highlightsArr,
    };

    try {
      if (editingId) {
        // Actualizar
        const res = await adminService.updateDestination(editingId, payload);
        const updated = {
          ...res.data,
          name: res.data.nombre,
        };
        setDestinations((prev) => prev.map((d) => (d.id === editingId ? updated : d)));
      } else {
        // Crear
        const res = await adminService.createDestination(payload);
        const created = {
          ...res.data,
          name: res.data.nombre,
        };
        setDestinations((prev) => [created, ...prev]);
      }
      setModalOpen(false);
      setForm(initialDestState);
    } catch (err) {
      alert('Error al guardar destino: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <div className="admin-page-header__top">
          <div>
            <h1>Destinos</h1>
            <p>Catálogo de destinos y ciudades de Apurímac persistente en MySQL — {destinations.length} en total</p>
          </div>
          <button
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.25rem', fontSize: 'var(--text-sm)' }}
            onClick={openCreateModal}
            id="btn-nuevo-destino"
          >
            + Nuevo destino
          </button>
        </div>
      </div>

      {/* Toolbar / Search & Quick Filters */}
      <div className="admin-filter-row">
        <div className="admin-search">
          <span className="admin-search__icon"><IcSearch /></span>
          <input
            type="search"
            placeholder="Buscar destino por ciudad, provincia…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            id="dest-search"
          />
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {PROVINCIAS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFiltroProvincia(p)}
              className={`filter-pill ${filtroProvincia === p ? 'active' : ''}`}
              style={{ fontSize: '0.75rem', padding: '0.4rem 1rem' }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="admin-panel">
        <DestinoTable
          filtered={filtered}
          search={search}
          openEditModal={openEditModal}
          handleTogglePublish={handleTogglePublish}
          handleDelete={handleDelete}
        />
      </div>

      {/* Drawer Crear / Editar Destino */}
      <DestinoDrawer
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

