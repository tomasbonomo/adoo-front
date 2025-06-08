import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Users, 
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Card, Loading, ErrorMessage, EmptyState, Badge, Button, Input, Select } from '../common';
import apiService from '../../services/api';

const SearchPartidos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [partidos, setPartidos] = useState([]);
  const [deportes, setDeportes] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  // Filtros
  const [filters, setFilters] = useState({
    tipoDeporte: '',
    zona: '',
    fechaDesde: '',
    fechaHasta: '',
    nivelMinimo: '',
    nivelMaximo: '',
    soloDisponibles: true,
    ordenarPor: 'fecha',
    orden: 'asc'
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    searchPartidos();
  }, [currentPage, filters]);

  const loadInitialData = () => {
    // Cargar deportes y zonas para los filtros
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

    // Preparar criterios de búsqueda
    const criterios = {
      ...filters,
      // Convertir strings vacíos a null
      tipoDeporte: filters.tipoDeporte || null,
      zona: filters.zona || null,
      fechaDesde: filters.fechaDesde ? new Date(filters.fechaDesde).toISOString() : null,
      fechaHasta: filters.fechaHasta ? new Date(filters.fechaHasta).toISOString() : null,
      nivelMinimo: filters.nivelMinimo || null,
      nivelMaximo: filters.nivelMaximo || null
    };

    apiService.searchPartidos(criterios, currentPage, pageSize)
      .then(response => {
        setPartidos(response.content || []);
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

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setCurrentPage(0); // Reset a primera página cuando cambian filtros
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
      ordenarPor: 'fecha',
      orden: 'asc'
    });
    setCurrentPage(0);
  };

  const joinPartido = (partidoId) => {
    apiService.joinPartido(partidoId)
      .then(response => {
        // Actualizar la lista
        searchPartidos();
        alert(response.mensaje);
      })
      .catch(err => {
        console.error('Error uniéndose al partido:', err);
        alert(apiService.handleApiError(err));
      });
  };

  const getDeporteIcon = (tipoDeporte) => {
    switch(tipoDeporte) {
      case 'FUTBOL': return '⚽';
      case 'BASQUET': return '🏀';
      case 'VOLEY': return '🏐';
      case 'TENIS': return '🎾';
      default: return '🏃‍♂️';
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const deporteOptions = [
    { value: '', label: 'Todos los deportes' },
    ...deportes.map(deporte => ({ value: deporte, label: deporte }))
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
    { value: 'fecha', label: 'Fecha' },
    { value: 'compatibilidad', label: 'Compatibilidad' },
    { value: 'distancia', label: 'Distancia' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Buscar Partidos
        </h1>
        <p className="text-gray-600">
          Encuentra el partido perfecto para ti
        </p>
      </div>

      {/* Filtros */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros de búsqueda</h3>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        {showFilters && (
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

            <Select
              label="Ordenar por"
              options={ordenOptions}
              value={filters.ordenarPor}
              onChange={(e) => handleFilterChange('ordenarPor', e.target.value)}
            />

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.soloDisponibles}
                  onChange={(e) => handleFilterChange('soloDisponibles', e.target.checked)}
                  className="mr-2"
                />
                Solo disponibles
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            {totalElements} partidos encontrados
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

      {/* Resultados */}
      {loading ? (
        <Loading size="lg" text="Buscando partidos..." />
      ) : partidos.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No se encontraron partidos"
          description="Prueba ajustando los filtros de búsqueda"
          action={
            <Button onClick={clearFilters}>
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <>
          {/* Lista de partidos */}
          <div className="space-y-4 mb-8">
            {partidos.map(partido => (
              <Card key={partido.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">
                        {getDeporteIcon(partido.deporte.tipo)}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {partido.deporte.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Organizado por {partido.organizador.nombreUsuario}
                        </p>
                      </div>
                      <div className="ml-auto flex items-center space-x-2">
                        {getEstadoBadge(partido.estado)}
                        {partido.compatibilidad && (
                          <Badge variant="green">
                            <Star className="w-3 h-3 mr-1" />
                            {Math.round(partido.compatibilidad * 100)}% match
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{partido.ubicacion.direccion}</span>
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
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-gray-600">
                        Estrategia: {partido.estrategiaEmparejamiento}
                        {partido.ubicacion.zona && (
                          <span className="ml-2">• Zona: {partido.ubicacion.zona}</span>
                        )}
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
                              className="text-green-600 hover:text-green-700 text-sm font-medium"
                            >
                              Unirse al partido
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Página {currentPage + 1} de {totalPages}
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