import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDeporteIcon } from  '../../config/config';
import { 
  Calendar,
  MapPin, 
  Clock, 
  Users, 
  Filter,
  Trophy,
  User,
  Star,
  Eye,
  Settings
} from 'lucide-react';
import { Card, Loading, ErrorMessage, EmptyState, Badge, Button } from '../common';
import apiService from '../../services/api';

const MisPartidos = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');

  useEffect(() => {
    loadMisPartidos();
  }, []);

  const loadMisPartidos = () => {
    setLoading(true);
    setError(null);

    apiService.getMyPartidos()
      .then(partidosData => {
        // Ordenar por fecha descendente (más recientes primero)
        const partidosOrdenados = partidosData.sort((a, b) => 
          new Date(b.horario) - new Date(a.horario)
        );
        setPartidos(partidosOrdenados);
      })
      .catch(err => {
        console.error('Error cargando mis partidos:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setLoading(false);
      });
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
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isPast = date < now;

    return {
      full: date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      short: date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isToday,
      isPast
    };
  };

  const filtrarPartidos = () => {
    return partidos.filter(partido => {
      const cumpleEstado = filtroEstado === 'TODOS' || partido.estado === filtroEstado;
      const cumpleTipo = filtroTipo === 'TODOS' || 
        (filtroTipo === 'ORGANIZADOS' && partido.organizador) ||
        (filtroTipo === 'PARTICIPANDO' && !partido.organizador);
      
      return cumpleEstado && cumpleTipo;
    });
  };

  const getEstadisticasRapidas = () => {
    const total = partidos.length;
    const activos = partidos.filter(p => 
      ['NECESITAMOS_JUGADORES', 'PARTIDO_ARMADO', 'CONFIRMADO', 'EN_JUEGO'].includes(p.estado)
    ).length;
    const finalizados = partidos.filter(p => p.estado === 'FINALIZADO').length;
    const cancelados = partidos.filter(p => p.estado === 'CANCELADO').length;

    return { total, activos, finalizados, cancelados };
  };

  const partidosFiltrados = filtrarPartidos();
  const stats = getEstadisticasRapidas();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando tus partidos..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mis Partidos
        </h1>
        <p className="text-gray-600">
          Gestiona todos los partidos en los que participas u organizas
        </p>
      </div>

      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Trophy className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Activos</p>
              <p className="text-xl font-bold text-gray-900">{stats.activos}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Finalizados</p>
              <p className="text-xl font-bold text-gray-900">{stats.finalizados}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg mr-3">
              <Users className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Cancelados</p>
              <p className="text-xl font-bold text-gray-900">{stats.cancelados}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Filter className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>
            
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="NECESITAMOS_JUGADORES">Buscando jugadores</option>
              <option value="PARTIDO_ARMADO">Partido armado</option>
              <option value="CONFIRMADO">Confirmado</option>
              <option value="EN_JUEGO">En juego</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>

            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1"
            >
              <option value="TODOS">Todos los tipos</option>
              <option value="ORGANIZADOS">Que organizo</option>
              <option value="PARTICIPANDO">En los que participo</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            {partidosFiltrados.length} de {partidos.length} partidos
          </div>
        </div>
      </Card>

      {/* Lista de partidos */}
      {partidosFiltrados.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No hay partidos"
          description={
            partidos.length === 0 
              ? "Aún no has participado en ningún partido. ¡Únete a uno o crea el tuyo!"
              : "No hay partidos que coincidan con los filtros seleccionados."
          }
          action={
            partidos.length === 0 ? (
              <div className="flex space-x-4">
                <Link to="/partidos/buscar" className="btn-primary">
                  Buscar Partidos
                </Link>
                <Link to="/partidos/crear" className="btn-secondary">
                  Crear Partido
                </Link>
              </div>
            ) : (
              <Button onClick={() => {
                setFiltroEstado('TODOS');
                setFiltroTipo('TODOS');
              }}>
                Limpiar Filtros
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-4">
          {partidosFiltrados.map(partido => {
            const fechaInfo = formatDate(partido.horario);
            const esOrganizador = true; // Simplificado - en implementación real verificar con el usuario actual
            
            return (
              <Card key={partido.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">
                        {getDeporteIcon(partido.deporte.tipo)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {partido.deporte.nombre}
                          </h3>
                          {getEstadoBadge(partido.estado)}
                          {esOrganizador && (
                            <Badge variant="blue">
                              <User className="w-3 h-3 mr-1" />
                              Organizador
                            </Badge>
                          )}
                          {fechaInfo.isToday && (
                            <Badge variant="green">¡Hoy!</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          Organizado por {partido.organizador.nombreUsuario}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{partido.ubicacion.direccion}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className={fechaInfo.isPast ? 'text-gray-500' : ''}>
                          {fechaInfo.short}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        <span>
                          {partido.cantidadJugadoresActual}/{partido.cantidadJugadoresRequeridos} jugadores
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso de jugadores */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Progreso de jugadores</span>
                        <span>
                          {Math.round((partido.cantidadJugadoresActual / partido.cantidadJugadoresRequeridos) * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            partido.cantidadJugadoresActual >= partido.cantidadJugadoresRequeridos
                              ? 'bg-green-600'
                              : 'bg-blue-600'
                          }`}
                          style={{ 
                            width: `${Math.min((partido.cantidadJugadoresActual / partido.cantidadJugadoresRequeridos) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        <span>Estrategia: {partido.estrategiaEmparejamiento}</span>
                        {partido.ubicacion.zona && (
                          <span className="ml-3">• Zona: {partido.ubicacion.zona}</span>
                        )}
                        <span className="ml-3">• ID: #{partido.id}</span>
                      </div>

                      <div className="flex space-x-2">
                        <Link
                          to={`/partidos/${partido.id}`}
                          className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver detalles
                        </Link>
                        
                        {esOrganizador && ['NECESITAMOS_JUGADORES', 'PARTIDO_ARMADO'].includes(partido.estado) && (
                          <>
                            <span className="text-gray-300">•</span>
                            <Link
                              to={`/partidos/${partido.id}/configurar`}
                              className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              <Settings className="w-4 h-4 mr-1" />
                              Configurar
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Acciones rápidas */}
      {partidosFiltrados.length > 0 && (
        <div className="mt-8 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/partidos/crear" className="btn-primary">
              Crear Nuevo Partido
            </Link>
            <Link to="/partidos/buscar" className="btn-secondary">
              Buscar Más Partidos
            </Link>
            <Button 
              variant="secondary" 
              onClick={loadMisPartidos}
              loading={loading}
            >
              Actualizar Lista
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MisPartidos;