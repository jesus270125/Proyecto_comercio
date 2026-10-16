import React from "react";

function Dashboard({ estudiantes, carreras }) {
  // Estadísticas calculadas
  const totalEstudiantes = estudiantes.length;
  const totalCarreras = carreras.length;

  // Calcular carrera con más estudiantes
  let carreraMasPopular = "Ninguna";
  if (estudiantes.length > 0) {
    const conteo = {};
    estudiantes.forEach((est) => {
      conteo[est.carrera] = (conteo[est.carrera] || 0) + 1;
    });

    let maxCount = 0;
    for (const [carrera, count] of Object.entries(conteo)) {
      if (count > maxCount) {
        maxCount = count;
        carreraMasPopular = carrera;
      }
    }
  }

  // Último estudiante
  const ultimoEstudiante = estudiantes.length > 0
    ? `${estudiantes[estudiantes.length - 1].nombre} ${estudiantes[estudiantes.length - 1].apellido}`
    : "Ninguno";

  // Últimos 5 estudiantes para el resumen
  const ultimosRegistros = [...estudiantes].reverse().slice(0, 5);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-grid">
        <div className="card stat-card">
          <h3 className="stat-title">Total Estudiantes</h3>
          <p className="stat-value">{totalEstudiantes}</p>
        </div>
        <div className="card stat-card">
          <h3 className="stat-title">Total Carreras</h3>
          <p className="stat-value">{totalCarreras}</p>
        </div>
        <div className="card stat-card">
          <h3 className="stat-title">Carrera más popular</h3>
          <p className="stat-value" style={{ fontSize: '1.25rem' }}>{carreraMasPopular}</p>
        </div>
        <div className="card stat-card">
          <h3 className="stat-title">Último registro</h3>
          <p className="stat-value" style={{ fontSize: '1.25rem' }}>{ultimoEstudiante}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="card">
          <h3>Últimos estudiantes registrados</h3>
          {ultimosRegistros.length === 0 ? (
            <p className="text-light">No hay registros recientes.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Carrera</th>
                </tr>
              </thead>
              <tbody>
                {ultimosRegistros.map((est) => (
                  <tr key={est.id}>
                    <td>{est.nombre} {est.apellido}</td>
                    <td>{est.carrera}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Resumen del sistema</h3>
          <p>Este sistema permite gestionar de manera integral la información de los estudiantes y las carreras ofrecidas.</p>
          <p>Navegue a través del menú lateral para acceder a las opciones de administración completas.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
