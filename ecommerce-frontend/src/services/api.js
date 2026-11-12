// src/services/api.js
// Cliente HTTP centralizado para la API REST de Apurímac Turismo

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
const API_ORIGIN = new URL(API_BASE, window.location.origin).origin;

// La base de datos guarda rutas portables; el navegador necesita la dirección del servidor.
function mapImages(value, toPublic) {
  if (Array.isArray(value)) return value.map(item => mapImages(item, toPublic));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    const mapUrl = url => {
      if (typeof url !== 'string') return url;
      if (toPublic && url.startsWith('/uploads/')) return `${API_ORIGIN}${url}`;
      if (!toPublic && url.startsWith(`${API_ORIGIN}/uploads/`)) return url.slice(API_ORIGIN.length);
      return url;
    };
    if (key === 'image') return [key, mapUrl(item)];
    if (key === 'gallery' && Array.isArray(item)) return [key, item.map(mapUrl)];
    return [key, mapImages(item, toPublic)];
  }));
}

/**
 * Obtiene el token JWT guardado en localStorage
 */
function getToken() {
  return localStorage.getItem('apu_token');
}

/**
 * Petición genérica con JSON y Authorization header
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };
  if (typeof config.body === 'string' && headers['Content-Type'] === 'application/json') {
    config.body = JSON.stringify(mapImages(JSON.parse(config.body), false));
  }

  const res = await fetch(url, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || (data.errors ? data.errors.join(', ') : 'Error en la petición');
    const error = new Error(errorMsg);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return mapImages(data, true);
}

export async function uploadImage(blob) {
  const res = await fetch(`${API_BASE}/admin/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'image/webp', Authorization: `Bearer ${getToken()}` },
    body: blob,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'No se pudo subir la imagen.');
  return `${API_ORIGIN}${data.data.url}`;
}

// ── SERVICIOS DE AUTENTICACIÓN ──────────────────────────────
export const authService = {
  async login(email, password) {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      localStorage.setItem('apu_token', res.token);
    }
    return res;
  },

  async me() {
    return await request('/auth/me');
  },

  logout() {
    localStorage.removeItem('apu_token');
    localStorage.removeItem('apu_user');
  },
};

// ── SERVICIOS PÚBLICOS ──────────────────────────────────────
export const destinationsService = {
  async getAll() {
    return await request('/destinations');
  },
  async getBySlug(slug) {
    return await request(`/destinations/${slug}`);
  },
};

export const experiencesService = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/experiences${query ? `?${query}` : ''}`);
  },
  async getBySlug(slug) {
    return await request(`/experiences/${slug}`);
  },
};

export const accommodationsService = {
  async getAll(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/accommodations${query ? `?${query}` : ''}`);
  },
  async getBySlug(slug) {
    return await request(`/accommodations/${slug}`);
  },
};

export const reservationsService = {
  async create(reservationData) {
    return await request('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  },
};

// ── SERVICIOS DE ADMINISTRACIÓN ────────────────────────────
export const adminService = {
  // Destinos
  async getDestinations() {
    return await request('/admin/destinations');
  },
  async createDestination(data) {
    return await request('/admin/destinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateDestination(id, data) {
    return await request(`/admin/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteDestination(id) {
    return await request(`/admin/destinations/${id}`, {
      method: 'DELETE',
    });
  },
  async togglePublishDestination(id) {
    return await request(`/admin/destinations/${id}/publish`, {
      method: 'PATCH',
    });
  },

  // Experiencias
  async getExperiences() {
    return await request('/admin/experiences');
  },
  async createExperience(data) {
    return await request('/admin/experiences', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateExperience(id, data) {
    return await request(`/admin/experiences/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteExperience(id) {
    return await request(`/admin/experiences/${id}`, {
      method: 'DELETE',
    });
  },
  async togglePublishExperience(id) {
    return await request(`/admin/experiences/${id}/publish`, {
      method: 'PATCH',
    });
  },

  // Hospedajes
  async getAccommodations() {
    return await request('/admin/accommodations');
  },
  async createAccommodation(data) {
    return await request('/admin/accommodations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  async updateAccommodation(id, data) {
    return await request(`/admin/accommodations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  async deleteAccommodation(id) {
    return await request(`/admin/accommodations/${id}`, {
      method: 'DELETE',
    });
  },
  async togglePublishAccommodation(id) {
    return await request(`/admin/accommodations/${id}/publish`, {
      method: 'PATCH',
    });
  },

  // Reservas
  async getReservations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return await request(`/admin/reservations${query ? `?${query}` : ''}`);
  },
  async updateReservationStatus(id, estado) {
    return await request(`/admin/reservations/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ estado }),
    });
  },
  async deleteReservation(id) {
    return await request(`/admin/reservations/${id}`, {
      method: 'DELETE',
    });
  },
};
