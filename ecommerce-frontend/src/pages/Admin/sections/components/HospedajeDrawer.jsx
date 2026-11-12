import { createPortal } from 'react-dom';
import { useState } from 'react';
import ImagenesEditor from './ImagenesEditor';
import { X, Check, Plus } from 'lucide-react';
import DetallesAdicionales from './DetallesAdicionales';

export default function HospedajeDrawer({
  modalOpen,
  setModalOpen,
  editingId,
  form,
  setForm,
  handleSubmit,
  saving,
}) {
  const [uploading, setUploading] = useState(false);
  if (!modalOpen) return null;

  return createPortal(
    <>
      <div className="admin-drawer-backdrop" onClick={() => { if (!uploading) setModalOpen(false); }} />

      <form
        className="admin-drawer"
        onSubmit={event => { if (uploading) event.preventDefault(); else handleSubmit(event); }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="hosp-drawer-title"
      >
        <div className="admin-drawer__header">
          <div className="admin-drawer__title">
            <div className="admin-drawer__title-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h3 id="hosp-drawer-title">{editingId ? 'Editar Hospedaje' : 'Nuevo Hospedaje'}</h3>
              <p>{editingId ? 'Modifica los datos en MySQL' : 'Agrega un hospedaje al catálogo'}</p>
            </div>
          </div>
          <button className="admin-drawer__close" type="button" disabled={uploading} onClick={() => setModalOpen(false)} title="Cerrar panel">
            <X size={18} />
          </button>
        </div>

        <div className="admin-drawer__body">
          <div className="admin-drawer__section">
            <span className="admin-drawer__section-label">Datos del hospedaje</span>
            <div className="admin-drawer__section-line" />
          </div>

          <div className="admin-drawer__field">
            <label className="admin-drawer__label">Nombre del hospedaje<span>*</span></label>
            <input
              type="text"
              className="form-input"
              required
              autoFocus
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Casa Andina Apurímac"
            />
          </div>

          <div className="admin-drawer__row">
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Tipo<span>*</span></label>
              <select className="form-input" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="Casa Rural">Casa Rural</option>
                <option value="Lodge">Lodge</option>
                <option value="Albergue">Albergue</option>
                <option value="Hostal">Hostal</option>
                <option value="Hotel">Hotel</option>
              </select>
            </div>
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Precio/noche (S/)<span>*</span></label>
              <input
                type="number"
                className="form-input"
                required
                min="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ej. 120"
              />
            </div>
          </div>

          <div className="admin-drawer__row">
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Ubicación<span>*</span></label>
              <input
                type="text"
                className="form-input"
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ej. Abancay"
              />
            </div>
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Capacidad (personas)</label>
              <input
                type="number"
                className="form-input"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                placeholder="Ej. 4"
              />
            </div>
          </div>

          <div className="admin-drawer__field">
            <label className="admin-drawer__label">Descripción<span>*</span></label>
            <textarea
              className="form-input"
              rows="3"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Detalles del hospedaje y sus comodidades..."
              style={{ resize: 'vertical', minHeight: 80 }}
            />
          </div>

          <DetallesAdicionales form={form} setForm={setForm} tipo="hospedaje" />
          <ImagenesEditor form={form} setForm={setForm} onUploading={setUploading} />
        </div>

        <div className="admin-drawer__footer">
          <button type="button" className="btn-cancel" disabled={uploading} onClick={() => setModalOpen(false)}>
            Cancelar
          </button>
          <button type="submit" className="btn-save" disabled={saving || uploading}>
            {saving ? (
              <>
                <div className="admin-save-spinner" /> Guardando…
              </>
            ) : (
              <>
                {editingId ? <Check size={14} /> : <Plus size={14} />}
                {editingId ? ' Actualizar hospedaje' : ' Guardar hospedaje'}
              </>
            )}
          </button>
        </div>
      </form>
    </>,
    document.body
  );
}
