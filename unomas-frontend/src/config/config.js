// Crear archivo: src/config/config.js

// Configuración centralizada de la aplicación UnoMas
const config = {
  // Configuración de la API
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1',
    timeout: 30000, // 30 segundos
  },

  // Configuración de la aplicación
  app: {
    name: 'UnoMas',
    version: '1.0.0',
    description: 'Sistema de Gestión Deportiva',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    debugMode: import.meta.env.VITE_DEBUG_MODE === 'true',
  },

  // Configuración de autenticación
  auth: {
    tokenKey: 'unomas_token',
    refreshTokenKey: 'unomas_refresh_token',
    tokenExpiration: 24 * 60 * 60 * 1000, // 24 horas en millisegundos
  },

  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 50,
    pageSizes: [5, 10, 20, 50],
  },

  // Configuración de deportes
  deportes: {
    iconos: {
      FUTBOL: '⚽',
      BASQUET: '🏀',
      VOLEY: '🏐',
      TENIS: '🎾',
      DEFAULT: '🏃‍♂️'
    },
    colores: {
      FUTBOL: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-700'
      },
      BASQUET: {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-700'
      },
      VOLEY: {
        bg: 'bg-pink-50',
        border: 'border-pink-500',
        text: 'text-pink-700'
      },
      TENIS: {
        bg: 'bg-teal-50',
        border: 'border-teal-500',
        text: 'text-teal-700'
      }
    }
  },

  // Configuración de estados de partido
  estadosPartido: {
    NECESITAMOS_JUGADORES: {
      color: 'yellow',
      nombre: 'Buscando jugadores',
      descripcion: 'Este partido está buscando más jugadores para completar el equipo.'
    },
    PARTIDO_ARMADO: {
      color: 'blue',
      nombre: 'Partido armado',
      descripcion: 'Ya se completó el número de jugadores. Esperando confirmación.'
    },
    CONFIRMADO: {
      color: 'green',
      nombre: 'Confirmado',
      descripcion: 'El partido está confirmado y listo para jugarse.'
    },
    EN_JUEGO: {
      color: 'indigo',
      nombre: 'En juego',
      descripcion: 'El partido está actualmente en curso.'
    },
    FINALIZADO: {
      color: 'gray',
      nombre: 'Finalizado',
      descripcion: 'Este partido ya terminó.'
    },
    CANCELADO: {
      color: 'red',
      nombre: 'Cancelado',
      descripción: 'Este partido fue cancelado.'
    }
  },

  // Configuración de niveles de juego
  nivelesJuego: {
    PRINCIPIANTE: {
      color: 'green',
      nombre: 'Principiante',
      descripcion: 'Jugador con poca experiencia'
    },
    INTERMEDIO: {
      color: 'yellow',
      nombre: 'Intermedio',
      descripcion: 'Jugador con experiencia moderada'
    },
    AVANZADO: {
      color: 'red',
      nombre: 'Avanzado',
      descripcion: 'Jugador experimentado'
    }
  }
};

// Funciones utilitarias para acceder a la configuración
export const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], config);
};

// FUNCIONES HELPER PARA DEPORTES - NUEVAS
export const getDeporteIcon = (tipoDeporte) => {
  const iconos = {
    'FUTBOL': '⚽',
    'BASQUET': '🏀', 
    'VOLEY': '🏐',
    'TENIS': '🎾'
  };
  return iconos[tipoDeporte] || '🏃‍♂️';
};

export const getDeporteDisplay = (deportes, tipoDeporte) => {
  if (!deportes || !Array.isArray(deportes)) {
    return {
      icon: getDeporteIcon(tipoDeporte),
      label: tipoDeporte
    };
  }
  
  const deporte = deportes.find(d => d.value === tipoDeporte);
  return {
    icon: getDeporteIcon(tipoDeporte),
    label: deporte?.label || tipoDeporte
  };
};

// Para componentes que solo necesitan el nombre legible
export const getDeporteLabel = (deportes, tipoDeporte) => {
  if (!deportes || !Array.isArray(deportes)) {
    // Fallback mapping si no tenemos los deportes cargados
    const fallbackLabels = {
      'FUTBOL': 'Fútbol',
      'BASQUET': 'Básquet',
      'VOLEY': 'Vóley', 
      'TENIS': 'Tenis'
    };
    return fallbackLabels[tipoDeporte] || tipoDeporte;
  }
  
  const deporte = deportes.find(d => d.value === tipoDeporte);
  return deporte?.label || tipoDeporte;
};

export const getDeporteColor = (tipoDeporte) => {
  return config.deportes.colores[tipoDeporte] || {
    bg: 'bg-gray-50',
    border: 'border-gray-500',
    text: 'text-gray-700'
  };
};

export const getEstadoPartidoInfo = (estado) => {
  return config.estadosPartido[estado] || {
    color: 'gray',
    nombre: estado,
    descripcion: 'Estado desconocido'
  };
};

export const getNivelJuegoInfo = (nivel) => {
  return config.nivelesJuego[nivel] || {
    color: 'gray',
    nombre: nivel,
    descripcion: 'Nivel desconocido'
  };
};

export const formatDate = (dateString, format = 'short') => {
  if (!dateString) return '';
  
  const dateFormats = {
    short: {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    },
    long: {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    },
    dateOnly: {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    },
    timeOnly: {
      hour: '2-digit',
      minute: '2-digit'
    }
  };
  
  const date = new Date(dateString);
  const formatOptions = dateFormats[format] || dateFormats.short;
  
  return date.toLocaleDateString('es-ES', formatOptions);
};

export const isValidEmail = (email) => {
  const emailPattern = /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailPattern.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= 8;
};

export const isValidUsername = (username) => {
  const usernamePattern = /^[a-zA-Z0-9_-]+$/;
  return username && 
         username.length >= 3 &&
         username.length <= 50 &&
         usernamePattern.test(username);
};

// Función para logging condicional
export const log = (level, message, ...args) => {
  if (!config.app.isDevelopment) return;
  
  const logLevels = ['error', 'warn', 'info', 'debug'];
  const currentLevelIndex = logLevels.indexOf('info');
  const messageLevelIndex = logLevels.indexOf(level);
  
  if (messageLevelIndex <= currentLevelIndex) {
    console[level](`[UnoMas] ${message}`, ...args);
  }
};

export default config;