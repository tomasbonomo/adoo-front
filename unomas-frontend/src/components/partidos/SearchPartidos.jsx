import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { PartidoContext } from '../../contexts/PartidoContext';
import { useGlobalNotifications } from '../../contexts/GlobalNotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { getDeporteIcon } from  '../../config/config';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  ChevronLeft,
  ChevronRight,
  Target,
  Zap,
  TrendingUp,
  Brain,
  Globe,
  History,
  BarChart3
} from 'lucide-react';
import { Card, Loading, ErrorMessage, EmptyState, Badge, Button, Input, Select } from '../common';
import apiService from '../../services/api';

const SearchPartidos = () => {
  const { notifyPartidoUpdated } = useContext(PartidoContext);
  const { notifyPlayerJoined, notifyPartidoComplete, notifySuccess, notifyError } = useGlobalNotifications();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filtros mejorados
  const [filters, setFilters] = useState({
    tipoDeporte: '',
    zona: '',
    fechaDesde: '',
    fechaHasta: '',
    nivelMinimo: '',
    nivelMaximo: '',
    soloDisponibles: true,
    ordenarPor: 'compatibilidad', // ✅ Cambio: por defecto ordenar por compatibilidad
    orden: 'desc',
    // ✅ NUEVOS FILTROS para estrategias
    estrategiaEmparejamiento: '',
    compatibilidadMinima: 0.5,
    soloAltoMatch: false,
    incluirCercanos: true
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchPartidos();
  }, [currentPage, filters]);

  const loadInitialData = () => {
    Promise.all([
      apiService.getDeportesTypes(),
      apiService.getZonas()
    ])
    .then(([deportesData, zonasData]) => {
      setDeportes(deportesData);
      setZonas(zonasData);
    })
    .catch(err => {
      console.error('Error cargando datos iniciales:', err);
      setError(apiService.handleApiError(err));
    });
  };

  const searchPartidos = () => {
    setLoading(true);
    setError(null);

    // ✅ CRITERIOS MEJORADOS con nuevas capacidades
    const criterios = {
      ...filters,
      tipoDeporte: filters.tipoDeporte || null,
      zona: filters.zona || null,
      fechaDesde: filters.fechaDesde ? new Date(filters.fechaDesde).toISOString() : null,
      fechaHasta: filters.fechaHasta ? new Date(filters.fechaHasta).toISOString() : null,
      nivelMinimo: filters.nivelMinimo || null,
      nivelMaximo: filters.nivelMaximo || null,
      estrategiaEmparejamiento: filters.estrategiaEmparejamiento || null,
      // ✅ NUEVO: Filtro por compatibilidad mínima
      compatibilidadMinima: filters.soloAltoMatch ? 0.8 : (filters.compatibilidadMinima || 0),
    };

    console.log('🔍 Buscando con criterios mejorados:', criterios);

    apiService.searchPartidos(criterios, currentPage, pageSize)
      .then(response => {
        const partidosConCompatibilidad = (response.content || []).map(partido => ({
          ...partido,
          // ✅ MEJORADO: Asegurar que siempre haya compatibilidad calculada
          compatibilidad: partido.compatibilidad || calculateFallbackCompatibility(partido, user)
        }));
        
        setPartidos(partidosConCompatibilidad);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
      })
      .catch(err => {
        console.error('Error buscando partidos:', err);
        setError(apiService.handleApiError(err));
        setPartidos([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ✅ NUEVO: Calcular compatibilidad de fallback en el frontend
  const calculateFallbackCompatibility = (partido, usuario) => {
    if (!usuario) return 0.5;
    
    let compatibility = 0.5; // Base
    
    // Bonus por deporte favorito
    if (usuario.deporteFavorito === partido.deporte.tipo) {
      compatibility += 0.3;
    }
    
    // Bonus por nivel similar
    if (usuario.nivelJuego === partido.organizador.nivelJuego) {
      compatibility += 0.2;
    }
    
    // Bonus por horario conveniente
    const hora = new Date(partido.horario).getHours();
    const esFds = new Date(partido.horario).getDay() >= 5;
    if ((esFds && hora >= 10 && hora <= 22) || (!esFds && hora >= 17 && hora <= 21)) {
      compatibility += 0.1;
    }
    
    return Math.min(1.0, compatibility);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      tipoDeporte: '',
      zona: '',
      fechaDesde: '',
      fechaHasta: '',
      nivelMinimo: '',
      nivelMaximo: '',
      soloDisponibles: true,
      ordenarPor: 'compatibilidad',
      orden: 'desc',
      estrategiaEmparejamiento: '',
      compatibilidadMinima: 0.5,
      soloAltoMatch: false,
      incluirCercanos: true
    });
    setCurrentPage(0);
  };

  // ✅ MEJORADO: joinPartido con mejor feedback
  const joinPartido = async (partidoId) => {
    try {
      const partidoAntes = partidos.find(p => p.id === partidoId);
      
      // Mostrar loading en el botón específico
      setPartidos(prev => prev.map(p => 
        p.id === partidoId ? { ...p, joining: true } : p
      ));
      
      const response = await apiService.joinPartido(partidoId);
      
      // ✅ Notificación inmediata
      notifyPlayerJoined(user.nombreUsuario, {
        id: partidoId,
        deporte: partidoAntes.deporte.nombre
      });

      // Actualizar inmediatamente el estado local
      searchPartidos();
      notifyPartidoUpdated(partidoId);

      // Verificar si se completó
      setTimeout(async () => {
        try {
          const partidoDespues = await apiService.getPartido(partidoId);
          if (partidoDespues.cantidadJugadoresActual >= partidoDespues.cantidadJugadoresRequeridos &&
              partidoAntes.cantidadJugadoresActual < partidoAntes.cantidadJugadoresRequeridos) {
            notifyPartidoComplete({
              id: partidoId,
              deporte: partidoDespues.deporte.nombre
            });
          }
        } catch (err) {
          console.error('Error verificando estado:', err);
        }
      }, 1000);

    } catch (err) {
      console.error('Error uniéndose:', err);
      notifyError(apiService.handleApiError(err), '❌ Error al unirse');
    } finally {
      // Quitar loading
      setPartidos(prev => prev.map(p => 
        p.id === partidoId ? { ...p, joining: false } : p
      ));
    }
  };

  const getEstadoBadge = (estado) => {
    const badgeProps = {
      'NECESITAMOS_JUGADORES': { variant: 'yellow', text: 'Buscando jugadores' },
      'PARTIDO_ARMADO': { variant: 'blue', text: 'Partido armado' },
      'CONFIRMADO': { variant: 'green', text: 'Confirmado' },
      'EN_JUEGO': { variant: 'indigo', text: 'En juego' }
    };

    const props = badgeProps[estado] || { variant: 'gray', text: estado };
    return <Badge variant={props.variant}>{props.text}</Badge>;
  };

  // ✅ NUEVO: Badge de estrategia con icono
  const getEstrategiaBadge = (estrategia) => {
    const estrategiaInfo = {
      'POR_NIVEL': { icon: Target, color: 'blue', name: 'Por Nivel' },
      'POR_CERCANIA': { icon: Globe, color: 'green', name: 'Por Cercanía' },
      'POR_HISTORIAL': { icon: History, color: 'purple', name: 'Por Historial' }
    };

    const info = estrategiaInfo[estrategia] || { icon: BarChart3, color: 'gray', name: estrategia };
    const Icon = info.icon;

    return (
      <Badge variant={info.color} className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        {info.name}
      </Badge>
    );
  };

  // ✅ NUEVO: Compatibilidad visual mejorada
  const getCompatibilityDisplay = (compatibilidad) => {
    if (!compatibilidad || compatibilidad === 0) return null;
    const percentage = Math.round(compatibilidad * 100);
    let variant = 'gray';
    let label = '';
    let extra = null;
    if (percentage >= 90) {
      variant = 'purple';
      label = 'Excelente';
    } else if (percentage >= 80) {
      variant = 'green';
      label = 'Muy bueno';
    } else if (percentage >= 70) {
      variant = 'blue';
      label = 'Bueno';
    } else if (percentage >= 60) {
      variant = 'yellow';
      label = 'Regular';
    } else {
      variant = 'orange';
      label = 'Compatibilidad baja';
      extra = <span className="text-xs text-orange-600 ml-2">Puedes unirte, pero la distancia o zona es lejana.</span>;
    }
    return (
      <div className="flex items-center space-x-1">
        <Badge variant={variant}>
          <Star className="w-3 h-3 mr-1" />
          {percentage}%
        </Badge>
        {label && <span className={`text-xs ${variant === 'orange' ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>{label}</span>}
        {extra}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // ✅ OPCIONES MEJORADAS
  const deporteOptions = [
    { value: '', label: 'Todos los deportes' },
    ...deportes.map(deporte => ({ 
      value: deporte.value,
      label: deporte.label
    }))
  ];

  const zonaOptions = [
    { value: '', label: 'Todas las zonas' },
    ...zonas.map(zona => ({ value: zona, label: zona }))
  ];

  const nivelOptions = [
    { value: '', label: 'Cualquier nivel' },
    { value: 'PRINCIPIANTE', label: 'Principiante' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZADO', label: 'Avanzado' }
  ];

  const ordenOptions = [
    { value: 'compatibilidad', label: '🎯 Compatibilidad' },
    { value: 'fecha', label: '📅 Fecha' },
    { value: 'distancia', label: '📍 Distancia' },
    { value: 'popularidad', label: '🔥 Popularidad' }
  ];

  // ✅ NUEVAS OPCIONES para estrategias
  const estrategiaOptions = [
    { value: '', label: 'Cualquier estrategia' },
    { value: 'POR_NIVEL', label: '🎯 Por Nivel de Habilidad' },
    { value: 'POR_CERCANIA', label: '🗺️ Por Cercanía Geográfica' },
    { value: 'POR_HISTORIAL', label: '📊 Por Historial de Partidos' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header mejorado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Búsqueda Inteligente de Partidos
        </h1>
        <p className="text-gray-600">
          Encuentra partidos perfectos con nuestro sistema de emparejamiento avanzado
        </p>
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Brain className="w-4 h-4 mr-1" />
            <span>Búsqueda inteligente activada</span>
          </div>
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            <span>Compatibilidad automática</span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Resultados personalizados</span>
          </div>
        </div>
      </div>

      {/* Filtros mejorados */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros Inteligentes</h3>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {showAdvancedSearch ? 'Filtros básicos' : 'Filtros avanzados'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar' : 'Mostrar'} filtros
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="space-y-4">
            {/* Filtros básicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Deporte"
                options={deporteOptions}
                value={filters.tipoDeporte}
                onChange={(e) => handleFilterChange('tipoDeporte', e.target.value)}
              />

              <Select
                label="Zona"
                options={zonaOptions}
                value={filters.zona}
                onChange={(e) => handleFilterChange('zona', e.target.value)}
              />

              <Select
                label="Estrategia de Emparejamiento"
                options={estrategiaOptions}
                value={filters.estrategiaEmparejamiento}
                onChange={(e) => handleFilterChange('estrategiaEmparejamiento', e.target.value)}
              />

              <Select
                label="Ordenar por"
                options={ordenOptions}
                value={filters.ordenarPor}
                onChange={(e) => handleFilterChange('ordenarPor', e.target.value)}
              />
            </div>

            {/* ✅ FILTROS AVANZADOS */}
            {showAdvancedSearch && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Búsqueda Avanzada</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Input
                    label="Fecha desde"
                    type="datetime-local"
                    value={filters.fechaDesde}
                    onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                  />

                  <Input
                    label="Fecha hasta"
                    type="datetime-local"
                    value={filters.fechaHasta}
                    onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                  />

                  <Select
                    label="Nivel mínimo"
                    options={nivelOptions}
                    value={filters.nivelMinimo}
                    onChange={(e) => handleFilterChange('nivelMinimo', e.target.value)}
                  />

                  <Select
                    label="Nivel máximo"
                    options={nivelOptions}
                    value={filters.nivelMaximo}
                    onChange={(e) => handleFilterChange('nivelMaximo', e.target.value)}
                  />
                </div>

                {/* Controles de compatibilidad */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-blue-900 mb-2">Control de Compatibilidad</h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 mb-1">
                        Compatibilidad mínima: {Math.round(filters.compatibilidadMinima * 100)}%
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={filters.compatibilidadMinima}
                        onChange={(e) => handleFilterChange('compatibilidadMinima', parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.soloAltoMatch}
                          onChange={(e) => handleFilterChange('soloAltoMatch', e.target.checked)}
                          className="mr-2"
                        />
                        Solo matches de 80%+
                      </label>
                    </div>
                    <div className="flex items-center">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.incluirCercanos}
                          onChange={(e) => handleFilterChange('incluirCercanos', e.target.checked)}
                          className="mr-2"
                        />
                        Incluir partidos cercanos
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Controles de filtro */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.soloDisponibles}
                  onChange={(e) => handleFilterChange('soloDisponibles', e.target.checked)}
                  className="mr-2"
                />
                Solo partidos disponibles
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {totalElements} partidos encontrados
            {filters.soloAltoMatch && <span className="text-blue-600 ml-2">• Solo alta compatibilidad</span>}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={clearFilters}
          >
            Limpiar filtros
          </Button>
        </div>
      </Card>

      {error && <ErrorMessage error={error} onClose={() => setError(null)} />}

      {/* Resultados mejorados */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Buscando partidos con IA..." />
        </div>
      ) : partidos.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No se encontraron partidos"
          description="Prueba ajustando los filtros o ampliando los criterios de búsqueda"
          action={
            <div className="space-x-2">
              <Button onClick={clearFilters}>
                Limpiar filtros
              </Button>
              <Link to="/partidos/crear" className="btn-primary">
                Crear nuevo partido
              </Link>
            </div>
          }
        />
      ) : (
        <>
          {/* Lista de partidos mejorada */}
          <div className="space-y-4 mb-8">
            {partidos.map(partido => {
                // Log para debug
                console.log('Partido:', partido);
                // Normalizo valores para robustez
                const estrategia = (partido.estrategiaEmparejamiento || '').toUpperCase();
                const nivelMin = partido.nivelMinimo ? (typeof partido.nivelMinimo === 'string' ? partido.nivelMinimo.charAt(0).toUpperCase() + partido.nivelMinimo.slice(1).toLowerCase() : partido.nivelMinimo) : null;
                const nivelMax = partido.nivelMaximo ? (typeof partido.nivelMaximo === 'string' ? partido.nivelMaximo.charAt(0).toUpperCase() + partido.nivelMaximo.slice(1).toLowerCase() : partido.nivelMaximo) : null;
                return (
                  <Card key={partido.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <span className="text-2xl mr-3">
                            {getDeporteIcon(partido.deporte.tipo)}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {partido.deporte.nombre}
                              </h3>
                              {getEstadoBadge(partido.estado)}
                              {getEstrategiaBadge(partido.estrategiaEmparejamiento)}
                              {getCompatibilityDisplay(partido.compatibilidad)}
                            </div>
                            <p className="text-sm text-gray-600">
                              Organizado por {partido.organizador.nombreUsuario}
                              {partido.organizador.nivelJuego && (
                                <span className="ml-2 text-xs">
                                  • Nivel: {partido.organizador.nivelJuego}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        {/* Mensaje de compatibilidad y estrategia SIEMPRE visible */}
                        <div className={`rounded px-3 py-2 mb-2 text-sm font-medium flex items-center gap-2 ${
                          partido.compatibilidad >= 0.9 ? 'bg-green-50 text-green-800' :
                          partido.compatibilidad >= 0.7 ? 'bg-blue-50 text-blue-800' :
                          partido.compatibilidad >= 0.6 ? 'bg-yellow-50 text-yellow-800' :
                          'bg-orange-50 text-orange-800'
                        }`}>
                          {partido.compatibilidad >= 0.9 && <span>Alta compatibilidad</span>}
                          {partido.compatibilidad >= 0.7 && partido.compatibilidad < 0.9 && <span>Buena compatibilidad</span>}
                          {partido.compatibilidad >= 0.6 && partido.compatibilidad < 0.7 && <span>Compatibilidad regular</span>}
                          {partido.compatibilidad < 0.6 && <span>Compatibilidad baja</span>}
                          <span>({Math.round(partido.compatibilidad * 100)}%)</span>
                          <span className="ml-2">- Estrategia: {partido.estrategiaEmparejamiento}</span>
                        </div>

                        {/* Mostrar nivel necesario si la estrategia es POR_NIVEL */}
                        {estrategia === 'POR_NIVEL' && nivelMin && (
                          <div className="text-xs text-blue-700 font-semibold mb-1">
                            Nivel necesario: {nivelMin === nivelMax || !nivelMax ? nivelMin : `${nivelMin} a ${nivelMax}`}
                          </div>
                        )}

                        {/* Información del partido */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            <span>
                              {partido.ubicacion.direccion}
                              {partido.ubicacion.zona && (
                                <span className="text-blue-600 ml-1">• {partido.ubicacion.zona}</span>
                              )}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            <span>{formatDate(partido.horario)}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2" />
                            <span>
                              {partido.cantidadJugadoresActual}/{partido.cantidadJugadoresRequeridos} jugadores
                            </span>
                            <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ 
                                  width: `${(partido.cantidadJugadoresActual / partido.cantidadJugadoresRequeridos) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            ID: #{partido.id} • Duración: {partido.duracion} min
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              to={`/partidos/${partido.id}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Ver detalles
                            </Link>
                            {partido.puedeUnirse && (
                              <>
                                <span className="text-gray-300">•</span>
                                <button
                                  onClick={() => joinPartido(partido.id)}
                                  disabled={partido.joining}
                                  className={`text-sm font-medium px-3 py-1 rounded transition-colors ${
                                    partido.joining 
                                      ? 'text-gray-400 cursor-not-allowed'
                                      : 'text-green-600 hover:text-green-700 hover:bg-green-50'
                                  }`}
                                >
                                  {partido.joining ? (
                                    '⏳ Uniéndose...'
                                  ) : (
                                    <>🚀 Unirse al partido</>
                                  )}
                                </button>
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {currentPage + 1} de {totalPages} • {totalElements} resultados
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage === 0}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchPartidos;