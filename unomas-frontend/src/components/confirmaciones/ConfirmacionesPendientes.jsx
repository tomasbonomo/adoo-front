import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDeporteIcon } from '../../config/config';
import { AlertCircle, CheckCircle, Clock, MapPin, Users, Calendar } from 'lucide-react';
import { Card, Loading, ErrorMessage, Button, Badge } from '../common';
import apiService from '../../services/api';

const ConfirmacionesPendientes = () => {
  const [confirmacionesPendientes, setConfirmacionesPendientes] = useState([]);

  useEffect(() => {
    // Obtener partidos que necesitan confirmación
    apiService.getMyPartidos()
      .then(partidos => {
        const pendientes = partidos.filter(p => p.estado === 'PARTIDO_ARMADO');
        setConfirmacionesPendientes(pendientes);
      })
      .catch(err => console.error('Error:', err));
  }, []);

  const confirmarPartido = (partidoId) => {
    apiService.confirmarParticipacion(partidoId)
      .then(() => window.location.reload())
      .catch(err => alert('Error: ' + err.message));
  };

  if (confirmacionesPendientes.length === 0) return null;

  return (
    <Card className="p-6 border-yellow-200 bg-yellow-50 mb-6">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">
        ⚠️ Confirma tu participación ({confirmacionesPendientes.length})
      </h3>
      {confirmacionesPendientes.map(partido => (
        <div key={partido.id} className="bg-white p-4 rounded-lg mb-3">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-xl mr-2">{getDeporteIcon(partido.deporte.tipo)}</span>
              <strong>{partido.deporte.nombre}</strong>
              <p className="text-sm text-gray-600">{partido.ubicacion.direccion}</p>
            </div>
            <Button onClick={() => confirmarPartido(partido.id)} variant="success" size="sm">
              ✅ Confirmar
            </Button>
          </div>
        </div>
      ))}
    </Card>
  );
};

export default ConfirmacionesPendientes;