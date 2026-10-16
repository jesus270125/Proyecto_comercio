import React, { useState } from "react";

function GestionEstudiantes({ estudiantes, setEstudiantes, carreras }) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [carrera, setCarrera] = useState("");
  const [editandoId, setEditandoId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nombre.trim() || !apellido.trim()) {
      alert("Por favor ingrese el nombre y apellido");
      return;
    }

    if (!carrera) {
      alert("Por favor seleccione una carrera de la lista");
      return;
    }

    if (editandoId !== null) {
      // UPDATE: Actualizar estudiante
      const estudiantesActualizados = estudiantes.map((est) =>
        est.id === editandoId
          ? { ...est, nombre: nombre.trim(), apellido: apellido.trim(), carrera }
          : est
      );

      setEstudiantes(estudiantesActualizados);
      alert(`Estudiante actualizado: ${nombre} ${apellido}`);
      setEditandoId(null);
    } else {
      // CREATE: Registrar estudiante
      const nuevoEstudiante = {
        id: Date.now(),
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        carrera,
      };

      setEstudiantes([...estudiantes, nuevoEstudiante]);
      alert(`Estudiante registrado: ${nombre} ${apellido}`);
    }

    setNombre("");
    setApellido("");
    setCarrera("");
  };

  const iniciarEdicion = (est) => {
    setNombre(est.nombre);
    setApellido(est.apellido);
    setCarrera(est.carrera);
    setEditandoId(est.id);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre("");
    setApellido("");
    setCarrera("");
  };

  const eliminarEstudiante = (id) => {
    const est = estudiantes.find((e) => e.id === id);
    if (!est) return;

    const confirmar = window.confirm(
      `¿Está seguro de eliminar al estudiante ${est.nombre} ${est.apellido}?`
    );

    if (confirmar) {
      const nuevaLista = estudiantes.filter((e) => e.id !== id);
      setEstudiantes(nuevaLista);
      if (editandoId === id) {
        cancelarEdicion();
      }
    }
  };

  const estudiantesFiltrados = estudiantes.filter((est) => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;
    return (
      est.nombre.toLowerCase().includes(termino) ||
      est.apellido.toLowerCase().includes(termino) ||
      est.carrera.toLowerCase().includes(termino)
    );
  });

  return (
    <div className="dashboard-sections">
      {/* Formulario */}
      <div className="card">
        <h2>{editandoId !== null ? "Editar Estudiante" : "Registrar Estudiante"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingrese el nombre"
            />
          </div>

          <div className="form-group">
            <label>Apellido:</label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Ingrese el apellido"
            />
          </div>

          <div className="form-group">
            <label>Carrera:</label>
            {carreras.length === 0 ? (
              <p style={{ color: "var(--danger)", fontSize: "0.875rem" }}>
                No hay carreras. Agregue una carrera primero.
              </p>
            ) : (
              <div className="checkbox-list">
                {carreras.map((c, index) => (
                  <div key={index} className="checkbox-item">
                    <input
                      type="checkbox"
                      value={c}
                      checked={carrera === c}
                      onChange={() => setCarrera(carrera === c ? "" : c)}
                    />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="action-buttons">
            <button type="submit" disabled={carreras.length === 0}>
              {editandoId !== null ? "Actualizar" : "Registrar"}
            </button>
            {editandoId !== null && (
              <button type="button" className="btn-secondary" onClick={cancelarEdicion}>
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista */}
      <div className="card">
        <h2>Lista de Estudiantes</h2>

        <div className="search-container">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, apellido o carrera..."
          />
          {busqueda && (
            <button type="button" className="btn-secondary" onClick={() => setBusqueda("")}>
              Limpiar
            </button>
          )}
        </div>

        {estudiantes.length === 0 ? (
          <p>No hay estudiantes registrados aún.</p>
        ) : estudiantesFiltrados.length === 0 ? (
          <p>No se encontraron resultados para "{busqueda}".</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>N°</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Carrera</th>
                  <th style={{ width: "160px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map((est, index) => (
                  <tr key={est.id}>
                    <td>{index + 1}</td>
                    <td>{est.nombre}</td>
                    <td>{est.apellido}</td>
                    <td>{est.carrera}</td>
                    <td>
                      <button
                        style={{ marginRight: "6px", padding: "4px 8px" }}
                        onClick={() => iniciarEdicion(est)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: "4px 8px" }}
                        onClick={() => eliminarEstudiante(est.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default GestionEstudiantes;
