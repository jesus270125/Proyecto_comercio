export const initialForm = {
  nombre: '',
  apellido: '',
  correo: '',
  telefono: '',
  llegada: '',
  salida: '',
  personas: '2',
  observaciones: '',
};

export function validateForm(form) {
  const errors = {};
  if (!form.nombre.trim()) errors.nombre = 'El nombre es obligatorio';
  if (!form.apellido.trim()) errors.apellido = 'El apellido es obligatorio';
  if (!form.correo.trim()) errors.correo = 'El correo es obligatorio';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) errors.correo = 'Correo no válido';
  if (!form.telefono.trim()) errors.telefono = 'El teléfono es obligatorio';
  if (!form.llegada) errors.llegada = 'Selecciona la fecha de llegada';
  if (!form.salida) errors.salida = 'Selecciona la fecha de salida';
  if (form.llegada && form.salida && form.salida <= form.llegada)
    errors.salida = 'La salida debe ser después de la llegada';
  return errors;
}
