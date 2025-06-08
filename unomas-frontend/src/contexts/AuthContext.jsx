import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario logueado al cargar la app
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    if (apiService.isAuthenticated()) {
      loadUserProfile();
    } else {
      setLoading(false);
    }
  };

  const loadUserProfile = () => {
    apiService.getUserProfile()
      .then(userData => {
        setUser(userData);
        setError(null);
      })
      .catch(err => {
        console.error('Error cargando perfil:', err);
        // Si hay error al cargar el perfil, probablemente el token sea inválido
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const login = (credentials) => {
    setLoading(true);
    setError(null);
    
    return apiService.login(credentials)
      .then(response => {
        // Cargar el perfil del usuario después del login
        return loadUserProfile();
      })
      .catch(err => {
        const errorMessage = apiService.handleApiError(err);
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      });
  };

  const register = (userData) => {
    setLoading(true);
    setError(null);
    
    return apiService.register(userData)
      .then(response => {
        // Cargar el perfil del usuario después del registro
        return loadUserProfile();
      })
      .catch(err => {
        const errorMessage = apiService.handleApiError(err);
        setError(errorMessage);
        setLoading(false);
        throw new Error(errorMessage);
      });
  };

  const logout = () => {
    apiService.removeToken();
    setUser(null);
    setError(null);
  };

  const updateProfile = (profileData) => {
    setLoading(true);
    setError(null);
    
    return apiService.updateUserProfile(profileData)
      .then(updatedUser => {
        setUser(updatedUser);
        setError(null);
        return updatedUser;
      })
      .catch(err => {
        const errorMessage = apiService.handleApiError(err);
        setError(errorMessage);
        throw new Error(errorMessage);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const clearError = () => {
    setError(null);
  };

  const isAdmin = () => {
    return user && user.role === 'ADMIN';
  };

  const isOrganizador = () => {
    return user && (user.role === 'ORGANIZADOR' || user.role === 'ADMIN');
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAdmin,
    isOrganizador,
    checkAuthStatus,
    loadUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};