import React from "react";

function Sidebar({ vista, setVista }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Gestión Académica</h2>
      </div>
      <div className="sidebar-nav">
        <div
          className={`nav-item ${vista === "dashboard" ? "active" : ""}`}
          onClick={() => setVista("dashboard")}
        >
          Dashboard
        </div>
        <div
          className={`nav-item ${vista === "estudiantes" ? "active" : ""}`}
          onClick={() => setVista("estudiantes")}
        >
          Estudiantes
        </div>
        <div
          className={`nav-item ${vista === "carreras" ? "active" : ""}`}
          onClick={() => setVista("carreras")}
        >
          Carreras
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
