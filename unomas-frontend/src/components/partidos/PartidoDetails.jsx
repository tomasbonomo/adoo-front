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
  XCircle
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

  useEffect(() => {
    loadPartido();
    // NO más intervalos ni timers
  }, [id]);

  const loadPartido = () => {
    setLoading(true);
    setError(null);

    apiService.getPartido(id)
      .then(partidoData => {
        setPartido(partidoData);
      })
      .catch(err => {
        console.error('Error cargando partido:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const joinPartido = () => {
    setActionLoading(true);
    setError(null);
    setSuccess(null);

    apiService.joinPartido(id)
      .then(response => {
        setSuccess(response.mensaje);
        // Recargar datos del partido
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
        description: 'Este partido está buscando más jugadores para completar el equipo.'
      },
      'PARTIDO_ARMADO': { 
        variant: 'blue', 
        text: 'Partido armado',
        icon: CheckCircle,
        description: 'Ya se completó el número de jugadores. Esperando confirmación.'
      },
      'CONFIRMADO': { 
        variant: 'green', 
        text: 'Confirmado',
        icon: Calendar,
        description: 'El partido está confirmado y listo para jugarse.'
      },
      'EN_JUEGO': { 
        variant: 'indigo', 
        text: 'En juego',
        icon: Trophy,
        description: 'El partido está actualmente en curso.'
      },
      'FINALIZADO': { 
        variant: 'gray', 
        text: 'Finalizado',
        icon: Trophy,
        description: 'Este partido ya terminó.'
      },
      'CANCELADO': { 
        variant: 'red', 
        text: 'Cancelado',
        icon: XCircle,
        description: 'Este partido fue cancelado.'
      }
    };

    return badgeProps[estado] || { 
      variant: 'gray', 
      text: estado, 
      icon: AlertCircle,
      description: 'Estado desconocido.'
    };
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Navegación */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Volver
        </button>
      </div>

      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      {/* Header del partido */}
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
              </p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant={estadoInfo.variant} className="mb-2">
              <IconoEstado className="w-4 h-4 mr-1" />
              {estadoInfo.text}
            </Badge>
            {partido.compatibilidad && (
              <div>
                <Badge variant="green">
                  <Star className="w-3 h-3 mr-1" />
                  {Math.round(partido.compatibilidad * 100)}% match
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center text-sm text-gray-600">
            <IconoEstado className="h-4 w-4 mr-2" />
            {estadoInfo.description}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalles del partido */}
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
                </div>
              </div>

              <div className="flex items-center">
                <Settings className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Estrategia</p>
                  <p className="text-sm text-gray-600">{partido.estrategiaEmparejamiento}</p>
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
          {/* Acciones */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones</h3>
            <div className="space-y-3">
              {canJoin() && (
                <Button onClick={joinPartido} loading={actionLoading} className="w-full" size="lg">
                  Unirse al Partido
                </Button>
              )}

              {/* NUEVO: Confirmación de participación */}
              {isParticipant() && partido.estado === 'PARTIDO_ARMADO' && (
                <div className="space-y-2">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center text-yellow-700">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="text-sm font-medium">Confirma tu participación</span>
                    </div>
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
                </div>
              )}

              {isOrganizador() && (
                <div className="space-y-2">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center text-blue-700">
                      <User className="h-5 w-5 mr-2" />
                      <span className="font-medium">Eres el organizador</span>
                    </div>
                  </div>
                  {canManage() && (
                    <>
                      {partido.estado === 'PARTIDO_ARMADO' && (
                        <Button onClick={() => changeState('CONFIRMADO')} loading={actionLoading} variant="success" className="w-full">
                          Confirmar Partido
                        </Button>
                      )}
                      <Button onClick={() => changeState('CANCELADO', 'Cancelado por el organizador')} loading={actionLoading} variant="danger" className="w-full">
                        Cancelar Partido
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

          {/* Información adicional */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Información</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <span className="font-medium">Creado:</span> {formatDate(partido.createdAt).short}
              </div>
              <div>
                <span className="font-medium">ID del partido:</span> #{partido.id}
              </div>
              {partido.estrategiaEmparejamiento === 'POR_NIVEL' && (
                <div className="p-2 bg-amber-50 rounded text-amber-700">
                  <p className="text-xs">
                    Este partido usa emparejamiento por nivel de habilidad
                  </p>
                </div>
              )}
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