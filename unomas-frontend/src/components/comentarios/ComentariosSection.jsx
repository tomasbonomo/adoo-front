import React, { useState, useEffect } from 'react';
import { MessageCircle, Star, ThumbsUp } from 'lucide-react';
import { Card, Button } from '../common';
import apiService from '../../services/api';

const ComentariosSection = ({ partidoId, canComment }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState({ comentario: '', calificacion: 5 });
  const [mostrar, setMostrar] = useState(false);

  const cargarComentarios = () => {
    if (!mostrar) return;
    apiService.obtenerComentariosPartido(partidoId)
      .then(response => setComentarios(response.content || []))
      .catch(err => console.error('Error:', err));
  };

  useEffect(() => {
    cargarComentarios();
  }, [mostrar]);

  const agregarComentario = () => {
    if (!nuevoComentario.comentario.trim()) return;
    
    apiService.agregarComentario(partidoId, nuevoComentario)
      .then(() => {
        setNuevoComentario({ comentario: '', calificacion: 5 });
        cargarComentarios();
        alert('Comentario agregado!');
      })
      .catch(err => alert('Error: ' + err.message));
  };

  return (
    <Card className="p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">💬 Comentarios</h3>
        <Button variant="secondary" size="sm" onClick={() => setMostrar(!mostrar)}>
          {mostrar ? 'Ocultar' : 'Ver'} comentarios
        </Button>
      </div>

      {mostrar && (
        <div>
          {/* Agregar comentario si puede */}
          {canComment && (
            <div className="mb-4 p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Agregar valoración:</h4>
              <div className="mb-2">
                <label className="block text-sm mb-1">Calificación:</label>
                <div className="flex space-x-1">
                  {[1,2,3,4,5].map(star => (
                    <button
                      key={star}
                      onClick={() => setNuevoComentario(prev => ({...prev, calificacion: star}))}
                      className={`text-2xl ${star <= nuevoComentario.calificacion ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={nuevoComentario.comentario}
                onChange={(e) => setNuevoComentario(prev => ({...prev, comentario: e.target.value}))}
                placeholder="Tu experiencia en este partido..."
                className="w-full p-2 border rounded"
                rows="3"
              />
              <Button onClick={agregarComentario} size="sm" className="mt-2">
                <ThumbsUp className="w-4 h-4 mr-1" /> Publicar
              </Button>
            </div>
          )}

          {/* Lista de comentarios */}
          <div className="space-y-3">
            {comentarios.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No hay comentarios aún</p>
            ) : (
              comentarios.map(comentario => (
                <div key={comentario.id} className="bg-gray-50 p-3 rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <strong>{comentario.usuarioNombre}</strong>
                      <div className="text-yellow-400">
                        {'★'.repeat(comentario.calificacion)}
                      </div>
                      <p className="text-gray-700 mt-1">{comentario.comentario}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(comentario.fechaCreacion).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default ComentariosSection;