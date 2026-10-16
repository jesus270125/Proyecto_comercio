import { createPortal } from 'react-dom';
import { X, Check, Plus } from 'lucide-react';

export default function ExperienciaDrawer({
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
        aria-labelledby="exp-drawer-title"
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
              <h3 id="exp-drawer-title">{editingId ? 'Editar Experiencia' : 'Nueva Experiencia'}</h3>
              <p>{editingId ? 'Modifica los datos en MySQL' : 'Agrega una experiencia turística'}</p>
            </div>
          </div>
          <button className="admin-drawer__close" type="button" onClick={() => setModalOpen(false)} title="Cerrar panel">
            <X size={18} />
          </button>
        </div>

        <div className="admin-drawer__body">
          <div className="admin-drawer__section">
            <span className="admin-drawer__section-label">Datos principales</span>
            <div className="admin-drawer__section-line" />
          </div>

          <div className="admin-drawer__field">
            <label className="admin-drawer__label">Nombre<span>*</span></label>
            <input
              type="text"
              className="form-input"
              required
              autoFocus
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Trek a la Laguna de Pacucha"
            />
          </div>

          <div className="admin-drawer__row">
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Categoría<span>*</span></label>
              <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="Aventura">Aventura</option>
                <option value="Cultural">Cultural</option>
                <option value="Naturaleza">Naturaleza</option>
                <option value="Vivencial">Vivencial</option>
                <option value="Gastronómica">Gastronómica</option>
              </select>
            </div>
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Precio (S/)<span>*</span></label>
              <input
                type="number"
                className="form-input"
                required
                min="1"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="Ej. 150"
              />
            </div>
          </div>

          <div className="admin-drawer__row">
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Ubicación</label>
              <input
                type="text"
                className="form-input"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Ej. Andahuaylas"
              />
            </div>
            <div className="admin-drawer__field">
              <label className="admin-drawer__label">Duración</label>
              <input
                type="text"
                className="form-input"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                placeholder="Ej. 1 día / 4 días"
              />
            </div>
          </div>

          <div className="admin-drawer__field">
            <label className="admin-drawer__label">Descripción corta<span>*</span></label>
            <textarea
              className="form-input"
              rows="3"
              required
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              placeholder="Breve resumen de la experiencia para el catálogo..."
              style={{ resize: 'vertical', minHeight: 80 }}
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
                {editingId ? ' Actualizar experiencia' : ' Guardar experiencia'}
              </>
            )}
          </button>
        </div>
      </form>
    </>,
    document.body
  );
}
