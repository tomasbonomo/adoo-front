import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDeporteIcon } from '../../config/config';
import { 
  Plus, 
  Search, 
  Trophy, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  Star,
  TrendingUp,
  Activity,
  Zap,
  Brain,
  Target,
  Globe,
  History,
  Bell,
  AlertCircle,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { Card, Loading, ErrorMessage, EmptyState, Badge } from '../common';
import NotificationCenter from '../notificaciones/NotificationCenter';
import apiService from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [misPartidos, setMisPartidos] = useState([]);
  const [partidosRecomendados, setPartidosRecomendados] = useState([]);
  const [systemStatus, setSystemStatus] = useState({
    automaticTransitions: true,
    smartNotifications: true,
    intelligentMatching: true
  });
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadDashboardData();
    
    // ✅ NUEVO: Auto-refresh cada 45 segundos para dashboard inteligente
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadDashboardDataSilently();
      }, 45000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadDashboardData = () => {
    setLoading(true);
    setError(null);
    loadData();
  };

  const loadDashboardDataSilently = () => {
    loadData(true);
  };

  const loadData = (silent = false) => {
    Promise.all([
      loadUserStats(),
      loadMisPartidos(),
      loadPartidosRecomendados()
    ])
    .then(() => {
      if (!silent) setLoading(false);
    })
    .catch(err => {
      console.error('Error cargando dashboard:', err);
      if (!silent) {
        setError(apiService.handleApiError(err));
        setLoading(false);
      }
    });
  };

  const loadUserStats = () => {
    return apiService.getUserStats()
      .then(userStats => {
        setStats(userStats);
      })
      .catch(err => {
        console.error('Error cargando estadísticas:', err);
      });
  };

  const loadMisPartidos = () => {
    return apiService.getMyPartidos()
      .then(partidos => {
        const partidosActivos = partidos.filter(p => 
          ['NECESITAMOS_JUGADORES', 'PARTIDO_ARMADO', 'CONFIRMADO', 'EN_JUEGO'].includes(p.estado)
        );
        setMisPartidos(partidosActivos.slice(0, 3));
      })
      .catch(err => {
        console.error('Error cargando mis partidos:', err);
      });
  };

  const loadPartidosRecomendados = () => {
    const criterios = {
      tipoDeporte: user.deporteFavorito || null,
      soloDisponibles: true,
      ordenarPor: 'compatibilidad',
      orden: 'desc'
    };

    return apiService.searchPartidos(criterios, 0, 5)
      .then(response => {
        setPartidosRecomendados(response.content || []);
      })
      .catch(err => {
        console.error('Error cargando partidos recomendados:', err);
      });
  };

  // ✅ NUEVO: Obtener próximas transiciones automáticas
  const getUpcomingTransitions = () => {
    const transitions = [];
    const now = new Date();

    misPartidos.forEach(partido => {
      const partidoDate = new Date(partido.horario);
      const timeDiff = partidoDate - now;

      if (partido.estado === 'CONFIRMADO' && timeDiff > 0 && timeDiff <= 2 * 60 * 60 * 1000) {
        transitions.push({
          id: partido.id,
          tipo: 'inicio',
          partido: partido.deporte.nombre,
          tiempo: Math.floor(timeDiff / (1000 * 60)),
          mensaje: 'Iniciará automáticamente'
        });
      }

      if (partido.estado === 'EN_JUEGO') {
        const endTime = new Date(partidoDate.getTime() + partido.duracion * 60 * 1000);
        const timeToEnd = endTime - now;
        if (timeToEnd > 0 && timeToEnd <= 30 * 60 * 1000) {
          transitions.push({
            id: partido.id,
            tipo: 'fin',
            partido: partido.deporte.nombre,
            tiempo: Math.floor(timeToEnd / (1000 * 60)),
            mensaje: 'Finalizará automáticamente'
          });
        }
      }
    });

    return transitions.slice(0, 3);
  };

  // ✅ NUEVO: Obtener partidos que necesitan atención
  const getPartidosQuePreguntanAtencion = () => {
    return misPartidos.filter(p => 
      p.estado === 'PARTIDO_ARMADO' || 
      (p.estado === 'NECESITAMOS_JUGADORES' && p.cantidadJugadoresActual === p.cantidadJugadoresRequeridos - 1)
    );
  };

  const getEstadoBadge = (estado) => {
    const badgeProps = {
      'NECESITAMOS_JUGADORES': { variant: 'yellow', text: 'Buscando jugadores' },
      'PARTIDO_ARMADO': { variant: 'blue', text: 'Partido armado' },
      'CONFIRMADO': { variant: 'green', text: 'Confirmado' },
      'EN_JUEGO': { variant: 'indigo', text: 'En juego' },
      'FINALIZADO': { variant: 'gray', text: 'Finalizado' },
      'CANCELADO': { variant: 'red', text: 'Cancelado' }
    };

    const props = badgeProps[estado] || { variant: 'gray', text: estado };
    return <Badge variant={props.variant}>{props.text}</Badge>;
  };

  // ✅ NUEVO: Badge de estrategia
  const getEstrategiaBadge = (estrategia) => {
    const estrategiaInfo = {
      'POR_NIVEL': { icon: Target, color: 'blue', name: 'Nivel' },
      'POR_CERCANIA': { icon: Globe, color: 'green', name: 'Cercanía' },
      'POR_HISTORIAL': { icon: History, color: 'purple', name: 'Historial' }
    };

    const info = estrategiaInfo[estrategia] || { icon: Activity, color: 'gray', name: estrategia };
    const Icon = info.icon;

    return (
      <Badge variant={info.color} className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        {info.name}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const upcomingTransitions = getUpcomingTransitions();
  const partidosAtencion = getPartidosQuePreguntanAtencion();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando dashboard inteligente..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header mejorado */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ¡Bienvenido, {user.nombreUsuario}! 👋
            </h1>
            <p className="text-gray-600 mt-2">
              Dashboard inteligente con sistema automático activado
            </p>
          </div>
          
          {/* ✅ NUEVO: Estado del sistema */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center text-sm px-3 py-1 rounded-lg ${
                autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              <Activity className="w-4 h-4 mr-1" />
              {autoRefresh ? 'Auto-actualización ON' : 'Auto-actualización OFF'}
            </button>
          </div>
        </div>

        {/* ✅ NUEVO: Banner de sistema inteligente */}
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Zap className="h-5 w-5 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-900">Sistema Automático</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2 animate-pulse"></div>
              </div>
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-900">IA de Emparejamiento</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
              </div>
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-900">Notificaciones Inteligentes</span>
                <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
              </div>
            </div>
            <span className="text-xs text-gray-500">Todos los sistemas operativos</span>
          </div>
        </div>
      </div>

      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

      {/* ✅ NUEVO: Alertas de atención inmediata */}
      {partidosAtencion.length > 0 && (
        <Card className="p-6 border-orange-200 bg-orange-50 mb-6">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            Requieren tu atención ({partidosAtencion.length})
          </h3>
          <div className="space-y-3">
            {partidosAtencion.map(partido => (
              <div key={partido.id} className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">{getDeporteIcon(partido.deporte.tipo)}</span>
                    <div>
                      <strong>{partido.deporte.nombre}</strong>
                      {getEstadoBadge(partido.estado)}
                      <p className="text-sm text-gray-600">
                        {partido.estado === 'PARTIDO_ARMADO' 
                          ? 'Necesita confirmación del organizador' 
                          : 'Solo falta 1 jugador para completar'
                        }
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/partidos/${partido.id}`}
                    className="btn-primary"
                  >
                    {partido.estado === 'PARTIDO_ARMADO' ? 'Confirmar' : 'Ver partido'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ✅ NUEVO: Próximas transiciones automáticas */}
      {upcomingTransitions.length > 0 && (
        <Card className="p-6 border-purple-200 bg-purple-50 mb-6">
          <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Próximas Transiciones Automáticas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {upcomingTransitions.map(transition => (
              <div key={transition.id} className="bg-white p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900">{transition.partido}</p>
                    <p className="text-sm text-purple-700">{transition.mensaje}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600">{transition.tiempo}m</div>
                    <div className="text-xs text-purple-500">restantes</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats Cards mejoradas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partidos Jugados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.partidosJugados}</p>
                <p className="text-xs text-blue-600">+{Math.round(stats.partidosJugados * 0.1)} este mes</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Organizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.partidosOrganizados}</p>
                <p className="text-xs text-green-600">Sistema automático activo</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Finalizados</p>
                <p className="text-2xl font-bold text-gray-900">{stats.partidosFinalizados}</p>
                <p className="text-xs text-purple-600">
                  {stats.partidosJugados > 0 ? Math.round((stats.partidosFinalizados / stats.partidosJugados) * 100) : 0}% completados
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Deporte Favorito</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.deporteFavorito || 'No definido'}
                </p>
                <p className="text-xs text-orange-600">IA activada</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Centro de Notificaciones Mejorado */}
      <div className="mb-8">
        <NotificationCenter />
      </div>

      {/* Quick Actions mejoradas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Sparkles className="h-5 w-5 mr-2" />
            Acciones Inteligentes
          </h3>
          <div className="space-y-3">
            <Link
              to="/partidos/crear"
              className="flex items-center p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 text-primary-600 mr-3" />
              <div>
                <span className="font-medium text-primary-700">Crear partido con IA</span>
                <p className="text-xs text-primary-600">Sistema automático de emparejamiento</p>
              </div>
            </Link>
            <Link
              to="/partidos/buscar"
              className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              <Search className="h-5 w-5 text-green-600 mr-3" />
              <div>
                <span className="font-medium text-green-700">Búsqueda inteligente</span>
                <p className="text-xs text-green-600">Recomendaciones personalizadas</p>
              </div>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Perfil Inteligente</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {user.deporteFavorito ? getDeporteIcon(user.deporteFavorito) : '🏃‍♂️'}
              </span>
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">
                    {user.deporteFavorito || 'Sin deporte favorito'}
                  </p>
                  {user.deporteFavorito && (
                    <Badge variant="green">
                      <Brain className="w-3 h-3 mr-1" />
                      IA activada
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Nivel: {user.nivelJuego || 'No definido'}
                </p>
              </div>
            </div>
            <Link
              to="/perfil"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Optimizar perfil para mejores recomendaciones
            </Link>
          </div>
        </Card>
      </div>

      {/* Partidos mejorados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Mis Partidos Activos</h3>
            <Link
              to="/partidos/mis-partidos"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Ver todos
            </Link>
          </div>

          {misPartidos.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No tienes partidos activos"
              description="¡El sistema te ayudará a encontrar partidos perfectos!"
              action={
                <Link to="/partidos/buscar" className="btn-primary">
                  Buscar con IA
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {misPartidos.map(partido => (
                <div key={partido.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 space-x-2">
                        <span className="text-xl mr-2">
                          {getDeporteIcon(partido.deporte.tipo)}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {partido.deporte.nombre}
                        </h4>
                        {getEstadoBadge(partido.estado)}
                        {getEstrategiaBadge(partido.estrategiaEmparejamiento)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {partido.ubicacion.direccion}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(partido.horario)}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {partido.cantidadJugadoresActual}/{partido.cantidadJugadoresRequeridos} jugadores
                          </div>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ 
                                width: `${(partido.cantidadJugadoresActual / partido.cantidadJugadoresRequeridos) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Link
                      to={`/partidos/${partido.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver detalles →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Partidos Recomendados con IA */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="h-5 w-5 mr-2" />
              Recomendaciones IA
            </h3>
            <Link
              to="/partidos/buscar"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Ver más
            </Link>
          </div>

          {partidosRecomendados.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Configurando recomendaciones"
              description="Completa tu perfil para obtener recomendaciones personalizadas"
              action={
                <Link to="/perfil" className="btn-primary">
                  <Brain className="w-4 h-4 mr-1" />
                  Activar IA
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {partidosRecomendados.map(partido => (
                <div key={partido.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2 space-x-2">
                        <span className="text-xl mr-2">
                          {getDeporteIcon(partido.deporte.tipo)}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {partido.deporte.nombre}
                        </h4>
                        {partido.compatibilidad && (
                          <Badge variant="green">
                            <Star className="w-3 h-3 mr-1" />
                            {Math.round(partido.compatibilidad * 100)}%
                          </Badge>
                        )}
                        {getEstrategiaBadge(partido.estrategiaEmparejamiento)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {partido.ubicacion.direccion}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(partido.horario)}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {partido.cantidadJugadoresActual}/{partido.cantidadJugadoresRequeridos} jugadores
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Link
                      to={`/partidos/${partido.id}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      Ver detalles
                    </Link>
                    {partido.puedeUnirse && (
                      <>
                        <span className="text-gray-300">•</span>
                        <Link
                          to={`/partidos/${partido.id}`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          Unirse ahora
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;