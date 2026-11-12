import { useState } from 'react';
import { ImagePlus, Images } from 'lucide-react';
import { uploadImage } from '../../../../services/api';

async function prepareImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error('Elige una imagen JPG, PNG o WebP.');
  if (file.size > 15 * 1024 * 1024) throw new Error('Cada imagen debe pesar como máximo 15 MB.');
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  try {
    if (bitmap.width * bitmap.height > 40_000_000) throw new Error('La imagen es demasiado grande. Usa una de hasta 40 megapíxeles.');
    const scale = Math.min(1, 1920 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('No se pudo procesar la imagen en este navegador.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.82));
    if (!blob || blob.type !== 'image/webp' || blob.size > 4 * 1024 * 1024) throw new Error('No se pudo optimizar esta imagen. Prueba con otra.');
    return blob;
  } finally { bitmap.close(); }
}

export default function ImagenesEditor({ form, setForm, onUploading }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const gallery = form.gallery.split('\n').map(value => value.trim()).filter(Boolean);

  async function selectImages(event, principal) {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setError('');
    setBusy(true);
    onUploading(true);
    try {
      for (const file of files) {
        const url = await uploadImage(await prepareImage(file));
        setForm(previous => principal
          ? { ...previous, image: url }
          : { ...previous, gallery: [previous.gallery.trim(), url].filter(Boolean).join('\n') });
      }
    } catch (err) {
      setError(err.message || 'No se pudo procesar la imagen.');
    } finally {
      setBusy(false);
      onUploading(false);
    }
  }

  return <>
    <div className="admin-drawer__section"><span className="admin-drawer__section-label">Imágenes</span><div className="admin-drawer__section-line" /></div>
    <div className="admin-drawer__field">
      <span className="admin-drawer__label">Imagen principal *</span>
      <label className={`admin-image-picker${busy ? ' admin-image-picker--disabled' : ''}`}>
        <input className="admin-image-picker__input" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={event => selectImages(event, true)} />
        <span className="admin-image-picker__icon"><ImagePlus size={19} aria-hidden="true" /></span>
        <span className="admin-image-picker__copy"><strong>{form.image ? 'Cambiar imagen principal' : 'Elegir imagen principal'}</strong><small>Selecciona una foto de tu equipo</small></span>
      </label>
      <span className="admin-drawer__hint">JPG, PNG o WebP, hasta 15 MB. La imagen se optimiza automáticamente.</span>
    </div>
    {form.image && <div className="admin-drawer__img-preview"><img src={form.image} alt="Vista previa de la imagen principal" /><div className="admin-drawer__img-preview-label">IMAGEN PRINCIPAL</div></div>}
    <div className="admin-drawer__field">
      <span className="admin-drawer__label">Añadir fotos a la galería</span>
      <label className={`admin-image-picker${busy ? ' admin-image-picker--disabled' : ''}`}>
        <input className="admin-image-picker__input" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy} onChange={event => selectImages(event, false)} />
        <span className="admin-image-picker__icon"><Images size={19} aria-hidden="true" /></span>
        <span className="admin-image-picker__copy"><strong>Agregar fotos a la galería</strong><small>Puedes seleccionar varias imágenes</small></span>
      </label>
    </div>
    {gallery.length > 0 && <div className="admin-images-grid">
      {gallery.map((url, index) => <div className="admin-images-item" key={`${url}-${index}`}>
        <img src={url} alt={`Foto adicional ${index + 1}`} />
        <button type="button" disabled={busy} onClick={() => setForm(previous => ({ ...previous, gallery: previous.gallery.split('\n').filter(Boolean).filter((_, i) => i !== index).join('\n') }))}>Quitar</button>
      </div>)}
    </div>}
    {busy && <p role="status">Optimizando y subiendo imágenes…</p>}
    {error && <p role="alert" className="admin-images-error">{error}</p>}
  </>;
}
