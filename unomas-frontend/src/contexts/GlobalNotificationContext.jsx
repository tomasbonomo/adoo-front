import React, { createContext, useContext, useState, useCallback } from 'react';

const GlobalNotificationContext = createContext();

export const useGlobalNotifications = () => {
  const context = useContext(GlobalNotificationContext);
  if (!context) {
    throw new Error('useGlobalNotifications debe ser usado dentro de un GlobalNotificationProvider');
  }
  return context;
};

export const GlobalNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Agregar una notificación
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      timestamp: new Date(),
      autoRemove: true,
      duration: 5000, // 5 segundos por defecto
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remover después del tiempo especificado
    if (newNotification.autoRemove) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remover una notificación
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Limpiar todas las notificaciones
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Notificación específica para cuando alguien se une a un partido
  const notifyPlayerJoined = useCallback((playerName, partidoInfo) => {
    addNotification({
      type: 'player_joined',
      title: '👥 Nuevo jugador se unió',
      message: `${playerName} se unió al partido de ${partidoInfo.deporte}`,
      partidoId: partidoInfo.id,
      variant: 'success',
      duration: 6000
    });
  }, [addNotification]);

  // Notificación cuando un partido se completa
  const notifyPartidoComplete = useCallback((partidoInfo) => {
    addNotification({
      type: 'partido_complete',
      title: '✅ ¡Partido completo!',
      message: `El partido de ${partidoInfo.deporte} ya tiene todos los jugadores`,
      partidoId: partidoInfo.id,
      variant: 'success',
      duration: 7000
    });
  }, [addNotification]);

  // Notificación cuando alguien se va de un partido
  const notifyPlayerLeft = useCallback((playerName, partidoInfo) => {
    addNotification({
      type: 'player_left',
      title: '👋 Jugador se fue',
      message: `${playerName} abandonó el partido de ${partidoInfo.deporte}`,
      partidoId: partidoInfo.id,
      variant: 'warning',
      duration: 5000
    });
  }, [addNotification]);

  // Notificación genérica de éxito
  const notifySuccess = useCallback((message, title = '✅ Éxito') => {
    addNotification({
      type: 'success',
      title,
      message,
      variant: 'success'
    });
  }, [addNotification]);

  // Notificación genérica de error
  const notifyError = useCallback((message, title = '❌ Error') => {
    addNotification({
      type: 'error',
      title,
      message,
      variant: 'error',
      duration: 8000
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    // Métodos específicos
    notifyPlayerJoined,
    notifyPartidoComplete,
    notifyPlayerLeft,
    notifySuccess,
    notifyError
  };

  return (
    <GlobalNotificationContext.Provider value={value}>
      {children}
    </GlobalNotificationContext.Provider>
  );
};