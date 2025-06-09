import  { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { Card, Loading, ErrorMessage, SuccessMessage, Button, Input, Select } from '../common';
// import ZonaSelector from '../ubicaciones/ZonaSelector'; // TODO: Crear este componente más tarde


// Componente temporal de ZonaSelector simplificado
const ZonaSelectorSimple = ({ value, onChange, label, showStats = false }) => {
  const [zonas, setZonas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar zonas disponibles
    fetch('http://localhost:8080/api/v1/ubicaciones/zonas')
      .then(response => response.json())
      .then(zonasData => {
        setZonas(zonasData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando zonas:', err);
        // Zonas por defecto
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
          Esto ayudará a otros jugadores de la zona a encontrar tu partido.
        </div>
      )}
    </div>
  );
};
import apiService from '../../services/api';

const CreatePartido = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deportes, setDeportes] = useState([]);

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
    estrategiaEmparejamiento: 'POR_NIVEL'
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

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


  // MEJORADO: Validación más robusta
  const validateForm = () => {
    const errors = {};
    
    // Validar tipo de deporte
    if (!formData.tipoDeporte) {
      errors.tipoDeporte = 'Selecciona un deporte';
    }
    
    // Validar cantidad de jugadores
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
    
    // Validar duración
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
    
    // Validar dirección
    if (!formData.ubicacion.direccion.trim()) {
      errors.direccion = 'La dirección es obligatoria';
    } else if (formData.ubicacion.direccion.trim().length < 5) {
      errors.direccion = 'La dirección debe tener al menos 5 caracteres';
    }
    
    // Validar horario
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
        // Verificar que no sea demasiado lejana (ej: más de 1 año)
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (selectedDate > oneYearFromNow) {
          errors.horario = 'La fecha no puede ser mayor a un año';
        }
      }
    }

    // Validar coordenadas si se proporcionan
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
    
    // Limpiar error del campo
    if (formErrors[field] || formErrors[field.split('.')[1]]) {
      const errorField = field.includes('.') ? field.split('.')[1] : field;
      setFormErrors(prev => ({
        ...prev,
        [errorField]: ''
      }));
    }
  };

  // MEJORADO: Mejor manejo de errores y logging
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setError(null);
    setSuccess(null);

    // Log de los datos que se van a enviar para debugging
    console.log('📤 Datos del formulario a enviar:', formData);

    apiService.createPartido(formData)
      .then(response => {
        console.log('✅ Partido creado exitosamente:', response);
        setSuccess('¡Partido creado exitosamente!');
        setTimeout(() => {
          navigate(`/partidos/${response.id}`);
        }, 2000);
      })
      .catch(err => {
        console.error('❌ Error creando partido:', err);
        setError(apiService.handleApiError(err));
        
        // Scroll hacia arriba para mostrar el error
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .finally(() => {
        setSubmitLoading(false);
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

  const estrategiaOptions = [
    { value: 'POR_NIVEL', label: 'Por nivel de habilidad' },
    { value: 'POR_CERCANIA', label: 'Por cercanía geográfica' },
    { value: 'POR_HISTORIAL', label: 'Por historial de partidos' }
  ];

  // Generar fecha mínima (ahora + 1 hora)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Loading size="lg" text="Cargando formulario..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Nuevo Partido
        </h1>
        <p className="text-gray-600">
          Organiza un partido y encuentra jugadores para completar tu equipo
        </p>
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
                  <li>• Revisa la consola del navegador (F12) para más detalles técnicos</li>
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
                  // Sugerir cantidad de jugadores basada en el deporte
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

            <div>
              <Select
                label="Estrategia de Emparejamiento"
                options={estrategiaOptions}
                value={formData.estrategiaEmparejamiento}
                onChange={(e) => handleChange('estrategiaEmparejamiento', e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">
                Define cómo se seleccionarán los jugadores
              </p>
            </div>
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
                label="Zona"
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
                label="Latitud (opcional)"
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
                label="Longitud (opcional)"
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
                <p className="font-medium mb-1">Consejos para la ubicación:</p>
                <ul className="text-xs space-y-1">
                  <li>• Sé específico con la dirección (nombre de la cancha, club, etc.)</li>
                  <li>• Las coordenadas GPS ayudan a otros jugadores a encontrar el lugar exacto</li>
                  <li>• Selecciona la zona para facilitar los filtros de búsqueda</li>
                  <li>• Puedes obtener coordenadas desde Google Maps haciendo clic derecho en el mapa</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* Resumen */}
        {formData.tipoDeporte && formData.cantidadJugadoresRequeridos && formData.horario && (
          <Card className="p-6 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Partido</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
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
                <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                <div>
                  <p className="font-medium text-gray-900">
                    {formData.ubicacion.zona || 'Sin zona'}
                  </p>
                  <p className="text-gray-600">{formData.estrategiaEmparejamiento}</p>
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
            Crear Partido
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreatePartido;