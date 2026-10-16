import React from "react";

function Header({ vista }) {
  const getTitulo = () => {
    switch (vista) {
      case "dashboard":
        return "Dashboard Principal";
      case "estudiantes":
        return "Gestión de Estudiantes";
      case "carreras":
        return "Administración de Carreras 2026-2";
      default:
        return "Panel de Administración";
    }
  };

  return (
    <header className="top-header">
      <h1 className="header-title">{getTitulo()}</h1>
      <div className="header-user">
        <div className="user-badge">A</div>
        <span>Administrador</span>
      </div>
    </header>
  );
}

export default Header;
