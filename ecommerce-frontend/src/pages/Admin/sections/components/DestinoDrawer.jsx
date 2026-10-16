import { createPortal } from 'react-dom';
import { X, Check, Plus } from 'lucide-react';

export default function DestinoDrawer({
  modalOpen,
  setModalOpen,
  editingId,
  form,
  setForm,
  handleSubmit,
  saving,
}) {
  if (!modalOpen) return null;

  return createPortal(
    <>
      <div className="admin-drawer-backdrop" onClick={() => setModalOpen(false)} />

      <form
        className="admin-drawer"
        onSubmit={handleSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dest-drawer-title"
      >
        <div className="admin-drawer__header">
          <div className="admin-drawer__title">
            <div className="admin-drawer__title-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h3 id="dest-drawer-title">{editingId ? 'Editar Destino' : 'Nuevo Destino'}</h3>
              <p>{editingId ? 'Modifica los datos en MySQL' : 'Agrega un destino turístico'}</p>
            </div>
          </div>
          <button className="admin-drawer__close" type="button" onClick={() => setModalOpen(false)} title="Cerrar panel">
            <X size={18} />
          </button>
        </div>

        <div className="admin-drawer__body">
          <div className="admin-drawer__section">
            <span className="admin-drawer__section-label">Información básica</span>
            <div className="admin-drawer__section-line" />
          </div>

          <div className="admin-drawer__row">
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Nombre del Destino<span>*</span></label>
              <input
                type="text"
                className="form-input"
                required
                autoFocus
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej. Abancay"
              />
            </div>
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Provincia</label>
              <input
                type="text"
                className="form-input"
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                placeholder="Ej. Abancay"
              />
            </div>
          </div>

          <div className="admin-drawer__row">
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Altitud</label>
              <input
                type="text"
                className="form-input"
                value={form.altitude}
                onChange={(e) => setForm({ ...form, altitude: e.target.value })}
                placeholder="Ej. 2,377 m.s.n.m."
              />
            </div>
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Clima</label>
              <input
                type="text"
                className="form-input"
                value={form.climate}
                onChange={(e) => setForm({ ...form, climate: e.target.value })}
                placeholder="Ej. Templado"
              />
            </div>
          </div>

          <div className="admin-drawer__field">
            <label className="admin-drawer__label">Atractivos principales</label>
            <input
              type="text"
              className="form-input"
              value={form.highlightsStr}
              onChange={(e) => setForm({ ...form, highlightsStr: e.target.value })}
              placeholder="Santuario Ampay, Cañón Pachachaca, Monolito Saywite"
            />
            <div className="admin-drawer__hint">Separa cada atractivo con una coma</div>
          </div>

          <div className="admin-drawer__field">
            <label className="admin-drawer__label">Descripción<span>*</span></label>
            <textarea
              className="form-input"
              rows="4"
              required
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Reseña histórica, geográfica y atractivos del lugar..."
              style={{ resize: 'vertical', minHeight: 90 }}
            />
          </div>

          <div className="admin-drawer__section">
            <span className="admin-drawer__section-label">Imagen</span>
            <div className="admin-drawer__section-line" />
          </div>

          <div className="admin-drawer__field">
            <label className="admin-drawer__label">URL de la Imagen<span>*</span></label>
            <input
              type="url"
              className="form-input"
              required
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              placeholder="https://images.unsplash.com/photo-..."
            />
            {form.image && (
              <div className="admin-drawer__img-preview">
                <img src={form.image} alt="Vista previa" onError={(e) => { e.target.style.display = 'none'; }} />
                <div className="admin-drawer__img-preview-label">VISTA PREVIA</div>
              </div>
            )}
          </div>
        </div>

        <div className="admin-drawer__footer">
          <button type="button" className="btn-cancel" onClick={() => setModalOpen(false)}>
            Cancelar
          </button>
          <button type="submit" className="btn-save" disabled={saving}>
            {saving ? (
              <>
                <div className="admin-save-spinner" /> Guardando…
              </>
            ) : (
              <>
                {editingId ? <Check size={14} /> : <Plus size={14} />}
                {editingId ? ' Actualizar destino' : ' Crear destino'}
              </>
            )}
          </button>
        </div>
      </form>
    </>,
    document.body
  );
}
