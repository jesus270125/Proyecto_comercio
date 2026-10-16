import React, { useState } from "react";

function GestionCarreras({ carreras, setCarreras, estudiantes }) {
  const [nuevaCarrera, setNuevaCarrera] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nuevaCarrera.trim()) {
      alert("Por favor ingrese el nombre de la carrera");
      return;
    }

    if (editandoIndex !== null) {
      // Editar
      const actualizadas = [...carreras];
      
      // Validar si la carrera vieja estaba en uso
      const carreraVieja = carreras[editandoIndex];
      const enUso = estudiantes.some(e => e.carrera === carreraVieja);
      
      if (enUso && actualizadas[editandoIndex] !== nuevaCarrera.trim()) {
        alert("No se puede renombrar esta carrera porque hay estudiantes registrados en ella. Para mantener la consistencia, cambie primero la carrera de esos estudiantes.");
        return;
      }

      actualizadas[editandoIndex] = nuevaCarrera.trim();
      setCarreras(actualizadas);
      setEditandoIndex(null);
    } else {
      // Crear
      if (carreras.includes(nuevaCarrera.trim())) {
        alert("Esta carrera ya existe");
        return;
      }
      setCarreras([...carreras, nuevaCarrera.trim()]);
    }
    
    setNuevaCarrera("");
  };

  const iniciarEdicion = (index) => {
    setNuevaCarrera(carreras[index]);
    setEditandoIndex(index);
  };

  const cancelarEdicion = () => {
    setNuevaCarrera("");
    setEditandoIndex(null);
  };

  const eliminarCarrera = (index) => {
    const carreraEliminar = carreras[index];
    
    // Validar que no haya estudiantes usando esta carrera
    const tieneEstudiantes = estudiantes.some(est => est.carrera === carreraEliminar);
    
    if (tieneEstudiantes) {
      alert(`No se puede eliminar "${carreraEliminar}" porque tiene estudiantes asociados.`);
      return;
    }

    const confirmar = window.confirm(`¿Está seguro de eliminar la carrera "${carreraEliminar}"?`);
    if (confirmar) {
      const nuevas = carreras.filter((_, i) => i !== index);
      setCarreras(nuevas);
      if (editandoIndex === index) {
        cancelarEdicion();
      }
    }
  };

  return (
    <div className="dashboard-sections">
      <div className="card">
        <h2>{editandoIndex !== null ? "Editar Carrera" : "Agregar Carrera"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la carrera:</label>
            <input
              type="text"
              value={nuevaCarrera}
              onChange={(e) => setNuevaCarrera(e.target.value)}
              placeholder="Ej: Arquitectura"
            />
          </div>
          <div className="action-buttons">
            <button type="submit">
              {editandoIndex !== null ? "Actualizar" : "Guardar"}
            </button>
            {editandoIndex !== null && (
              <button type="button" className="btn-secondary" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Lista de Carreras</h2>
        {carreras.length === 0 ? (
          <p>No hay carreras registradas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th style={{ width: "50px" }}>N°</th>
                <th>Carrera</th>
                <th style={{ width: "150px" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {carreras.map((c, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{c}</td>
                  <td>
                    <button 
                      style={{ marginRight: "8px", padding: "4px 8px" }} 
                      onClick={() => iniciarEdicion(index)}
                    >
                      Editar
                    </button>
                    <button 
                      className="btn-danger" 
                      style={{ padding: "4px 8px" }}
                      onClick={() => eliminarCarrera(index)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default GestionCarreras;
