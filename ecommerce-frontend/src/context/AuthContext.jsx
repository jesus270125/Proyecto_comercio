import { useState, useEffect, useCallback } from 'react';
import { authService } from '../services/api';
import { AuthContext } from './authStore';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('apu_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('apu_token')));

  // Al montar, verificar si el token sigue siendo válido con /auth/me
  useEffect(() => {
    const token = localStorage.getItem('apu_token');
    if (!token) {
      return;
    }

    authService
      .me()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
          localStorage.setItem('apu_user', JSON.stringify(res.user));
        }
      })
      .catch(() => {
        // Token inválido o expirado
        authService.logout();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.user) {
        setUser(res.user);
        localStorage.setItem('apu_user', JSON.stringify(res.user));
        return { ok: true, user: res.user };
      }
      return { ok: false, error: 'No se recibió usuario válido.' };
    } catch (err) {
      return { ok: false, error: err.message || 'Error al iniciar sesión.' };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
