import React, { useEffect, useState } from 'react';
import { User, Users, Badge, Crown } from 'lucide-react';
import apiService from '../../services/api';
import { usePartido } from '../../contexts/PartidoContext';

const JugadoresPartido = ({ partido, partidoId }) => {
  const [jugadores, setJugadores] = useState(partido.jugadores || []);
  const [organizador, setOrganizador] = useState(partido.organizador);
  const [cantidadJugadoresActual, setCantidadJugadoresActual] = useState(partido.cantidadJugadoresActual);
  const [loading, setLoading] = useState(false);

  const { lastUpdate } = usePartido();

  // ✅ MEJORADO: Actualizar cuando hay cambios en el partido
  useEffect(() => {
    if (lastUpdate[partidoId]) {
      updateJugadores();
    }
  }, [partidoId, lastUpdate[partidoId]]);

  // ✅ NUEVO: También actualizar cada 30 segundos para cambios de otros usuarios
  useEffect(() => {
    const interval = setInterval(() => {
      updateJugadores();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [partidoId]);

  const updateJugadores = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPartido(partidoId);
      
      // Solo actualizar si hay cambios reales
      if (data.cantidadJugadoresActual !== cantidadJugadoresActual ||
          data.jugadores.length !== jugadores.length) {
        setJugadores(data.jugadores);
        setOrganizador(data.organizador);
        setCantidadJugadoresActual(data.cantidadJugadoresActual);
      }
    } catch (error) {
      console.error('Error actualizando jugadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSlotsVacios = () => {
    const totalSlots = partido.cantidadJugadoresRequeridos;
    const jugadoresCount = jugadores.length;
    return Math.max(0, totalSlots - jugadoresCount);
  };

  const getPlayerAvatar = (jugador, isOrganizador = false) => {
    const bgColor = isOrganizador ? 'bg-blue-200' : 'bg-gray-200';
    const textColor = isOrganizador ? 'text-blue-600' : 'text-gray-600';
    
    return (
      <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center mr-3 relative`}>
        <User className={`h-5 w-5 ${textColor}`} />
        {isOrganizador && (
          <Crown className="h-3 w-3 text-yellow-500 absolute -top-1 -right-1" />
        )}
      </div>
    );
  };

  const getNivelBadge = (nivel) => {
    if (!nivel) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
          Sin nivel
        </span>
      );
    }
    
    const nivelColors = {
      'PRINCIPIANTE': 'bg-green-100 text-green-800',
      'INTERMEDIO': 'bg-yellow-100 text-yellow-800', 
      'AVANZADO': 'bg-red-100 text-red-800'
    };
    
    const colorClass = nivelColors[nivel] || 'bg-gray-100 text-gray-800';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {nivel}
      </span>
    );
  };

  return (
    <div className="space-y-3 max-w-full overflow-hidden">
      {/* Header con progreso */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-medium text-gray-900">
          Jugadores ({cantidadJugadoresActual}/{partido.cantidadJugadoresRequeridos})
        </h4>
        {loading && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              cantidadJugadoresActual >= partido.cantidadJugadoresRequeridos 
                ? 'bg-green-600' 
                : 'bg-blue-600'
            }`}
            style={{ 
              width: `${Math.min((cantidadJugadoresActual / partido.cantidadJugadoresRequeridos) * 100, 100)}%` 
            }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{partido.cantidadJugadoresRequeridos}</span>
        </div>
      </div>

      {/* Organizador */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          {getPlayerAvatar(organizador, true)}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-gray-900">{organizador.nombreUsuario}</p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                    Organizador
                  </span>
                </div>
                {organizador.deporteFavorito && (
                  <p className="text-xs text-blue-600">
                    Favorito: {organizador.deporteFavorito}
                  </p>
                )}
              </div>
              <div className="ml-4">
                {getNivelBadge(organizador.nivelJuego)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Otros jugadores */}
      {jugadores
        .filter(jugador => jugador.id !== organizador.id)
        .map((jugador, index) => (
          <div 
            key={jugador.id} 
            className="p-3 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-300 hover:bg-gray-100"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center flex-1">
                {getPlayerAvatar(jugador)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{jugador.nombreUsuario}</p>
                        <span className="text-xs text-gray-500">
                          Jugador #{index + 2}
                        </span>
                      </div>
                      {jugador.deporteFavorito && (
                        <p className="text-xs text-gray-600">
                          Favorito: {jugador.deporteFavorito}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      {getNivelBadge(jugador.nivelJuego)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      {/* Espacios vacíos */}
      {Array.from({ length: getSlotsVacios() }).map((_, index) => (
        <div 
          key={`empty-${index}`} 
          className="p-3 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 transition-all duration-300"
        >
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-gray-400 font-medium">Esperando jugador...</p>
              <p className="text-xs text-gray-300">Slot disponible</p>
            </div>
          </div>
        </div>
      ))}

      {/* Estado del partido */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Estado del partido:</span>
          <span className={`font-medium ${
            cantidadJugadoresActual >= partido.cantidadJugadoresRequeridos 
              ? 'text-green-600' 
              : 'text-blue-600'
          }`}>
            {cantidadJugadoresActual >= partido.cantidadJugadoresRequeridos 
              ? '✅ Completo' 
              : `🔍 Faltan ${partido.cantidadJugadoresRequeridos - cantidadJugadoresActual} jugadores`
            }
          </span>
        </div>
        
        {/* Indicador de actualización en tiempo real */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Actualización automática</span>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>En vivo</span>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {jugadores.length > 1 && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <h5 className="text-sm font-medium text-blue-900 mb-2">📊 Estadísticas del equipo</h5>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-blue-600">Niveles:</span>
              <div className="mt-1">
                {['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO'].map(nivel => {
                  const count = jugadores.filter(j => j.nivelJuego === nivel).length;
                  return count > 0 ? (
                    <div key={nivel} className="flex justify-between">
                      <span>{nivel}:</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div>
              <span className="text-blue-600">Progreso:</span>
              <div className="mt-1">
                <div className="text-lg font-bold text-blue-900">
                  {Math.round((cantidadJugadoresActual / partido.cantidadJugadoresRequeridos) * 100)}%
                </div>
                <div className="text-blue-700">completado</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JugadoresPartido;