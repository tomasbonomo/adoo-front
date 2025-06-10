import React from 'react';
import { Bell } from 'lucide-react';
import NotificationSettings from './NotificationSettings';

const NotificationsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Bell className="h-8 w-8 text-primary-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            Notificaciones
          </h1>
        </div>
        <p className="text-gray-600">
          Configura cómo y cuándo quieres recibir notificaciones sobre tus partidos y actividades deportivas
        </p>
      </div>

      {/* Componente de configuración */}
      <NotificationSettings />
    </div>
  );
};

export default NotificationsPage;