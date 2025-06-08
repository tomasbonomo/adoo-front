import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
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
  Activity
} from 'lucide-react';
import { Card, Loading, ErrorMessage, EmptyState, Badge } from '../common';
import apiService from '../../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [misPartidos, setMisPartidos] = useState([]);
  const [partidosRecomendados, setPartidosRecomendados] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    setLoading(true);
    setError(null);

    // Cargar datos en paralelo
    Promise.all([
      loadUserStats(),
      loadMisPartidos(),
      loadPartidosRecomendados()
    ])
    .then(() => {
      setLoading(false);
    })
    .catch(err => {
      console.error('Error cargando dashboard:', err);
      setError(apiService.handleApiError(err));
      setLoading(false);
    });
  };

  const loadUserStats = () => {
    return apiService.getUserStats()
      .then(userStats => {
        setStats(userStats);
      })
      .catch(err => {
        console.error('Error cargando estadísticas:', err);
        // No es crítico, continuar
      });
  };

  const loadMisPartidos = () => {
    return apiService.getMyPartidos()
      .then(partidos => {
        // Filtrar partidos activos/futuros
        const partidosActivos = partidos.filter(p => 
          ['NECESITAMOS_JUGADORES', 'PARTIDO_ARMADO', 'CONFIRMADO', 'EN_JUEGO'].includes(p.estado)
        );
        setMisPartidos(partidosActivos.slice(0, 3)); // Solo los primeros 3
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

  const getDeporteIcon = (tipoDeporte) => {
    switch(tipoDeporte) {
      case 'FUTBOL': return '⚽';
      case 'BASQUET': return '🏀';
      case 'VOLEY': return '🏐';
      case 'TENIS': return '🎾';
      default: return '🏃‍♂️';
    }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {user.nombreUsuario}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          ¿Listo para tu próximo partido?
        </p>
      </div>

      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

      {/* Stats Cards */}
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
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <Link
              to="/partidos/crear"
              className="flex items-center p-3 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200"
            >
              <Plus className="h-5 w-5 text-primary-600 mr-3" />
              <span className="font-medium text-primary-700">Crear nuevo partido</span>
            </Link>
            <Link
              to="/partidos/buscar"
              className="flex items-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
            >
              <Search className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium text-green-700">Buscar partidos</span>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu Perfil</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-2xl mr-3">
                {user.deporteFavorito ? getDeporteIcon(user.deporteFavorito) : '🏃‍♂️'}
              </span>
              <div>
                <p className="font-medium text-gray-900">
                  {user.deporteFavorito || 'Sin deporte favorito'}
                </p>
                <p className="text-sm text-gray-600">
                  Nivel: {user.nivelJuego || 'No definido'}
                </p>
              </div>
            </div>
            <Link
              to="/perfil"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              Editar perfil
            </Link>
          </div>
        </Card>
      </div>

      {/* Mis Partidos */}
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
              description="¡Únete a un partido o crea uno nuevo!"
              action={
                <Link to="/partidos/buscar" className="btn-primary">
                  Buscar Partidos
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {misPartidos.map(partido => (
                <div key={partido.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">
                          {getDeporteIcon(partido.deporte.tipo)}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {partido.deporte.nombre}
                        </h4>
                        {getEstadoBadge(partido.estado)}
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

        {/* Partidos Recomendados */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Partidos Recomendados</h3>
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
              title="No hay recomendaciones"
              description="Actualiza tu perfil para obtener mejores recomendaciones"
              action={
                <Link to="/perfil" className="btn-primary">
                  Actualizar Perfil
                </Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {partidosRecomendados.map(partido => (
                <div key={partido.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-xl mr-2">
                          {getDeporteIcon(partido.deporte.tipo)}
                        </span>
                        <h4 className="font-medium text-gray-900">
                          {partido.deporte.nombre}
                        </h4>
                        {partido.compatibilidad && (
                          <Badge variant="green" className="ml-2">
                            {Math.round(partido.compatibilidad * 100)}% match
                          </Badge>
                        )}
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
                      <span className="text-gray-300">•</span>
                    )}
                    {partido.puedeUnirse && (
                      <Link
                        to={`/partidos/${partido.id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        Unirse
                      </Link>
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