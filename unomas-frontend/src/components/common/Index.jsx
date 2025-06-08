import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// Loading Spinner Component
export const Loading = ({ size = 'md', text = 'Cargando...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600`} />
        <p className="text-sm text-gray-600">{text}</p>
      </div>
    </div>
  );
};

// Error Message Component
export const ErrorMessage = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span className="flex-1">{error}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-500 hover:text-red-700 ml-2"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Success Message Component
export const SuccessMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 mr-2" />
        <span className="flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-green-500 hover:text-green-700 ml-2"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Info Message Component
export const InfoMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-center">
        <Info className="w-5 h-5 mr-2" />
        <span className="flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-blue-500 hover:text-blue-700 ml-2"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Warning Message Component
export const WarningMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg mb-4">
      <div className="flex items-center">
        <AlertTriangle className="w-5 h-5 mr-2" />
        <span className="flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-yellow-500 hover:text-yellow-700 ml-2"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Protected Route Component
export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return <Loading size="lg" text="Verificando autenticación..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Empty State Component
export const EmptyState = ({ 
  icon: Icon = Info, 
  title = 'No hay datos', 
  description = 'No se encontraron elementos para mostrar.',
  action = null 
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action}
    </div>
  );
};

// Card Component
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
};

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success'
  };

  const sizes = {
    sm: 'py-1 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-3 px-6 text-lg'
  };

  return (
    <button
      className={`
        ${variants[variant]} 
        ${sizes[size]} 
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} 
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
};

// Input Component
export const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

// Select Component
export const Select = ({ label, options = [], error, className = '', ...props }) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        className={`input-field ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

// Badge Component
export const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    indigo: 'bg-indigo-100 text-indigo-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};