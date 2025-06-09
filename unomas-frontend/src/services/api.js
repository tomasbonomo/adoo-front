// API Service para UnoMas - Sin async/await
import config, { log } from '../config/config';

const API_BASE_URL = config.api.baseUrl;

class ApiService {
  constructor() {
    this.token = localStorage.getItem(config.auth.tokenKey);
  }

  // Configurar headers por defecto
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (includeAuth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Método genérico para hacer requests
  makeRequest(url, options = {}) {
    const finalUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const defaultOptions = {
      headers: this.getHeaders(!options.skipAuth),
      ...options
    };

    return fetch(finalUrl, defaultOptions)
      .then(response => {
        if (!response.ok) {
          return response.json()
            .then(errorData => {
              throw new Error(errorData.mensaje || `HTTP error! status: ${response.status}`);
            })
            .catch(() => {
              throw new Error(`HTTP error! status: ${response.status}`);
            });
        }
        return response.json();
      });
  }

  // =============== AUTENTICACIÓN ===============
  register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
      skipAuth: true
    }).then(response => {
      if (response.token) {
        this.setToken(response.token);
      }
      return response;
    });
  }

  login(credentials) {
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
      skipAuth: true
    }).then(response => {
      if (response.token) {
        this.setToken(response.token);
      }
      return response;
    });
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem(config.auth.tokenKey, token);
    log('info', 'Token set successfully');
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem(config.auth.tokenKey);
    log('info', 'Token removed');
  }

  // =============== USUARIOS ===============
  getUserProfile() {
    return this.makeRequest('/usuarios/perfil');
  }

  updateUserProfile(profileData) {
    return this.makeRequest('/usuarios/perfil', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  searchUsers(criteria) {
    return this.makeRequest('/usuarios/buscar', {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
  }

  getUserStats() {
    return this.makeRequest('/usuarios/estadisticas');
  }

  // =============== DEPORTES ===============
  getDeportes() {
    return this.makeRequest('/deportes', { skipAuth: true });
  }

  getDeportesTypes() {
  return this.makeRequest('/deportes/tipos', { skipAuth: true });
}

  getDeporte(id) {
    return this.makeRequest(`/deportes/${id}`, { skipAuth: true });
  }

  createDeporte(tipo) {
    return this.makeRequest(`/deportes/crear/${tipo}`, {
      method: 'POST'
    });
  }

  // =============== PARTIDOS ===============
  createPartido(partidoData) {
    return this.makeRequest('/partidos', {
      method: 'POST',
      body: JSON.stringify(partidoData)
    });
  }

  getPartido(id) {
    return this.makeRequest(`/partidos/${id}`, { skipAuth: true });
  }

  getMyPartidos() {
    return this.makeRequest('/partidos/mis-partidos');
  }

  searchPartidos(criteria, page = 0, size = 10) {
    return this.makeRequest(`/partidos/buscar?page=${page}&size=${size}`, {
      method: 'POST',
      body: JSON.stringify(criteria)
    });
  }

  joinPartido(partidoId) {
    return this.makeRequest(`/partidos/${partidoId}/unirse`, {
      method: 'POST'
    });
  }

  changePartidoState(partidoId, stateData) {
    return this.makeRequest(`/partidos/${partidoId}/estado`, {
      method: 'PUT',
      body: JSON.stringify(stateData)
    });
  }

  configureStrategy(partidoId, strategyData) {
    return this.makeRequest(`/partidos/${partidoId}/estrategia`, {
      method: 'PUT',
      body: JSON.stringify(strategyData)
    });
  }

  // =============== UBICACIONES ===============
  getZonas() {
    return this.makeRequest('/ubicaciones/zonas', { skipAuth: true });
  }

  searchUbicaciones(direccion) {
    return this.makeRequest(`/ubicaciones/buscar?direccion=${encodeURIComponent(direccion)}`, { skipAuth: true });
  }

  getUbicacionesByZona(zona) {
    return this.makeRequest(`/ubicaciones/zona/${encodeURIComponent(zona)}`, { skipAuth: true });
  }

  // =============== NOTIFICACIONES ===============
  configureNotifications() {
    return this.makeRequest('/notificaciones/configurar', {
      method: 'POST'
    });
  }

  testEmail(email) {
    return this.makeRequest(`/notificaciones/test-email?email=${encodeURIComponent(email)}`, {
      method: 'POST'
    });
  }

  testPush(token) {
    return this.makeRequest(`/notificaciones/test-push?token=${encodeURIComponent(token)}`, {
      method: 'POST'
    });
  }

  // =============== ESTADÍSTICAS ===============
  getGeneralStats() {
    return this.makeRequest('/estadisticas/generales');
  }

  // =============== UTILIDADES ===============
  isAuthenticated() {
    return !!this.token;
  }

  // Métodos de conveniencia para manejo de errores
  handleApiError(error) {
    console.error('API Error:', error);

    // Si el error es del tipo Error lanzado en makeRequest con un mensaje del backend
    if (error.message) {
      return error.message;
    }

    // Otros chequeos generales
    return 'Ha ocurrido un error inesperado.';
  }

  // =============== CONFIRMACIONES ===============
  confirmarParticipacion(partidoId) {
    return this.makeRequest(`/partidos/${partidoId}/confirmar`, {
      method: 'POST'
    });
  }

  // =============== COMENTARIOS ===============
  agregarComentario(partidoId, comentarioData) {
    return this.makeRequest(`/partidos/${partidoId}/comentar`, {
      method: 'POST',
      body: JSON.stringify(comentarioData)
    });
  }

  obtenerComentariosPartido(partidoId) {
    return this.makeRequest(`/comentarios/partido/${partidoId}`);
  }
}

// Crear instancia única del servicio
const apiService = new ApiService();

export default apiService;