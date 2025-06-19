import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDeporteIcon } from  '../../config/config';
import { 
  Plus, 
  MapPin, 
  Clock, 
  Users, 
  Timer,
  Settings,
  Info,
  AlertTriangle,
  Target,
  Globe,
  History,
  BarChart3,
  Zap,
  Brain,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Card, Loading, ErrorMessage, SuccessMessage, Button, Input, Select } from '../common';
import apiService from '../../services/api';

// Componente temporal de ZonaSelector simplificado
const ZonaSelectorSimple = ({ value, onChange, label, showStats = false }) => {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:8080/api/v1/ubicaciones/zonas')
      .then(response => response.json())
      .then(zonasData => {
        setZonas(zonasData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando zonas:', err);
        setZonas(['Centro', 'Palermo', 'Belgrano', 'Zona Norte', 'Zona Sur', 'Zona Oeste']);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="animate-pulse h-10 bg-gray-200 rounded-md"></div>;
  }

  const zonaOptions = [
    { value: '', label: 'Selecciona una zona (opcional)' },
    ...zonas.map(zona => ({ value: zona, label: `📍 ${zona}` }))
  ];

  return (
    <div>
      <Select
        label={label}
        options={zonaOptions}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <div className="mt-2 p-2 bg-blue-50 rounded text-blue-700 text-sm">
          ✅ Zona seleccionada: <strong>{value}</strong>
          <br />
          Esto ayudará a las estrategias de emparejamiento a encontrar jugadores compatibles.
        </div>
      )}
    </div>
  );
};

const CreatePartido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deportes, setDeportes] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showCreating, setShowCreating] = useState(false);

  const [formData, setFormData] = useState({
    tipoDeporte: '',
    cantidadJugadoresRequeridos: '',
    duracion: '90',
    ubicacion: {
      direccion: '',
      latitud: '',
      longitud: '',
      zona: ''
    },
    horario: '',
    estrategiaEmparejamiento: 'POR_NIVEL', // ✅ Por defecto la estrategia inteligente
    // ✅ NUEVOS campos para configuración avanzada
    configuracionAvanzada: {
      nivelMinimo: '',
      nivelMaximo: '',
      radioMaximo: '',
      permitirMixto: true,
      prioridadCompatibilidad: 'alta'
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [estrategiaPreview, setEstrategiaPreview] = useState(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  // ✅ NUEVO: Actualizar preview cuando cambia la estrategia
  useEffect(() => {
    updateEstrategiaPreview();
  }, [formData.estrategiaEmparejamiento, formData.tipoDeporte, formData.ubicacion.zona]);

  const loadInitialData = () => {
    setLoading(true);

    apiService.getDeportesTypes()
      .then(deportesData => {
        setDeportes(deportesData);
      })
      .catch(err => {
        console.error('Error cargando datos iniciales:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // ✅ NUEVO: Preview de cómo funcionará la estrategia
  const updateEstrategiaPreview = () => {
    const { estrategiaEmparejamiento, tipoDeporte, ubicacion } = formData;
    
    const previews = {
      'POR_NIVEL': {
        icon: Target,
        title: 'Emparejamiento por Nivel',
        description: 'Los jugadores se emparejarán según su habilidad',
        benefits: [
          'Partidos más equilibrados',
          'Mejor experiencia de juego',
          'Compatibilidad por habilidad'
        ],
        algorithm: 'Mismo nivel = 100% • 1 nivel diferencia = 70% • 2+ niveles = 30%'
      },
      'POR_CERCANIA': {
        icon: Globe,
        title: 'Emparejamiento por Cercanía',
        description: 'Prioriza jugadores de la misma zona geográfica',
        benefits: [
          'Menor tiempo de viaje',
          'Fácil acceso al partido',
          'Comunidad local'
        ],
        algorithm: ubicacion.zona 
          ? `Zona ${ubicacion.zona}: 100% • Zonas adyacentes: 80% • <5km: 90%`
          : 'Misma zona: 100% • Zonas adyacentes: 80% • <5km: 90%'
      },
      'POR_HISTORIAL': {
        icon: History,
        title: 'Emparejamiento por Historial',
        description: 'Considera la experiencia previa de los jugadores',
        benefits: [
          'Jugadores conocidos',
          'Basado en experiencia',
          'Preferencias aprendidas'
        ],
        algorithm: 'Sin historial: 60% • Historial positivo: 95% • Jugadores conocidos: +20%'
      }
    };

    setEstrategiaPreview(previews[estrategiaEmparejamiento] || null);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.tipoDeporte) {
      errors.tipoDeporte = 'Selecciona un deporte';
    }
    
    if (!formData.cantidadJugadoresRequeridos) {
      errors.cantidadJugadoresRequeridos = 'Especifica la cantidad de jugadores';
    } else {
      const cantidad = parseInt(formData.cantidadJugadoresRequeridos);
      if (isNaN(cantidad) || cantidad < 2) {
        errors.cantidadJugadoresRequeridos = 'Mínimo 2 jugadores';
      } else if (cantidad > 50) {
        errors.cantidadJugadoresRequeridos = 'Máximo 50 jugadores';
      }
    }
    
    if (!formData.duracion) {
      errors.duracion = 'Especifica la duración';
    } else {
      const duracion = parseInt(formData.duracion);
      if (isNaN(duracion) || duracion < 30) {
        errors.duracion = 'Duración mínima 30 minutos';
      } else if (duracion > 300) {
        errors.duracion = 'Duración máxima 5 horas (300 minutos)';
      }
    }
    
    if (!formData.ubicacion.direccion.trim()) {
      errors.direccion = 'La dirección es obligatoria';
    } else if (formData.ubicacion.direccion.trim().length < 5) {
      errors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }
    
    if (!formData.horario) {
      errors.horario = 'Selecciona fecha y hora';
    } else {
      const selectedDate = new Date(formData.horario);
      const now = new Date();
      
      if (isNaN(selectedDate.getTime())) {
        errors.horario = 'Fecha inválida';
      } else if (selectedDate <= now) {
        errors.horario = 'La fecha debe ser futura';
      } else {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (selectedDate > oneYearFromNow) {
          errors.horario = 'La fecha no puede ser mayor a un año';
        }
      }
    }

    if (formData.ubicacion.latitud && formData.ubicacion.latitud !== '') {
      const lat = parseFloat(formData.ubicacion.latitud);
      if (isNaN(lat) || lat < -90 || lat > 90) {
        errors.latitud = 'Latitud debe estar entre -90 y 90';
      }
    }

    if (formData.ubicacion.longitud && formData.ubicacion.longitud !== '') {
      const lng = parseFloat(formData.ubicacion.longitud);
      if (isNaN(lng) || lng < -180 || lng > 180) {
        errors.longitud = 'Longitud debe estar entre -180 y 180';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    if (formErrors[field] || formErrors[field.split('.')[1]]) {
      const errorField = field.includes('.') ? field.split('.')[1] : field;
      setFormErrors(prev => ({
        ...prev,
        [errorField]: ''
      }));
    }
  };

  // ✅ NUEVO: Manejar configuración avanzada
  const handleAdvancedChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      configuracionAvanzada: {
        ...prev.configuracionAvanzada,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setSubmitLoading(true);
    setShowCreating(true);
    setError(null);
    setSuccess(null);
    const submitData = {
      ...formData,
      ...(showAdvanced && formData.configuracionAvanzada.nivelMinimo && {
        configuracionEstrategia: formData.configuracionAvanzada
      })
    };
    apiService.createPartido(submitData)
      .then(response => {
        setSubmitLoading(false);
        setShowCreating(false);
        navigate(`/partidos/${response.id}`);
      })
      .catch(err => {
        setSubmitLoading(false);
        setShowCreating(false);
        setError(apiService.handleApiError(err));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  const getDeporteInfo = (tipoDeporte) => {
    const deporteInfo = {
      'FUTBOL': { icon: '⚽', jugadores: 11, descripcion: '11 vs 11' },
      'BASQUET': { icon: '🏀', jugadores: 5, descripcion: '5 vs 5' },
      'VOLEY': { icon: '🏐', jugadores: 6, descripcion: '6 vs 6' },
      'TENIS': { icon: '🎾', jugadores: 2, descripcion: '1 vs 1 o 2 vs 2' }
    };
    return deporteInfo[tipoDeporte] || { icon: '🏃‍♂️', jugadores: 2, descripcion: 'Personalizable' };
  };

  const deporteOptions = [
    { value: '', label: 'Selecciona un deporte' },
    ...deportes.map(deporte => ({ 
      value: deporte.value,
      label: deporte.label
    }))
  ];

  // ✅ ESTRATEGIAS MEJORADAS con descripciones
  const estrategiaOptions = [
    { 
      value: 'POR_NIVEL', 
      label: '🎯 Por Nivel de Habilidad',
      description: 'Empareja jugadores con habilidades similares'
    },
    { 
      value: 'POR_CERCANIA', 
      label: '🗺️ Por Cercanía Geográfica',
      description: 'Prioriza jugadores de la misma zona'
    },
    { 
      value: 'POR_HISTORIAL', 
      label: '📊 Por Historial de Partidos',
      description: 'Basado en experiencia previa y jugadores conocidos'
    }
  ];

  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando formulario inteligente..." />
      </div>
    );
  }

  if (showCreating) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center min-h-[300px]">
        <Loading size="lg" text="Creando partido inteligente..." />
        <p className="mt-4 text-blue-700 text-lg font-medium">Por favor espera, estamos armando tu partido y emparejando jugadores compatibles.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header mejorado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Nuevo Partido Inteligente
        </h1>
        <p className="text-gray-600">
          Organiza un partido con sistema automático de emparejamiento y notificaciones
        </p>
        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
          <div className="flex items-center">
            <Zap className="w-4 h-4 mr-1" />
            <span>Sistema automático</span>
          </div>
          <div className="flex items-center">
            <Brain className="w-4 h-4 mr-1" />
            <span>Emparejamiento inteligente</span>
          </div>
          <div className="flex items-center">
            <Sparkles className="w-4 h-4 mr-1" />
            <span>Notificaciones instantáneas</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage error={error} onClose={() => setError(null)} />
          <div className="mt-4 p-4 bg-red-50 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
              <div className="text-sm text-red-700">
                <p className="font-medium mb-1">Consejos para solucionar el error:</p>
                <ul className="text-xs space-y-1">
                  <li>• Verifica que todos los campos obligatorios estén completos</li>
                  <li>• Asegúrate de que las coordenadas GPS (si las usas) sean válidas</li>
                  <li>• La fecha debe ser futura y no demasiado lejana</li>
                  <li>• Las estrategias de emparejamiento requieren información específica</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Información del Deporte */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información del Deporte</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Select
                label="Tipo de Deporte *"
                options={deporteOptions}
                value={formData.tipoDeporte}
                onChange={(e) => {
                  const tipoDeporte = e.target.value;
                  const deporteInfo = getDeporteInfo(tipoDeporte);
                  handleChange('tipoDeporte', tipoDeporte);
                  if (tipoDeporte && !formData.cantidadJugadoresRequeridos) {
                    handleChange('cantidadJugadoresRequeridos', deporteInfo.jugadores.toString());
                  }
                }}
                error={formErrors.tipoDeporte}
              />
              
              {formData.tipoDeporte && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-700">
                    <span className="text-lg mr-2">{getDeporteInfo(formData.tipoDeporte).icon}</span>
                    <span>{getDeporteInfo(formData.tipoDeporte).descripcion}</span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Cantidad de Jugadores Requeridos *"
                type="number"
                min="2"
                max="50"
                value={formData.cantidadJugadoresRequeridos}
                onChange={(e) => handleChange('cantidadJugadoresRequeridos', e.target.value)}
                error={formErrors.cantidadJugadoresRequeridos}
                placeholder="Ej: 10"
              />
            </div>

            <div>
              <Input
                label="Duración (minutos) *"
                type="number"
                min="30"
                max="300"
                step="15"
                value={formData.duracion}
                onChange={(e) => handleChange('duracion', e.target.value)}
                error={formErrors.duracion}
                placeholder="Ej: 90"
              />
            </div>
          </div>
        </Card>

        {/* ✅ NUEVA SECCIÓN: Estrategia de Emparejamiento */}
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Estrategia de Emparejamiento Inteligente</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Algoritmo de Emparejamiento *
              </label>
              <div className="space-y-3">
                {estrategiaOptions.map(option => (
                  <label key={option.value} className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-white transition-colors">
                    <input
                      type="radio"
                      name="estrategia"
                      value={option.value}
                      checked={formData.estrategiaEmparejamiento === option.value}
                      onChange={(e) => handleChange('estrategiaEmparejamiento', e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Preview de la estrategia */}
            {estrategiaPreview && (
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                  <estrategiaPreview.icon className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="font-medium text-gray-900">{estrategiaPreview.title}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{estrategiaPreview.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-700">Beneficios:</div>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {estrategiaPreview.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-1 h-1 bg-purple-400 rounded-full mr-2"></div>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs font-medium text-gray-700 mb-1">Algoritmo:</div>
                  <div className="text-xs text-purple-600 font-mono bg-purple-50 p-2 rounded">
                    {estrategiaPreview.algorithm}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Configuración avanzada */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-sm text-purple-600 hover:text-purple-700"
            >
              <Settings className="w-4 h-4 mr-1" />
              {showAdvanced ? 'Ocultar' : 'Mostrar'} configuración avanzada
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <h5 className="font-medium text-gray-900 mb-3">Configuración Avanzada</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.estrategiaEmparejamiento === 'POR_NIVEL' && (
                    <>
                      <Select
                        label="Nivel Mínimo Permitido"
                        options={[
                          { value: '', label: 'Sin restricción' },
                          { value: 'PRINCIPIANTE', label: 'Principiante' },
                          { value: 'INTERMEDIO', label: 'Intermedio' },
                          { value: 'AVANZADO', label: 'Avanzado' }
                        ]}
                        value={formData.configuracionAvanzada.nivelMinimo}
                        onChange={(e) => handleAdvancedChange('nivelMinimo', e.target.value)}
                      />
                      <Select
                        label="Nivel Máximo Permitido"
                        options={[
                          { value: '', label: 'Sin restricción' },
                          { value: 'PRINCIPIANTE', label: 'Principiante' },
                          { value: 'INTERMEDIO', label: 'Intermedio' },
                          { value: 'AVANZADO', label: 'Avanzado' }
                        ]}
                        value={formData.configuracionAvanzada.nivelMaximo}
                        onChange={(e) => handleAdvancedChange('nivelMaximo', e.target.value)}
                      />
                    </>
                  )}
                  
                  {formData.estrategiaEmparejamiento === 'POR_CERCANIA' && (
                    <Input
                      label="Radio Máximo (km)"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.configuracionAvanzada.radioMaximo}
                      onChange={(e) => handleAdvancedChange('radioMaximo', e.target.value)}
                      placeholder="15"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Ubicación y Horario */}
        <Card className="p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <MapPin className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Ubicación y Horario</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Dirección *"
                value={formData.ubicacion.direccion}
                onChange={(e) => handleChange('ubicacion.direccion', e.target.value)}
                error={formErrors.direccion}
                placeholder="Ej: Cancha Municipal, Av. Libertador 1234, Buenos Aires"
              />
            </div>

            <div>
              <ZonaSelectorSimple
                label="Zona (Importante para estrategia de cercanía)"
                value={formData.ubicacion.zona}
                onChange={(value) => handleChange('ubicacion.zona', value)}
                showStats={true}
              />
            </div>

            <div>
              <Input
                label="Fecha y Hora *"
                type="datetime-local"
                value={formData.horario}
                onChange={(e) => handleChange('horario', e.target.value)}
                error={formErrors.horario}
                min={getMinDateTime()}
              />
            </div>

            <div>
              <Input
                label="Latitud (opcional, mejora la precisión geográfica)"
                type="number"
                step="any"
                value={formData.ubicacion.latitud}
                onChange={(e) => handleChange('ubicacion.latitud', e.target.value)}
                error={formErrors.latitud}
                placeholder="Ej: -34.6037"
              />
            </div>

            <div>
              <Input
                label="Longitud (opcional, mejora la precisión geográfica)"
                type="number"
                step="any"
                value={formData.ubicacion.longitud}
                onChange={(e) => handleChange('ubicacion.longitud', e.target.value)}
                error={formErrors.longitud}
                placeholder="Ej: -58.3816"
              />
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 rounded-lg">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
              <div className="text-sm text-amber-700">
                <p className="font-medium mb-1">Tips para optimizar el emparejamiento:</p>
                <ul className="text-xs space-y-1">
                  <li>• La zona ayuda a la estrategia de cercanía a funcionar mejor</li>
                  <li>• Las coordenadas GPS permiten cálculos de distancia precisos</li>
                  <li>• El horario influye en las recomendaciones automáticas</li>
                  <li>• El sistema enviará notificaciones automáticas a jugadores compatibles</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* ✅ NUEVO: Resumen con preview de funcionamiento automático */}
        {formData.tipoDeporte && formData.cantidadJugadoresRequeridos && formData.horario && (
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2" />
              Resumen del Partido Inteligente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{getDeporteInfo(formData.tipoDeporte).icon}</span>
                <div>
                  <p className="font-medium text-gray-900">{formData.tipoDeporte}</p>
                  <p className="text-gray-600">{formData.cantidadJugadoresRequeridos} jugadores</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium text-gray-900">
                    {formData.horario ? new Date(formData.horario).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Sin fecha'}
                  </p>
                  <p className="text-gray-600">{formData.duracion} minutos</p>
                </div>
              </div>
              <div className="flex items-center">
                {estrategiaPreview && estrategiaPreview.icon && (
                  <estrategiaPreview.icon className="h-5 w-5 text-gray-400 mr-2" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {formData.ubicacion.zona || 'Sin zona'}
                  </p>
                  <p className="text-gray-600">{formData.estrategiaEmparejamiento}</p>
                </div>
              </div>
            </div>

            {/* Funcionamiento automático */}
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <Zap className="h-4 w-4 mr-1" />
                Funcionamiento Automático
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-700">
                <div>
                  <span className="font-medium">📧 Notificaciones:</span>
                  <p className="text-xs">Se enviarán automáticamente por email y push</p>
                </div>
                <div>
                  <span className="font-medium">🎯 Emparejamiento:</span>
                  <p className="text-xs">Algoritmo {formData.estrategiaEmparejamiento} activado</p>
                </div>
                <div>
                  <span className="font-medium">⚡ Transiciones:</span>
                  <p className="text-xs">Estados cambian automáticamente según horario</p>
                </div>
                <div>
                  <span className="font-medium">🔄 Actualizaciones:</span>
                  <p className="text-xs">Información en tiempo real para todos los jugadores</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={submitLoading}
            className="min-w-32"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Crear Partido Inteligente
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePartido;