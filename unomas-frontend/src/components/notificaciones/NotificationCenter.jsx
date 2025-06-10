import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell, 
  BellRing, 
  Mail, 
  Smartphone, 
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Trophy,
  Users,
  MapPin
} from 'lucide-react';
import { Card, Badge, Button } from '../common';
import { getDeporteIcon } from '../../config/config';
import apiService from '../../services/api';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    pushEnabled: true,
    hasUnread: false
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealNotifications();
  }, []);

  const loadRealNotifications = async () => {
    setLoading(true);
    try {
      // Cargar partidos del usuario para generar notificaciones reales
      const partidos = await apiService.getMyPartidos();
      const generatedNotifications = generateNotificationsFromPartidos(partidos);
      
      setNotifications(generatedNotifications);
      
      // Verificar si hay notificaciones no leídas
      const hasUnread = generatedNotifications.some(n => !n.read);
      setNotificationSettings(prev => ({ ...prev, hasUnread }));
      
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const generateNotificationsFromPartidos = (partidos) => {
    const notifications = [];
    const now = new Date();

    partidos.forEach(partido => {
      const partidoDate = new Date(partido.horario);
      const timeDiff = partidoDate - now;
      const hoursUntilMatch = timeDiff / (1000 * 60 * 60);
      
      // Notificación: Partido próximo (dentro de 24 horas)
      if (hoursUntilMatch > 0 && hoursUntilMatch <= 24 && 
          ['CONFIRMADO', 'PARTIDO_ARMADO'].includes(partido.estado)) {
        notifications.push({
          id: `upcoming_${partido.id}`,
          type: 'PARTIDO_PROXIMO',
          title: `Partido de ${partido.deporte.nombre} en ${Math.round(hoursUntilMatch)} horas`,
          message: `${partido.ubicacion.direccion} - ${partidoDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
          timestamp: new Date(now - 1000 * 60 * 60), // 1 hora atrás
          read: false,
          icon: getDeporteIcon(partido.deporte.tipo),
          actionUrl: `/partidos/${partido.id}`
        });
      }

      // Notificación: Necesita confirmación
      if (partido.estado === 'PARTIDO_ARMADO') {
        notifications.push({
          id: `confirm_${partido.id}`,
          type: 'CONFIRMACION_PENDIENTE',
          title: 'Confirma tu participación',
          message: `Partido de ${partido.deporte.nombre} pendiente de confirmación`,
          timestamp: new Date(partido.createdAt || now - 1000 * 60 * 60 * 2),
          read: false,
          icon: '⚠️',
          actionUrl: `/partidos/${partido.id}`
        });
      }

      // Notificación: Partido armado (cuando se completó)
      if (partido.estado === 'PARTIDO_ARMADO' && 
          partido.cantidadJugadoresActual >= partido.cantidadJugadoresRequeridos) {
        notifications.push({
          id: `armed_${partido.id}`,
          type: 'PARTIDO_ARMADO',
          title: 'Partido completado',
          message: `El partido de ${partido.deporte.nombre} ya tiene todos los jugadores`,
          timestamp: new Date(partido.createdAt || now - 1000 * 60 * 60 * 3),
          read: Math.random() > 0.5, // Algunas leídas, otras no
          icon: getDeporteIcon(partido.deporte.tipo),
          actionUrl: `/partidos/${partido.id}`
        });
      }

      // Notificación: Buscando jugadores
      if (partido.estado === 'NECESITAMOS_JUGADORES') {
        notifications.push({
          id: `searching_${partido.id}`,
          type: 'BUSCANDO_JUGADORES',
          title: `Partido de ${partido.deporte.nombre} buscando jugadores`,
          message: `${partido.cantidadJugadoresActual}/${partido.cantidadJugadoresRequeridos} jugadores confirmados`,
          timestamp: new Date(partido.createdAt || now - 1000 * 60 * 60 * 6),
          read: true,
          icon: getDeporteIcon(partido.deporte.tipo),
          actionUrl: `/partidos/${partido.id}`
        });
      }
    });

    // Buscar partidos recomendados si el usuario tiene deporte favorito
    if (user.deporteFavorito && notifications.length < 3) {
      generateRecommendationNotifications(notifications);
    }

    // Ordenar por timestamp (más recientes primero) y limitar a 5
    return notifications
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5);
  };

  const generateRecommendationNotifications = async (existingNotifications) => {
    try {
      const criterios = {
        tipoDeporte: user.deporteFavorito,
        soloDisponibles: true,
        ordenarPor: 'fecha',
        orden: 'asc'
      };
      
      const response = await apiService.searchPartidos(criterios, 0, 3);
      const partidosDisponibles = response.content || [];
      
      partidosDisponibles.forEach((partido, index) => {
        if (existingNotifications.length < 5) {
          existingNotifications.push({
            id: `recommendation_${partido.id}`,
            type: 'PARTIDO_RECOMENDADO',
            title: `Nuevo partido de ${partido.deporte.nombre} disponible`,
            message: `${partido.ubicacion.direccion} - ${new Date(partido.horario).toLocaleDateString('es-ES')}`,
            timestamp: new Date(Date.now() - 1000 * 60 * 30 * (index + 1)), // Escalonado
            read: false,
            icon: getDeporteIcon(partido.deporte.tipo),
            actionUrl: `/partidos/${partido.id}`
          });
        }
      });
    } catch (error) {
      console.error('Error generando recomendaciones:', error);
    }
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      'PARTIDO_NUEVO': 'blue',
      'PARTIDO_ARMADO': 'green',
      'CONFIRMACION_PENDIENTE': 'yellow',
      'PARTIDO_CONFIRMADO': 'green',
      'PARTIDO_CANCELADO': 'red',
      'EN_JUEGO': 'indigo',
      'FINALIZADO': 'gray',
      'PARTIDO_PROXIMO': 'purple',
      'BUSCANDO_JUGADORES': 'blue',
      'PARTIDO_RECOMENDADO': 'green'
    };
    return colors[type] || 'gray';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - new Date(timestamp);
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return 'Ahora mismo';
    } else if (diffMins < 60) {
      return `Hace ${diffMins} min`;
    } else if (diffHours < 24) {
      return `Hace ${diffHours}h`;
    } else {
      return `Hace ${diffDays}d`;
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    
    // Actualizar hasUnread
    const stillHasUnread = notifications.some(n => n.id !== notificationId && !n.read);
    setNotificationSettings(prev => ({ ...prev, hasUnread: stillHasUnread }));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setNotificationSettings(prev => ({ ...prev, hasUnread: false }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600">Cargando notificaciones...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600 mr-3" />
            {notificationSettings.hasUnread && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600">{unreadCount} sin leer</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={markAllAsRead}
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Marcar todas como leídas
            </Button>
          )}
          <Link
            to="/notificaciones"
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            <Settings className="w-4 h-4 mr-1 inline" />
            Configurar
          </Link>
        </div>
      </div>

      {/* Estado de configuraciones */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center">
            <Mail className={`w-4 h-4 mr-1 ${notificationSettings.emailEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={notificationSettings.emailEnabled ? 'text-green-600' : 'text-gray-500'}>
              Email {notificationSettings.emailEnabled ? 'activo' : 'inactivo'}
            </span>
          </div>
          <div className="flex items-center">
            <Smartphone className={`w-4 h-4 mr-1 ${notificationSettings.pushEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <span className={notificationSettings.pushEnabled ? 'text-green-600' : 'text-gray-500'}>
              Push {notificationSettings.pushEnabled ? 'activo' : 'inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de notificaciones */}
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes notificaciones recientes</p>
          <p className="text-sm text-gray-400 mt-1">
            {user.deporteFavorito ? 
              'Las notificaciones sobre tus partidos aparecerán aquí' : 
              'Configura tu deporte favorito para recibir recomendaciones'
            }
          </p>
          {!user.deporteFavorito && (
            <Link to="/perfil" className="btn-primary mt-4 inline-block">
              Configurar Perfil
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors duration-200 ${
                notification.read 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {notification.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h4 className={`text-sm font-medium ${
                        notification.read ? 'text-gray-900' : 'text-blue-900'
                      }`}>
                        {notification.title}
                      </h4>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-2"></div>
                      )}
                    </div>
                    <p className={`text-sm ${
                      notification.read ? 'text-gray-600' : 'text-blue-700'
                    }`}>
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimeAgo(notification.timestamp)}
                      </span>
                      <div className="flex items-center space-x-2">
                        {notification.actionUrl && (
                          <Link
                            to={notification.actionUrl}
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Ver detalles
                          </Link>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-gray-500 hover:text-gray-700"
                          >
                            Marcar como leída
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Badge variant={getNotificationTypeColor(notification.type)} className="ml-2">
                  {notification.type.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {notifications.length > 0 ? (
              `${notifications.length} notificaciones recientes`
            ) : (
              'Mantente al día con tus partidos'
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadRealNotifications}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Actualizar
            </button>
            <Link
              to="/notificaciones"
              className="btn-secondary text-sm"
            >
              <Settings className="w-4 h-4 mr-1" />
              Gestionar notificaciones
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCenter;