import { useAuth } from '../../../context/authStore';

export default function AdminPerfil({ user }) {
  const { logout } = useAuth();

  const rows = [
    { label: 'Nombre',          value: user.nombre },
    { label: 'Correo',          value: user.email },
    { label: 'Rol',             value: 'Administrador (ADMIN)' },
    { label: 'Plataforma',      value: 'Apurímac Turismo V3.0' },
    { label: 'Autenticación',   value: 'JWT Bearer + bcrypt (MySQL)' },
    { label: 'Versión sistema', value: 'V3.0 — Backend & MySQL Persistente' },
  ];

  return (
    <div className="fade-in-up">
      <div className="admin-page-header">
        <h1>Mi perfil</h1>
        <p>Información de la cuenta administradora</p>
      </div>

      <div className="admin-grid-2" style={{ alignItems: 'flex-start', gap: 'var(--space-6)' }}>
        {/* Profile card */}
        <div className="admin-panel">
          <div className="admin-panel__header">
            <span className="admin-panel__title">Datos de la cuenta</span>
          </div>
          <div className="admin-panel__body">
            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 'var(--space-6)', borderBottom: '1px solid var(--border)', marginBottom: 'var(--space-6)' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--green-600)', color: 'var(--white)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '2rem', fontWeight: 800, marginBottom: 'var(--space-3)'
              }}>
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-lg)' }}>{user.nombre}</div>
              <span className="section-label" style={{ marginTop: 'var(--space-1)' }}>Administrador</span>
            </div>

            <div className="admin-info-list">
              {rows.map(({ label, value }) => (
                <div key={label} className="admin-info-row">
                  <span className="admin-info-row__label">{label}</span>
                  <span className="admin-info-row__value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions & security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Security notice */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <span className="admin-panel__title">Seguridad del Sistema</span>
            </div>
            <div className="admin-panel__body">
              <div style={{
                background: 'var(--green-50)',
                border: '1px solid var(--green-200)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)',
                marginBottom: 'var(--space-4)'
              }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green-700)" strokeWidth="2" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--green-800)' }}>Sesión JWT Activa</span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--green-700)', lineHeight: 1.6 }}>
                  Has iniciado sesión como administrador mediante token JWT firmado y validado por el servidor Express.
                </p>
              </div>

              <div style={{
                background: 'var(--cream)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-4)'
              }}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--primary-dark)' }}>Versión 3.0 Conectada</span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Base de datos MySQL 8.0 activa con ORM Prisma. Todas las operaciones de reservas, destinos, experiencias y alojamientos son persistentes.
                </p>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="admin-panel">
            <div className="admin-panel__header">
              <span className="admin-panel__title">Acciones rápidas</span>
            </div>
            <div className="admin-panel__body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
                style={{ justifyContent: 'center' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
                Abrir sitio público
              </a>
              <button
                className="btn btn-sm w-full"
                style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', justifyContent: 'center' }}
                onClick={logout}
                id="admin-profile-logout-btn"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
