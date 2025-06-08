import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  Users,
  Trophy,
  Activity,
  TrendingUp,
  MapPin,
  Star,
  Calendar,
  Target
} from 'lucide-react';
import { Card, Loading, ErrorMessage, EmptyState } from '../common';
import apiService from '../../services/api';

const Estadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const loadEstadisticas = () => {
    setLoading(true);
    setError(null);

    apiService.getGeneralStats()
      .then(estadisticas => {
        setStats(estadisticas);
      })
      .catch(err => {
        console.error('Error cargando estadísticas:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const getDeporteIcon = (deporte) => {
    switch(deporte) {
      case 'FUTBOL': return '⚽';
      case 'BASQUET': return '🏀';
      case 'VOLEY': return '🏐';
      case 'TENIS': return '🎾';
      default: return '🏃‍♂️';
    }
  };

  const formatPercentage = (value, total) => {
    if (!total || total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando estadísticas..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage error={error} onClose={() => setError(null)} />
        <EmptyState
          icon={BarChart3}
          title="Error al cargar estadísticas"
          description="No se pudieron cargar las estadísticas del sistema"
          action={
            <button
              onClick={loadEstadisticas}
              className="btn-primary"
            >
              Intentar de nuevo
            </button>
          }
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EmptyState
          icon={BarChart3}
          title="Sin estadísticas disponibles"
          description="No hay datos suficientes para mostrar estadísticas"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Estadísticas Generales
        </h1>
        <p className="text-gray-600">
          Resumen de actividad y métricas del sistema UnoMas
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsuarios}</p>
              <p className="text-sm text-green-600">
                {stats.usuariosActivos} activos
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Trophy className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Partidos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPartidos}</p>
              <p className="text-sm text-blue-600">
                {stats.partidosActivos} activos
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio Jugadores</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.promedioJugadoresPorPartido ? stats.promedioJugadoresPorPartido.toFixed(1) : '0'}
              </p>
              <p className="text-sm text-gray-600">por partido</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Star className="h-8 w-8 text-amber-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Deporte Popular</p>
              <p className="text-lg font-bold text-gray-900">
                {stats.deporteMasPopular || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">más jugado</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Distribución por deportes */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Usuarios por Deporte</h3>
          <div className="space-y-4">
            {Object.entries(stats.usuariosPorDeporte || {}).map(([deporte, cantidad]) => (
              <div key={deporte} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">{getDeporteIcon(deporte)}</span>
                  <span className="font-medium text-gray-900">{deporte}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{cantidad}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({formatPercentage(cantidad, stats.totalUsuarios)})
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(stats.usuariosPorDeporte || {}).length === 0 && (
              <p className="text-gray-500 text-center py-4">Sin datos disponibles</p>
            )}
          </div>
        </Card>

        {/* Distribución por nivel */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Usuarios por Nivel</h3>
          <div className="space-y-4">
            {Object.entries(stats.usuariosPorNivel || {}).map(([nivel, cantidad]) => {
              const colorClass = {
                'PRINCIPIANTE': 'bg-green-100 text-green-800',
                'INTERMEDIO': 'bg-yellow-100 text-yellow-800',
                'AVANZADO': 'bg-red-100 text-red-800'
              }[nivel] || 'bg-gray-100 text-gray-800';

              return (
                <div key={nivel} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} mr-3`}>
                      {nivel}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{cantidad}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({formatPercentage(cantidad, stats.usuariosActivos)})
                    </span>
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.usuariosPorNivel || {}).length === 0 && (
              <p className="text-gray-500 text-center py-4">Sin datos disponibles</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estados de partidos */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Estados de Partidos</h3>
          <div className="space-y-4">
            {Object.entries(stats.partidosPorEstado || {}).map(([estado, cantidad]) => {
              const stateInfo = {
                'NECESITAMOS_JUGADORES': { color: 'text-yellow-600', bg: 'bg-yellow-100', name: 'Buscando jugadores' },
                'PARTIDO_ARMADO': { color: 'text-blue-600', bg: 'bg-blue-100', name: 'Partido armado' },
                'CONFIRMADO': { color: 'text-green-600', bg: 'bg-green-100', name: 'Confirmado' },
                'EN_JUEGO': { color: 'text-indigo-600', bg: 'bg-indigo-100', name: 'En juego' },
                'FINALIZADO': { color: 'text-gray-600', bg: 'bg-gray-100', name: 'Finalizado' },
                'CANCELADO': { color: 'text-red-600', bg: 'bg-red-100', name: 'Cancelado' }
              }[estado] || { color: 'text-gray-600', bg: 'bg-gray-100', name: estado };

              return (
                <div key={estado} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${stateInfo.bg} mr-3`}></div>
                    <span className="font-medium text-gray-900">{stateInfo.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{cantidad}</span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({formatPercentage(cantidad, stats.totalPartidos)})
                    </span>
                  </div>
                </div>
              );
            })}
            {Object.keys(stats.partidosPorEstado || {}).length === 0 && (
              <p className="text-gray-500 text-center py-4">Sin datos disponibles</p>
            )}
          </div>
        </Card>

        {/* Métricas adicionales */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Métricas Adicionales</h3>
          <div className="space-y-6">
            {/* Zona más activa */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-medium text-gray-900">Zona más activa</span>
              </div>
              <span className="text-lg font-bold text-primary-600">
                {stats.zonaMasActiva || 'N/A'}
              </span>
            </div>

            {/* Ratio de finalización */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Ratio de finalización</span>
                <span className="text-lg font-bold text-green-600">
                  {formatPercentage(stats.partidosFinalizados, stats.totalPartidos)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full"
                  style={{ 
                    width: `${(stats.partidosFinalizados / stats.totalPartidos) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Ratio de cancelación */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Ratio de cancelación</span>
                <span className="text-lg font-bold text-red-600">
                  {formatPercentage(stats.partidosCancelados, stats.totalPartidos)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full"
                  style={{ 
                    width: `${(stats.partidosCancelados / stats.totalPartidos) * 100}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Usuarios activos vs total */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Usuarios activos</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatPercentage(stats.usuariosActivos, stats.totalUsuarios)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ 
                    width: `${(stats.usuariosActivos / stats.totalUsuarios) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer con actualización */}
      <div className="mt-8 text-center">
        <button
          onClick={loadEstadisticas}
          className="btn-secondary"
          disabled={loading}
        >
          <Activity className="w-4 h-4 mr-2" />
          Actualizar Estadísticas
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Última actualización: {new Date().toLocaleString('es-ES')}
        </p>
      </div>
    </div>
  );
};

export default Estadisticas;