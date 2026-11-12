export default function DetallesAdicionales({ form, setForm, tipo }) {
  const fields = tipo === 'experiencia'
    ? [['district', 'Distrito'], ['groupSize', 'Tamaño del grupo'], ['difficulty', 'Dificultad']]
    : [['district', 'Distrito'], ['address', 'Dirección']];
  const lists = tipo === 'experiencia'
    ? [['includes', 'Qué incluye (uno por línea)'], ['excludes', 'Qué no incluye (uno por línea)'], ['tags', 'Etiquetas (una por línea)']]
    : [['amenities', 'Servicios y comodidades (uno por línea)']];
  const updateDay = (index, field, value) => setForm({ ...form, itinerary: form.itinerary.map((day, i) => i === index ? { ...day, [field]: value } : day) });

  return <>
    <div className="admin-drawer__section"><span className="admin-drawer__section-label">Detalles adicionales</span><div className="admin-drawer__section-line" /></div>
    {fields.map(([key, label]) => <label className="admin-drawer__field" key={key}>
      <span className="admin-drawer__label">{label}</span>
      <input className="form-input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </label>)}
    {tipo === 'hospedaje' && <label className="admin-drawer__field">
      <span className="admin-drawer__label">Número de habitaciones</span>
      <input type="number" min="1" step="1" className="form-input" value={form.rooms} onChange={e => setForm({ ...form, rooms: e.target.value })} />
    </label>}
    {tipo === 'experiencia' && <label className="admin-drawer__field">
      <span className="admin-drawer__label">Descripción completa</span>
      <textarea className="form-input" rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe la experiencia con más detalle" />
    </label>}
    {lists.map(([key, label]) => <label className="admin-drawer__field" key={key}>
      <span className="admin-drawer__label">{label}</span>
      <textarea className="form-input" rows="3" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </label>)}
    {tipo === 'experiencia' && <div className="admin-drawer__field">
      <span className="admin-drawer__label">Itinerario</span>
      {form.itinerary.map((day, index) => <div className="admin-drawer__field" key={index}>
        <strong>Día {index + 1}</strong>
        <input className="form-input" aria-label={`Título del día ${index + 1}`} placeholder="Título" value={day.title || ''} onChange={e => updateDay(index, 'title', e.target.value)} />
        <textarea className="form-input" aria-label={`Descripción del día ${index + 1}`} placeholder="Descripción" value={day.description || ''} onChange={e => updateDay(index, 'description', e.target.value)} />
        <button type="button" className="btn-cancel" onClick={() => setForm({ ...form, itinerary: form.itinerary.filter((_, i) => i !== index) })}>Quitar día</button>
      </div>)}
      <button type="button" className="btn-cancel" onClick={() => setForm({ ...form, itinerary: [...form.itinerary, { title: '', description: '' }] })}>+ Añadir día</button>
    </div>}
  </>;
}
