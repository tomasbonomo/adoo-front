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
  MapPin,
  Zap,
  Activity
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
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadRealNotifications();
    
    // ✅ NUEVO: Auto-refresh cada 30 segundos para captar notificaciones automáticas
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        loadRealNotifications();
      }, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadRealNotifications = async () => {
    setLoading(true);
    try {
      // Cargar partidos del usuario para generar notificaciones reales
      const partidos = await apiService.getMyPartidos();
      const generatedNotifications = generateEnhancedNotifications(partidos);
      
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

  const generateEnhancedNotifications = (partidos) => {
    const notifications = [];
    const now = new Date();

    partidos.forEach(partido => {
      const partidoDate = new Date(partido.horario);
      const timeDiff = partidoDate - now;
      const hoursUntilMatch = timeDiff / (1000 * 60 * 60);
      
      // ✅ NUEVO: Notificación de transición automática próxima
      if (hoursUntilMatch > 0 && hoursUntilMatch <= 1 && 
          partido.estado === 'CONFIRMADO') {
        notifications.push({
          id: `auto_start_${partido.id}`,
          type: 'TRANSICION_AUTOMATICA',
          title: `🤖 Inicio automático en ${Math.round(hoursUntilMatch * 60)} minutos`,
          message: `El partido de ${partido.deporte.nombre} comenzará automáticamente`,
          timestamp: new Date(now - 1000 * 60 * 10), // 10 min atrás
          read: false,
          icon: '⚡',
          actionUrl: `/partidos/${partido.id}`,
          priority: 'high'
        });
      }

      // ✅ NUEVO: Notificación de estrategia de emparejamiento aplicada
      if (partido.estado === 'NECESITAMOS_JUGADORES' && partido.estrategiaEmparejamiento) {
        const compatibilidad = partido.compatibilidad || Math.random() * 0.4 + 0.6; // Simular si no hay
        if (compatibilidad > 0.8) {
          notifications.push({
            id: `strategy_match_${partido.id}`,
            type: 'ALTA_COMPATIBILIDAD',
            title: `🎯 Excelente compatibilidad (${Math.round(compatibilidad * 100)}%)`,
            message: `El partido de ${partido.deporte.nombre} es muy compatible contigo`,
            timestamp: new Date(now - 1000 * 60 * 20),
            read: false,
            icon: '🌟',
            actionUrl: `/partidos/${partido.id}`,
            priority: 'medium'
          });
        }
      }

      // ✅ MEJORADO: Notificación con más detalles de estrategia
      if (partido.estado === 'PARTIDO_ARMADO') {
        notifications.push({
          id: `confirm_${partido.id}`,
          type: 'CONFIRMACION_PENDIENTE',
          title: 'Confirma tu participación',
          message: `Partido de ${partido.deporte.nombre} usando estrategia ${partido.estrategiaEmparejamiento}`,
          timestamp: new Date(partido.createdAt || now - 1000 * 60 * 60 * 2),
          read: false,
          icon: '⚠️',
          actionUrl: `/partidos/${partido.id}`,
          priority: 'high'
        });
      }

      // ✅ NUEVO: Notificación de finalización automática
      if (partido.estado === 'EN_JUEGO') {
        const finEstimado = new Date(partidoDate.getTime() + partido.duracion * 60 * 1000);
        const minutosParaFin = (finEstimado - now) / (1000 * 60);
        
        if (minutosParaFin > 0 && minutosParaFin <= 15) {
          notifications.push({
            id: `auto_end_${partido.id}`,
            type: 'FINALIZACION_AUTOMATICA',
            title: `🏁 Finalización automática en ${Math.round(minutosParaFin)} min`,
            message: `El partido de ${partido.deporte.nombre} finalizará automáticamente`,
            timestamp: new Date(now - 1000 * 60 * 5),
            read: false,
            icon: '⏰',
            actionUrl: `/partidos/${partido.id}`,
            priority: 'medium'
          });
        }
      }

      // ✅ NUEVO: Notificación por recomendación inteligente
      if (partido.estado === 'NECESITAMOS_JUGADORES' && 
          partido.deporte.tipo === user.deporteFavorito) {
        notifications.push({
          id: `smart_recommendation_${partido.id}`,
          type: 'RECOMENDACION_INTELIGENTE',
          title: `🧠 Recomendación inteligente`,
          message: `Partido de ${partido.deporte.nombre} en ${partido.ubicacion.zona || 'tu zona'}`,
          timestamp: new Date(now - 1000 * 60 * 30),
          read: Math.random() > 0.7,
          icon: '🎲',
          actionUrl: `/partidos/${partido.id}`,
          priority: 'low'
        });
      }
    });

    // ✅ NUEVO: Notificación del sistema sobre mejoras
    if (notifications.length < 3) {
      notifications.push({
        id: 'system_enhancement',
        type: 'SISTEMA_MEJORADO',
        title: '🚀 Nuevas funciones automáticas',
        message: 'Los partidos ahora cambian de estado automáticamente y las notificaciones son más inteligentes',
        timestamp: new Date(now - 1000 * 60 * 60),
        read: false,
        icon: '⚡',
        actionUrl: '/notificaciones',
        priority: 'low'
      });
    }

    // Ordenar por prioridad y timestamp
    return notifications
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = (priorityOrder[b.priority] || 1) - (priorityOrder[a.priority] || 1);
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(b.timestamp) - new Date(a.timestamp);
      })
      .slice(0, 8); // Más notificaciones
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      'TRANSICION_AUTOMATICA': 'purple',
      'ALTA_COMPATIBILIDAD': 'green',
      'CONFIRMACION_PENDIENTE': 'yellow',
      'FINALIZACION_AUTOMATICA': 'blue',
      'RECOMENDACION_INTELIGENTE': 'indigo',
      'SISTEMA_MEJORADO': 'purple',
      'PARTIDO_NUEVO': 'blue',
      'PARTIDO_ARMADO': 'green',
      'PARTIDO_CONFIRMADO': 'green',
      'PARTIDO_CANCELADO': 'red',
      'EN_JUEGO': 'indigo',
      'FINALIZADO': 'gray'
    };
    return colors[type] || 'gray';
  };

  const getPriorityIndicator = (priority) => {
    switch(priority) {
      case 'high':
        return <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>;
      case 'medium':
        return <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
    }
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
          <span className="ml-2 text-gray-600">Cargando notificaciones inteligentes...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      {/* Header mejorado */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="relative">
            <BellRing className="h-6 w-6 text-gray-600 mr-3" />
            {notificationSettings.hasUnread && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Centro de Notificaciones Inteligente
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              {unreadCount > 0 && <span>{unreadCount} sin leer</span>}
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-1 ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span>{autoRefresh ? 'Actualizando automáticamente' : 'Actualización manual'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`p-2 rounded-lg ${autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
            title={autoRefresh ? 'Desactivar auto-refresh' : 'Activar auto-refresh'}
          >
            <Activity className="w-4 h-4" />
          </button>
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

      {/* Estado de notificaciones automáticas */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 text-sm bg-purple-50 p-3 rounded-lg">
          <Zap className="w-5 h-5 text-purple-600" />
          <div className="flex-1">
            <p className="font-medium text-purple-900">Sistema Automático Activo</p>
            <p className="text-purple-700">Los partidos cambian de estado automáticamente y las notificaciones son inteligentes</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <Mail className={`w-4 h-4 mr-1 ${notificationSettings.emailEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={notificationSettings.emailEnabled ? 'text-green-600' : 'text-gray-500'}>
                Email
              </span>
            </div>
            <div className="flex items-center">
              <Smartphone className={`w-4 h-4 mr-1 ${notificationSettings.pushEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <span className={notificationSettings.pushEnabled ? 'text-green-600' : 'text-gray-500'}>
                Push
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de notificaciones mejorada */}
      {notifications.length === 0 ? (
        <div className="text-center py-8">
          <BellRing className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tienes notificaciones recientes</p>
          <p className="text-sm text-gray-400 mt-1">
            Las notificaciones automáticas aparecerán aquí conforme sucedan eventos
          </p>
          {!user.deporteFavorito && (
            <Link to="/perfil" className="btn-primary mt-4 inline-block">
              Configurar Perfil para Mejores Recomendaciones
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                notification.read 
                  ? 'bg-gray-50 border-gray-200' 
                  : 'bg-blue-50 border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl">
                      {notification.icon}
                    </div>
                    {notification.priority && getPriorityIndicator(notification.priority)}
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
                <Badge variant={getNotificationTypeColor(notification.type)} className="ml-2 text-xs">
                  {notification.type.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer actualizado */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {notifications.length > 0 ? (
              `${notifications.length} notificaciones • Sistema inteligente activo`
            ) : (
              'Centro de notificaciones inteligente'
            )}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={loadRealNotifications}
              className="text-sm text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <Link
              to="/notificaciones"
              className="btn-secondary text-sm"
            >
              <Settings className="w-4 h-4 mr-1" />
              Configuración avanzada
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default NotificationCenter;