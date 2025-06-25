import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getDeporteIcon } from  '../../config/config';
import { 
  ArrowLeft,
  MapPin, 
  Clock, 
  Users, 
  Star,
  Calendar,
  Timer,
  User,
  Settings,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  Zap,
  Activity,
  Target,
  Globe,
  History,
  BarChart3,
  Bell,
  RefreshCw
} from 'lucide-react';
import { Card, Loading, ErrorMessage, SuccessMessage, Button, Badge } from '../common';
import apiService from '../../services/api';
import ComentariosSection from '../comentarios/ComentariosSection';
import JugadoresPartido from './JugadoresPartido';

const PartidoDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [partido, setPartido] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const estadosNoCancelables = ['EN_JUEGO', 'FINALIZADO', 'CANCELADO'];

  useEffect(() => {
    loadPartido();
    
    // ✅ NUEVO: Auto-refresh cada 30 segundos para captar cambios automáticos
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadPartidoSilently();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, autoRefresh]);

  const loadPartido = () => {
    setLoading(true);
    setError(null);
    loadPartidoData();
  };

  // ✅ NUEVO: Carga silenciosa para auto-refresh
  const loadPartidoSilently = () => {
    loadPartidoData(true);
  };

  const loadPartidoData = (silent = false) => {
    apiService.getPartido(id)
      .then(partidoData => {
        // ✅ DETECTAR CAMBIOS para notificar al usuario
        if (partido && partidoData.estado !== partido.estado) {
          setSuccess(`Estado cambiado automáticamente: ${partidoData.estado}`);
        }
        
        setPartido(partidoData);
        setLastUpdate(new Date());
      })
      .catch(err => {
        console.error('Error cargando partido:', err);
        if (!silent) {
          setError(apiService.handleApiError(err));
        }
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  };

  const joinPartido = () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    apiService.joinPartido(id)
      .then(response => {
        setSuccess(response.mensaje);
        loadPartido();
      })
      .catch(err => {
        console.error('Error uniéndose al partido:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const changeState = (newState, motivo = '') => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    const stateData = { nuevoEstado: newState, motivo };

    apiService.changePartidoState(id, stateData)
      .then(response => {
        setSuccess(response.mensaje);
        loadPartido();
      })
      .catch(err => {
        console.error('Error cambiando estado:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setActionLoading(false);
      });
  };

  const confirmarParticipacion = () => {
    setActionLoading(true);
    apiService.confirmarParticipacion(id)
      .then(response => {
        setSuccess(response.mensaje);
        loadPartido();
      })
      .catch(err => setError(apiService.handleApiError(err)))
      .finally(() => setActionLoading(false));
  };

  const canComment = () => {
    return (isParticipant() || isOrganizador()) && partido.estado === 'FINALIZADO';
  };

  const getEstadoBadge = (estado) => {
    const badgeProps = {
      'NECESITAMOS_JUGADORES': { 
        variant: 'yellow', 
        text: 'Buscando jugadores',
        icon: Users,
        description: 'Este partido está buscando más jugadores para completar el equipo.',
        autoNext: 'Se completará automáticamente cuando se unan suficientes jugadores'
      },
      'PARTIDO_ARMADO': { 
        variant: 'blue', 
        text: 'Partido armado',
        icon: CheckCircle,
        description: 'Ya se completó el número de jugadores. Esperando confirmación.',
        autoNext: 'Requiere confirmación manual del organizador'
      },
      'CONFIRMADO': { 
        variant: 'green', 
        text: 'Confirmado',
        icon: Calendar,
        description: 'El partido está confirmado y listo para jugarse.',
        autoNext: 'Comenzará automáticamente a la hora programada'
      },
      'EN_JUEGO': { 
        variant: 'indigo', 
        text: 'En juego',
        icon: Trophy,
        description: 'El partido está actualmente en curso.',
        autoNext: 'Finalizará automáticamente después de la duración programada'
      },
      'FINALIZADO': { 
        variant: 'gray', 
        text: 'Finalizado',
        icon: Trophy,
        description: 'Este partido ya terminó.',
        autoNext: 'Estado final - no hay más transiciones'
      },
      'CANCELADO': { 
        variant: 'red', 
        text: 'Cancelado',
        icon: XCircle,
        description: 'Este partido fue cancelado.',
        autoNext: 'Estado final - no hay más transiciones'
      }
    };

    return badgeProps[estado] || { 
      variant: 'gray', 
      text: estado, 
      icon: AlertCircle,
      description: 'Estado desconocido.',
      autoNext: 'Sin información de transición'
    };
  };

  // ✅ NUEVO: Obtener icono de estrategia
  const getEstrategiaIcon = (estrategia) => {
    const iconos = {
      'POR_NIVEL': Target,
      'POR_CERCANIA': Globe,
      'POR_HISTORIAL': History
    };
    return iconos[estrategia] || BarChart3;
  };

  // ✅ NUEVO: Calcular tiempo hasta próxima transición automática
  const getTimeToNextTransition = () => {
    if (!partido) return null;
    
    const now = new Date();
    const partidoDate = new Date(partido.horario);
    
    if (partido.estado === 'CONFIRMADO') {
      const timeDiff = partidoDate - now;
      if (timeDiff > 0) {
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        return {
          type: 'start',
          time: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
          message: 'hasta el inicio automático'
        };
      }
    }
    
    if (partido.estado === 'EN_JUEGO') {
      const endTime = new Date(partidoDate.getTime() + partido.duracion * 60 * 1000);
      const timeDiff = endTime - now;
      if (timeDiff > 0) {
        const minutes = Math.floor(timeDiff / (1000 * 60));
        return {
          type: 'end',
          time: `${minutes}m`,
          message: 'hasta la finalización automática'
        };
      }
    }
    
    return null;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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
      })
    };
  };

  const isOrganizador = () => {
    return user && partido && user.id === partido.organizador.id;
  };

  const isParticipant = () => {
    return user && partido && partido.jugadores.some(j => j.id === user.id);
  };

  const canJoin = () => {
    return user && partido && partido.puedeUnirse && !isOrganizador() && !isParticipant();
  };

  const canManage = () => {
    return isOrganizador() && ['NECESITAMOS_JUGADORES', 'PARTIDO_ARMADO'].includes(partido.estado);
  };

  const handleCancelar = () => {
    if (estadosNoCancelables.includes(partido.estado)) {
      setError('No se puede cancelar un partido que está EN JUEGO, FINALIZADO o ya CANCELADO.');
      return;
    }
    // Aquí podrías pedir motivo si quieres
    changeState('CANCELADO');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando partido..." />
      </div>
    );
  }

  if (!partido) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Partido no encontrado</h2>
          <Button onClick={() => navigate('/partidos/buscar')}>
            Volver a buscar partidos
          </Button>
        </div>
      </div>
    );
  }

  const estadoInfo = getEstadoBadge(partido.estado);
  const fechaInfo = formatDate(partido.horario);
  const IconoEstado = estadoInfo.icon;
  const IconoEstrategia = getEstrategiaIcon(partido.estrategiaEmparejamiento);
  const nextTransition = getTimeToNextTransition();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
        
        {/* ✅ NUEVO: Controles de auto-refresh */}
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
          <button
            onClick={loadPartido}
            className="flex items-center text-sm px-3 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualizar
          </button>
        </div>
      </div>

      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {/* ✅ NUEVO: Banner de transición automática */}
      {nextTransition && (
        <Card className="p-4 mb-6 bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="font-medium text-purple-900">
                  Transición Automática: {nextTransition.time} {nextTransition.message}
                </p>
                <p className="text-sm text-purple-700">
                  El sistema cambiará el estado automáticamente
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-purple-600">{nextTransition.time}</div>
              <div className="text-xs text-purple-500">restante</div>
            </div>
          </div>
        </Card>
      )}

      {/* Header del partido mejorado */}
      <Card className="p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <span className="text-4xl mr-4">{getDeporteIcon(partido.deporte.tipo)}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Partido de {partido.deporte.nombre}
              </h1>
              <p className="text-gray-600">
                Organizado por {partido.organizador.nombreUsuario}
                {partido.organizador.nivelJuego && (
                  <span className="ml-2 text-sm">
                    • Nivel: {partido.organizador.nivelJuego}
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="text-right space-y-2">
            <Badge variant={estadoInfo.variant} className="mb-2">
              <IconoEstado className="w-4 h-4 mr-1" />
              {estadoInfo.text}
            </Badge>
            <div>
              <Badge variant="blue" className="mb-1">
                <IconoEstrategia className="w-3 h-3 mr-1" />
                {partido.estrategiaEmparejamiento}
              </Badge>
            </div>
            {partido.compatibilidad && (
              <div>
                <Badge variant="green">
                  <Star className="w-3 h-3 mr-1" />
                  {Math.round(partido.compatibilidad * 100)}% compatible
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* ✅ NUEVO: Información de estado automático */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <IconoEstado className="h-4 w-4 mr-2" />
              <div>
                <p className="font-medium">{estadoInfo.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Próxima transición: {estadoInfo.autoNext}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Última actualización: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles del partido mejorados */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles del Partido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Fecha y hora</p>
                  <p className="text-sm text-gray-600">{fechaInfo.full}</p>
                </div>
              </div>

              <div className="flex items-center">
                <Timer className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Duración</p>
                  <p className="text-sm text-gray-600">{partido.duracion} minutos</p>
                </div>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Jugadores</p>
                  <p className="text-sm text-gray-600">
                    {partido.cantidadJugadoresActual} de {partido.cantidadJugadoresRequeridos}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{ 
                        width: `${(partido.cantidadJugadoresActual / partido.cantidadJugadoresRequeridos) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <IconoEstrategia className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Estrategia</p>
                  <p className="text-sm text-gray-600">{partido.estrategiaEmparejamiento}</p>
                  {partido.compatibilidad && (
                    <p className="text-xs text-green-600 mt-1">
                      Compatibilidad: {Math.round(partido.compatibilidad * 100)}%
                    </p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Ubicación */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
            <div className="flex items-start">
              <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
              <div>
                <p className="font-medium text-gray-900">{partido.ubicacion.direccion}</p>
                {partido.ubicacion.zona && (
                  <p className="text-sm text-gray-600 mt-1">Zona: {partido.ubicacion.zona}</p>
                )}
                {partido.ubicacion.latitud && partido.ubicacion.longitud && (
                  <p className="text-xs text-gray-500 mt-2">
                    Coordenadas: {partido.ubicacion.latitud}, {partido.ubicacion.longitud}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Sistema automático */}
          <Card className="p-6 bg-purple-50 border-purple-200">
            <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Sistema Automático
            </h3>
            <div className="space-y-3 text-sm text-purple-700">
              <div className="flex items-center justify-between">
                <span>Transiciones de estado</span>
                <Badge variant="purple">Automático</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Notificaciones</span>
                <Badge variant="purple">Inteligentes</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Emparejamiento</span>
                <Badge variant="purple">{partido.estrategiaEmparejamiento}</Badge>
              </div>
            </div>
            <div className="mt-4 text-xs text-purple-600">
              Este partido utiliza el sistema automático de UnoMas para gestionar estados y notificaciones.
            </div>
          </Card>

          {/* Reglas del deporte */}
          {partido.deporte.reglasBasicas && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reglas del Deporte</h3>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">
                  {partido.deporte.reglasBasicas}
                </pre>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Acciones mejoradas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              {canJoin() && (
                <Button onClick={joinPartido} loading={actionLoading} className="w-full" size="lg">
                  <Users className="w-4 h-4 mr-2" />
                  Unirse al Partido
                </Button>
              )}

              {/* Confirmación de participación */}
              {isParticipant() && partido.estado === 'PARTIDO_ARMADO' && (
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center text-yellow-700">
                      <Bell className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Confirma tu participación</span>
                    </div>
                    <p className="text-xs text-yellow-600 mt-1">
                      El partido se confirmará automáticamente cuando todos confirmen
                    </p>
                  </div>
                  <Button onClick={confirmarParticipacion} loading={actionLoading} variant="success" className="w-full">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirmar Participación
                  </Button>
                </div>
              )}

              {isParticipant() && !isOrganizador() && partido.estado !== 'PARTIDO_ARMADO' && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span className="font-medium">Ya estás en este partido</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Recibirás notificaciones automáticas de cambios
                  </p>
                </div>
              )}

              {isOrganizador() && (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">Eres el organizador</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Gestiona el partido con transiciones automáticas
                    </p>
                  </div>
                  {canManage() && (
                    <>
                      {partido.estado === 'PARTIDO_ARMADO' && (
                        <Button onClick={() => changeState('CONFIRMADO')} loading={actionLoading} variant="success" className="w-full">
                          Confirmar Partido
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        disabled={estadosNoCancelables.includes(partido.estado) || actionLoading}
                        onClick={handleCancelar}
                        className="mt-4"
                      >
                        Cancelar partido
                      </Button>
                    </>
                  )}
                </div>
              )}

              {!user && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Inicia sesión para unirte al partido</p>
                  <Link to="/login" className="btn-primary w-full text-center block">Iniciar Sesión</Link>
                </div>
              )}
            </div>
          </Card>

          {/* Jugadores */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Jugadores ({partido.cantidadJugadoresActual}/{partido.cantidadJugadoresRequeridos})
            </h3>
            <JugadoresPartido partido={partido} partidoId={partido.id} />
          </Card>

          {/* Información técnica */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Técnica</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span> {formatDate(partido.createdAt).short}
              </div>
              <div>
                <span className="font-medium">ID del partido:</span> #{partido.id}
              </div>
              <div>
                <span className="font-medium">Sistema:</span> Automático v2.0
              </div>
              <div>
                <span className="font-medium">Auto-refresh:</span> {autoRefresh ? 'Activo' : 'Inactivo'}
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Este partido utiliza el sistema inteligente de UnoMas con transiciones automáticas 
                  de estado y notificaciones en tiempo real.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Comentarios para partidos finalizados */}
      {partido.estado === 'FINALIZADO' && (
        <ComentariosSection partidoId={partido.id} canComment={canComment()} />
      )}
    </div>
  );
};

export default PartidoDetails;