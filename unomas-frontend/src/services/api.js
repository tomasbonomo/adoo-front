// API Service para UnoMas - Con mejor manejo de errores
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

  // Método genérico para hacer requests - MEJORADO
  makeRequest(url, options = {}) {
    const finalUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const defaultOptions = {
      headers: this.getHeaders(!options.skipAuth),
      ...options
    };

    // Log de la request para debugging
    if (config.app.isDevelopment) {
      console.log('🚀 API Request:', {
        url: finalUrl,
        method: defaultOptions.method || 'GET',
        headers: defaultOptions.headers,
        body: defaultOptions.body ? JSON.parse(defaultOptions.body) : null
      });
    }

    return fetch(finalUrl, defaultOptions)
      .then(response => {
        // Log de la response para debugging
        if (config.app.isDevelopment) {
          console.log(`📡 API Response [${response.status}]:`, {
            url: finalUrl,
            status: response.status,
            statusText: response.statusText,
            ok: response.ok
          });
        }

        if (!response.ok) {
          // Intentar obtener el error del backend
          return response.text()
            .then(errorText => {
              let errorData;
              try {
                errorData = JSON.parse(errorText);
              } catch (e) {
                // Si no es JSON válido, usar el texto directamente
                errorData = { mensaje: errorText || `HTTP error! status: ${response.status}` };
              }

              // Log del error para debugging
              if (config.app.isDevelopment) {
                console.error('❌ API Error Details:', {
                  status: response.status,
                  statusText: response.statusText,
                  errorData,
                  url: finalUrl
                });
              }

              const errorMessage = errorData.mensaje || 
                                 errorData.message || 
                                 errorData.error || 
                                 `Error ${response.status}: ${response.statusText}`;
              
              throw new Error(errorMessage);
            });
        }

        // Intentar parsear la respuesta como JSON
        return response.text()
          .then(responseText => {
            if (!responseText) {
              return {};
            }
            try {
              return JSON.parse(responseText);
            } catch (e) {
              // Si no es JSON válido, retornar el texto
              return { data: responseText };
            }
          });
      })
      .catch(error => {
        // Log del error de red o parsing
        if (config.app.isDevelopment) {
          console.error('🔥 Network/Parse Error:', error);
        }
        throw error;
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
    // Limpiar y preparar los datos antes de enviar
    const cleanedData = this.preparePartidoData(partidoData);
    
    return this.makeRequest('/partidos', {
      method: 'POST',
      body: JSON.stringify(cleanedData)
    });
  }

  // NUEVO: Método para preparar y limpiar datos del partido
  preparePartidoData(partidoData) {
    const cleaned = {
      tipoDeporte: partidoData.tipoDeporte,
      cantidadJugadoresRequeridos: parseInt(partidoData.cantidadJugadoresRequeridos),
      duracion: parseInt(partidoData.duracion),
      horario: new Date(partidoData.horario).toISOString(),
      estrategiaEmparejamiento: partidoData.estrategiaEmparejamiento || 'POR_NIVEL',
      ubicacion: {
        direccion: partidoData.ubicacion.direccion,
        // Convertir strings vacíos a null
        latitud: partidoData.ubicacion.latitud ? parseFloat(partidoData.ubicacion.latitud) : null,
        longitud: partidoData.ubicacion.longitud ? parseFloat(partidoData.ubicacion.longitud) : null,
        zona: partidoData.ubicacion.zona || null
      }
    };

    // Log de los datos limpiados para debugging
    if (config.app.isDevelopment) {
      console.log('🧹 Cleaned Partido Data:', cleaned);
    }

    return cleaned;
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

  // Métodos de conveniencia para manejo de errores - MEJORADO
  handleApiError(error) {
    console.error('API Error:', error);

    // Si el error es del tipo Error lanzado en makeRequest con un mensaje del backend
    if (error.message) {
      return error.message;
    }

    // Si es un error de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return 'Error de conexión. Verifica tu conexión a internet y que el servidor esté funcionando.';
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