import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authStore';
import './LoginModal.css';

export default function LoginModal({ isOpen, onClose }) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const emailRef = useRef(null);

  // Bloquear scroll de la página de fondo mientras el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => emailRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleChange = (e) => {
    setError('');
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Completa todos los campos.');
      return;
    }
    setLoading(true);
    // Simular latencia de red
    await new Promise((r) => setTimeout(r, 600));
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onClose();
    if (result.user.role === 'ADMIN' || result.user.role === 'admin') {
      navigate('/admin');
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="login-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true" aria-label="Iniciar sesión">
      <div className="login-modal fade-in-up">
        {/* Header */}
        <div className="login-modal__header">
          <div className="login-modal__logo">
            <svg width="22" height="22" viewBox="0 0 28 28" fill="none" aria-hidden="true">
              <path d="M14 2L26 22H2L14 2Z" fill="currentColor" opacity="0.9"/>
              <circle cx="14" cy="19" r="4" fill="currentColor" opacity="0.5"/>
            </svg>
            <span>APURÍMAC <em>turismo</em></span>
          </div>
          <button className="login-modal__close" onClick={onClose} aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="login-modal__body">
          <h2 className="login-modal__title">Bienvenido de vuelta</h2>
          <p className="login-modal__subtitle">Inicia sesión para continuar</p>

          <form className="login-form" onSubmit={handleSubmit} noValidate id="login-form">
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Correo electrónico</label>
              <input
                ref={emailRef}
                id="login-email"
                name="email"
                type="email"
                className="form-input"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Contraseña</label>
              <div className="login-pwd-wrap">
                <input
                  id="login-password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="login-pwd-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPwd ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              id="login-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <span className="login-spinner" aria-hidden="true"/>
              ) : null}
              {loading ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>

          <p className="login-hint">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Solo el personal autorizado puede iniciar sesión.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
