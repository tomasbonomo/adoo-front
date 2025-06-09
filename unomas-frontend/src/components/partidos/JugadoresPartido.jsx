import React, { useEffect, useState } from 'react';
import { User, Users, Badge } from 'lucide-react';
import apiService from '../../services/api';

const JugadoresPartido = ({ partido, partidoId }) => {
  const [jugadores, setJugadores] = useState(partido.jugadores || []);
  const [organizador, setOrganizador] = useState(partido.organizador);

  useEffect(() => {
    // Cada 5s actualiza SOLO los jugadores
    const intervalId = setInterval(() => {
      apiService.getPartido(partidoId).then(data => {
        setJugadores(data.jugadores);
        setOrganizador(data.organizador);
      });
    }, 5000);

    return () => clearInterval(intervalId);
  }, [partidoId]);

  // Usá partido.cantidadJugadoresRequeridos o similar para los slots vacíos
  return (
    <div className="space-y-3">
      {/* Organizador */}
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-200 rounded-full flex items-center justify-center mr-3">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{organizador.nombreUsuario}</p>
            <p className="text-xs text-blue-600">Organizador</p>
          </div>
        </div>
        {organizador.nivelJuego && (
          <Badge variant="blue">{organizador.nivelJuego}</Badge>
        )}
      </div>

      {/* Otros jugadores */}
      {jugadores
        .filter(jugador => jugador.id !== organizador.id)
        .map(jugador => (
          <div key={jugador.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{jugador.nombreUsuario}</p>
                {jugador.deporteFavorito && (
                  <p className="text-xs text-gray-600">{jugador.deporteFavorito}</p>
                )}
              </div>
            </div>
            {jugador.nivelJuego && (
              <Badge variant="gray">{jugador.nivelJuego}</Badge>
            )}
          </div>
        ))}

      {/* Espacios vacíos */}
      {Array.from({
        length: partido.cantidadJugadoresRequeridos - jugadores.length
      }).map((_, index) => (
        <div key={index} className="flex items-center p-3 border-2 border-dashed border-gray-200 rounded-lg">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <p className="text-gray-400">Esperando jugador...</p>
        </div>
      ))}
    </div>
  );
};

export default JugadoresPartido;