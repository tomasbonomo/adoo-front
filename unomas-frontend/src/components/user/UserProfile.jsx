import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDeporteIcon, getDeporteLabel } from '../../config/config';
import { 
  User,
  Mail,
  Trophy,
  Star,
  Edit2,
  Save,
  X,
  Calendar,
  Activity,
  Target,
  Award
} from 'lucide-react';
import { Card, Loading, ErrorMessage, SuccessMessage, Button, Select } from '../common';
import apiService from '../../services/api';

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState(null);
  const [deportes, setDeportes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [otraZona, setOtraZona] = useState('');

  const [editData, setEditData] = useState({
    deporteFavorito: '',
    nivelJuego: '',
    direccion: '',
    zona: '',
    latitud: '',
    longitud: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    if (user) {
      setEditData({
        deporteFavorito: user.deporteFavorito || '',
        nivelJuego: user.nivelJuego || '',
        direccion: user.ubicacion?.direccion || '',
        zona: user.ubicacion?.zona || '',
        latitud: user.ubicacion?.latitud || '',
        longitud: user.ubicacion?.longitud || ''
      });
      setOtraZona('');
    }
  }, [user]);

  useEffect(() => {
    apiService.getZonas()
      .then(zs => setZonas(zs || []))
      .catch(() => setZonas([]));
  }, []);

  const loadProfileData = () => {
    setLoading(true);
    
    Promise.all([
      loadUserStats(),
      loadDeportes()
    ])
    .then(() => {
      setLoading(false);
    })
    .catch(err => {
      console.error('Error cargando datos del perfil:', err);
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

const loadDeportes = () => {
  return apiService.getDeportesTypes()
    .then(deportesData => {
      setDeportes(deportesData); // Ahora es array de {value, label}
    })
    .catch(err => {
      console.error('Error cargando deportes:', err);
    });
};

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      deporteFavorito: user.deporteFavorito || '',
      nivelJuego: user.nivelJuego || '',
      direccion: user.ubicacion?.direccion || '',
      zona: user.ubicacion?.zona || '',
      latitud: user.ubicacion?.latitud || '',
      longitud: user.ubicacion?.longitud || ''
    });
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
    if (field === 'zona' && value !== 'OTRO') setOtraZona('');
  };

  const handleOtraZonaChange = (e) => {
    setOtraZona(e.target.value);
    setEditData(prev => ({ ...prev, zona: e.target.value }));
  };

  const handleSave = () => {
    setUpdateLoading(true);
    setError(null);
    setSuccess(null);
    const updateData = {
      deporteFavorito: editData.deporteFavorito || null,
      nivelJuego: editData.nivelJuego || null,
      ubicacion: {
        direccion: editData.direccion,
        zona: editData.zona,
        latitud: editData.latitud ? parseFloat(editData.latitud) : null,
        longitud: editData.longitud ? parseFloat(editData.longitud) : null
      }
    };
    updateProfile(updateData)
      .then(() => {
        setSuccess('Perfil actualizado exitosamente');
        setIsEditing(false);
        loadUserStats();
      })
      .catch(err => {
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  const getNivelColor = (nivel) => {
    switch(nivel) {
      case 'PRINCIPIANTE': return 'bg-green-100 text-green-800';
      case 'INTERMEDIO': return 'bg-yellow-100 text-yellow-800';
      case 'AVANZADO': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const deporteOptions = [
  { value: '', label: 'Sin deporte favorito' },
  ...deportes.map(deporte => ({ 
    value: deporte.value,  // FUTBOL, BASQUET, etc.
    label: deporte.label   // Fútbol, Básquet, etc.
  }))
];

  const nivelOptions = [
    { value: '', label: 'Sin nivel definido' },
    { value: 'PRINCIPIANTE', label: 'Principiante' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZADO', label: 'Avanzado' }
  ];

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando perfil..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mi Perfil
        </h1>
        <p className="text-gray-600">
          Gestiona tu información personal y preferencias deportivas
        </p>
      </div>

      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Información principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos personales */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Información Personal</h3>
              {!isEditing ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEdit}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    loading={updateLoading}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Guardar
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Información fija */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Nombre de usuario</p>
                    <p className="text-sm text-gray-600">{user.nombreUsuario}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Miembro desde</p>
                    <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Trophy className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Rol</p>
                    <p className="text-sm text-gray-600">{user.role}</p>
                  </div>
                </div>
              </div>

              {/* Información editable */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Deporte favorito */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Deporte Favorito
                    </label>
                    {isEditing ? (
                      <Select
                        options={deporteOptions}
                        value={editData.deporteFavorito}
                        onChange={(e) => handleEditChange('deporteFavorito', e.target.value)}
                      />
                    ) : (
                      <div className="flex items-center">
                        {user.deporteFavorito ? (
                          <>
                            <span className="text-2xl mr-2">
                              {getDeporteIcon(user.deporteFavorito)}
                            </span>
                            <span className="text-sm text-gray-600">
                              {getDeporteLabel(deportes, user.deporteFavorito)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-400">No definido</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nivel de juego */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Nivel de Juego
                    </label>
                    {isEditing ? (
                      <Select
                        options={nivelOptions}
                        value={editData.nivelJuego}
                        onChange={(e) => handleEditChange('nivelJuego', e.target.value)}
                      />
                    ) : (
                      <div>
                        {user.nivelJuego ? (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNivelColor(user.nivelJuego)}`}>
                            {user.nivelJuego}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No definido</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Ubicación */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Barrio/Zona
                    </label>
                    {isEditing ? (
                      <>
                        <select
                          name="zona"
                          className="input-field"
                          value={editData.zona}
                          onChange={(e) => handleEditChange('zona', e.target.value)}
                        >
                          <option value="">Selecciona tu barrio/zona</option>
                          {zonas.map(z => (
                            <option key={z} value={z}>{z}</option>
                          ))}
                          <option value="OTRO">Otro...</option>
                        </select>
                        {editData.zona === 'OTRO' && (
                          <input
                            type="text"
                            name="otraZona"
                            className="input-field mt-2"
                            placeholder="Escribe tu barrio/zona"
                            value={otraZona}
                            onChange={handleOtraZonaChange}
                          />
                        )}
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <input
                            type="text"
                            name="direccion"
                            className="input-field"
                            placeholder="Dirección (ej: Av. Siempre Viva 123)"
                            value={editData.direccion}
                            onChange={(e) => handleEditChange('direccion', e.target.value)}
                          />
                          <input
                            type="text"
                            name="latitud"
                            className="input-field"
                            placeholder="Latitud"
                            value={editData.latitud}
                            onChange={(e) => handleEditChange('latitud', e.target.value)}
                          />
                          <input
                            type="text"
                            name="longitud"
                            className="input-field"
                            placeholder="Longitud"
                            value={editData.longitud}
                            onChange={(e) => handleEditChange('longitud', e.target.value)}
                          />
                        </div>
                      </>
                    ) : (
                      <div>
                        <span className="text-sm text-gray-600">{user.ubicacion?.zona || 'No definido'}</span>
                        {user.ubicacion?.direccion && (
                          <span className="text-xs text-gray-500 ml-2">{user.ubicacion.direccion}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Estadísticas detalladas */}
          {stats && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas Detalladas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Partidos jugados</span>
                    <span className="text-lg font-bold text-gray-900">{stats.partidosJugados}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Partidos organizados</span>
                    <span className="text-lg font-bold text-gray-900">{stats.partidosOrganizados}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Partidos finalizados</span>
                    <span className="text-lg font-bold text-green-600">{stats.partidosFinalizados}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Partidos cancelados</span>
                    <span className="text-lg font-bold text-red-600">{stats.partidosCancelados}</span>
                  </div>
                </div>
              </div>

              {/* Ratio de éxito */}
              {stats.partidosJugados > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Ratio de finalización</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.round((stats.partidosFinalizados / stats.partidosJugados) * 100)}%
                    </span>
                  </div>
                  <div className="mt-2 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2"
                      style={{ 
                        width: `${(stats.partidosFinalizados / stats.partidosJugados) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumen rápido */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h4 className="font-semibold text-gray-900">{user.nombreUsuario}</h4>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              {stats && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-primary-600">{stats.partidosJugados}</div>
                      <div className="text-xs text-gray-600">Partidos</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{stats.partidosFinalizados}</div>
                      <div className="text-xs text-gray-600">Finalizados</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Preferencias deportivas */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferencias Deportivas</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <Trophy className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Deporte Favorito</span>
                </div>
                {user.deporteFavorito ? (
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{getDeporteIcon(user.deporteFavorito)}</span>
                    <span className="text-sm">{user.deporteFavorito}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No definido</p>
                )}
              </div>

              <div>
                <div className="flex items-center mb-2">
                  <Star className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-600">Nivel de Juego</span>
                </div>
                {user.nivelJuego ? (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNivelColor(user.nivelJuego)}`}>
                    {user.nivelJuego}
                  </span>
                ) : (
                  <p className="text-sm text-gray-400">No definido</p>
                )}
              </div>
            </div>

            {(!user.deporteFavorito || !user.nivelJuego) && (
              <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                <div className="flex items-start">
                  <Target className="h-4 w-4 text-amber-600 mr-2 mt-0.5" />
                  <div className="text-xs text-amber-700">
                    <p className="font-medium mb-1">Mejora tu experiencia</p>
                    <p>Completa tu perfil deportivo para obtener mejores recomendaciones de partidos.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Logros (placeholder) */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Logros</h3>
            <div className="space-y-3">
              {stats && stats.partidosJugados >= 1 && (
                <div className="flex items-center p-2 bg-green-50 rounded-lg">
                  <Award className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Primer Partido</p>
                    <p className="text-xs text-green-600">Jugaste tu primer partido</p>
                  </div>
                </div>
              )}
              
              {stats && stats.partidosJugados >= 5 && (
                <div className="flex items-center p-2 bg-blue-50 rounded-lg">
                  <Award className="h-5 w-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Jugador Activo</p>
                    <p className="text-xs text-blue-600">Participaste en 5+ partidos</p>
                  </div>
                </div>
              )}

              {stats && stats.partidosOrganizados >= 1 && (
                <div className="flex items-center p-2 bg-purple-50 rounded-lg">
                  <Award className="h-5 w-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-purple-900">Organizador</p>
                    <p className="text-xs text-purple-600">Organizaste tu primer partido</p>
                  </div>
                </div>
              )}

              {(!stats || (stats.partidosJugados === 0 && stats.partidosOrganizados === 0)) && (
                <div className="text-center py-4">
                  <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Aún no hay logros</p>
                  <p className="text-xs text-gray-400">¡Participa en partidos para desbloquear logros!</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;