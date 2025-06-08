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
  },

  // Configuración de notificaciones (para implementación futura)
  notifications: {
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    },
    types: {
      PARTIDO_CREADO: 'Nuevo partido disponible',
      JUGADOR_UNIDO: 'Nuevo jugador se unió',
      PARTIDO_ARMADO: 'Partido completo',
      PARTIDO_CONFIRMADO: 'Partido confirmado',
      PARTIDO_INICIADO: 'Partido iniciado',
      PARTIDO_FINALIZADO: 'Partido finalizado',
      PARTIDO_CANCELADO: 'Partido cancelado'
    }
  },

  // Configuración de mapas (para implementación futura)
  maps: {
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    defaultCenter: {
      lat: -34.6037,
      lng: -58.3816 // Buenos Aires, Argentina
    },
    defaultZoom: 12,
    maxZoom: 18,
    minZoom: 8
  },

  // Configuración de validaciones
  validation: {
    email: {
      pattern: /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
      message: 'El formato del email es inválido'
    },
    password: {
      minLength: 8,
      message: 'La contraseña debe tener al menos 8 caracteres'
    },
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_-]+$/,
      message: 'El nombre de usuario debe tener entre 3 y 50 caracteres y solo puede contener letras, números, guiones y guiones bajos'
    },
    partido: {
      minJugadores: 2,
      maxJugadores: 50,
      minDuracion: 30, // minutos
      maxDuracion: 300 // minutos (5 horas)
    }
  },

  // Configuración de formato de fechas
  dateFormats: {
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
  },

  // Configuración de analytics (para implementación futura)
  analytics: {
    googleAnalyticsId: import.meta.env.VITE_GOOGLE_ANALYTICS_ID,
    enableTracking: import.meta.env.PROD
  },

  // Configuración de logs
  logging: {
    level: import.meta.env.VITE_LOG_LEVEL || 'info',
    enableConsole: import.meta.env.DEV,
    enableRemote: import.meta.env.PROD
  },

  // URLs y rutas importantes
  routes: {
    public: ['/login', '/register', '/'],
    protected: ['/dashboard', '/perfil', '/partidos', '/estadisticas'],
    admin: ['/admin']
  },

  // Configuración de performance
  performance: {
    debounceDelay: 300, // millisegundos para debounce en búsquedas
    cacheTimeout: 5 * 60 * 1000, // 5 minutos
    retryAttempts: 3,
    retryDelay: 1000 // millisegundos
  }
};

// Funciones utilitarias para acceder a la configuración
export const getConfig = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], config);
};

export const getDeporteIcon = (tipoDeporte) => {
  return config.deportes.iconos[tipoDeporte] || config.deportes.iconos.DEFAULT;
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
  
  const date = new Date(dateString);
  const formatOptions = config.dateFormats[format] || config.dateFormats.short;
  
  return date.toLocaleDateString('es-ES', formatOptions);
};

export const isValidEmail = (email) => {
  return config.validation.email.pattern.test(email);
};

export const isValidPassword = (password) => {
  return password && password.length >= config.validation.password.minLength;
};

export const isValidUsername = (username) => {
  return username && 
         username.length >= config.validation.username.minLength &&
         username.length <= config.validation.username.maxLength &&
         config.validation.username.pattern.test(username);
};

// Función para logging condicional
export const log = (level, message, ...args) => {
  if (!config.logging.enableConsole) return;
  
  const logLevels = ['error', 'warn', 'info', 'debug'];
  const currentLevelIndex = logLevels.indexOf(config.logging.level);
  const messageLevelIndex = logLevels.indexOf(level);
  
  if (messageLevelIndex <= currentLevelIndex) {
    console[level](`[UnoMas] ${message}`, ...args);
  }
};

export default config;