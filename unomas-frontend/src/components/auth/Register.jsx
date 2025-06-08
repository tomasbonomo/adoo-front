import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Trophy } from 'lucide-react';
import { Input, Button, ErrorMessage, Loading, Select } from '../common';
import apiService from '../../services/api';

const Register = () => {
  const { register, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nombreUsuario: '',
    email: '',
    contrasena: '',
    confirmarContrasena: '',
    deporteFavorito: '',
    nivelJuego: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deportes, setDeportes] = useState([]);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Cargar deportes
  useEffect(() => {
    loadDeportes();
    clearError();
  }, [clearError]);

  const loadDeportes = () => {
    apiService.getDeportesTypes()
      .then(tipos => {
        setDeportes(tipos);
      })
      .catch(err => {
        console.error('Error cargando tipos de deporte:', err);
      });
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nombreUsuario.trim()) {
      errors.nombreUsuario = 'El nombre de usuario es obligatorio';
    } else if (formData.nombreUsuario.trim().length < 3) {
      errors.nombreUsuario = 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El email no es válido';
    }
    
    if (!formData.contrasena) {
      errors.contrasena = 'La contraseña es obligatoria';
    } else if (formData.contrasena.length < 8) {
      errors.contrasena = 'La contraseña debe tener al menos 8 caracteres';
    }
    
    if (!formData.confirmarContrasena) {
      errors.confirmarContrasena = 'Confirma tu contraseña';
    } else if (formData.contrasena !== formData.confirmarContrasena) {
      errors.confirmarContrasena = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    clearError();
    
    // Preparar datos para envío (sin confirmarContrasena)
    const { confirmarContrasena, ...registerData } = formData;
    
    // Convertir strings vacíos a null para campos opcionales
    if (!registerData.deporteFavorito) {
      registerData.deporteFavorito = null;
    }
    if (!registerData.nivelJuego) {
      registerData.nivelJuego = null;
    }
    
    register(registerData)
      .then(() => {
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        console.error('Error en registro:', err);
        // El error ya se maneja en el contexto
      });
  };

  const deporteOptions = [
    { value: '', label: 'Selecciona un deporte (opcional)' },
    ...deportes.map(deporte => ({ value: deporte, label: deporte }))
  ];

  const nivelOptions = [
    { value: '', label: 'Selecciona tu nivel (opcional)' },
    { value: 'PRINCIPIANTE', label: 'Principiante' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZADO', label: 'Avanzado' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Creando cuenta..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Trophy className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Crear Cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <Link 
              to="/login" 
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nombre de usuario */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="nombreUsuario"
                  name="nombreUsuario"
                  type="text"
                  required
                  className={`input-field pl-10 ${formErrors.nombreUsuario ? 'border-red-500' : ''}`}
                  placeholder="Nombre de usuario"
                  value={formData.nombreUsuario}
                  onChange={handleChange}
                />
              </div>
              {formErrors.nombreUsuario && (
                <p className="text-red-500 text-sm mt-1">{formErrors.nombreUsuario}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className={`input-field pl-10 ${formErrors.email ? 'border-red-500' : ''}`}
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              {formErrors.email && (
                <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
              )}
            </div>

            {/* Contraseña */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contrasena"
                  name="contrasena"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className={`input-field pl-10 pr-10 ${formErrors.contrasena ? 'border-red-500' : ''}`}
                  placeholder="Contraseña"
                  value={formData.contrasena}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formErrors.contrasena && (
                <p className="text-red-500 text-sm mt-1">{formErrors.contrasena}</p>
              )}
            </div>

            {/* Confirmar contraseña */}
            <div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmarContrasena"
                  name="confirmarContrasena"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className={`input-field pl-10 pr-10 ${formErrors.confirmarContrasena ? 'border-red-500' : ''}`}
                  placeholder="Confirmar contraseña"
                  value={formData.confirmarContrasena}
                  onChange={handleChange}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {formErrors.confirmarContrasena && (
                <p className="text-red-500 text-sm mt-1">{formErrors.confirmarContrasena}</p>
              )}
            </div>

            {/* Deporte favorito */}
            <Select
              name="deporteFavorito"
              options={deporteOptions}
              value={formData.deporteFavorito}
              onChange={handleChange}
            />

            {/* Nivel de juego */}
            <Select
              name="nivelJuego"
              options={nivelOptions}
              value={formData.nivelJuego}
              onChange={handleChange}
            />
          </div>

          {error && <ErrorMessage error={error} onClose={clearError} />}

          <div>
            <Button
              type="submit"
              loading={loading}
              className="group relative w-full flex justify-center"
              size="lg"
            >
              Crear Cuenta
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Al registrarte, aceptas nuestros términos y condiciones
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;