import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle, 
  AlertCircle, 
  Info, 
  X, 
  Users,
  Trophy,
  AlertTriangle 
} from 'lucide-react';
import { useGlobalNotifications } from '../../contexts/GlobalNotificationContext';
import { getDeporteIcon } from '../../config/config';

const GlobalNotificationToast = () => {
  const { notifications, removeNotification } = useGlobalNotifications();

  const getVariantStyles = (variant) => {
    const styles = {
      success: {
        container: 'bg-green-50 border-green-200 text-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      error: {
        container: 'bg-red-50 border-red-200 text-red-800',
        icon: AlertCircle,
        iconColor: 'text-red-600'
      },
      warning: {
        container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        icon: AlertTriangle,
        iconColor: 'text-yellow-600'
      },
      info: {
        container: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: Info,
        iconColor: 'text-blue-600'
      }
    };
    return styles[variant] || styles.info;
  };

  const getNotificationIcon = (notification) => {
    // Iconos específicos por tipo de notificación
    switch(notification.type) {
      case 'player_joined':
        return '👥';
      case 'partido_complete':
        return '✅';
      case 'player_left':
        return '👋';
      case 'partido_nuevo':
        return '🆕';
      default:
        return '📢';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    if (diffSeconds < 60) return 'Ahora';
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h`;
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
      {notifications.map(notification => {
        const variantStyles = getVariantStyles(notification.variant || 'info');
        const IconComponent = variantStyles.icon;

        return (
          <div
            key={notification.id}
            className={`
              ${variantStyles.container}
              border rounded-lg shadow-lg p-4 
              transform transition-all duration-300 ease-in-out
              animate-slide-in-right
            `}
          >
            <div className="flex items-start">
              {/* Icono principal */}
              <div className="flex-shrink-0 flex items-center space-x-2">
                <span className="text-2xl">
                  {getNotificationIcon(notification)}
                </span>
                <IconComponent className={`h-5 w-5 ${variantStyles.iconColor}`} />
              </div>

              {/* Contenido */}
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">
                    {notification.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs opacity-75">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm mt-1 opacity-90">
                  {notification.message}
                </p>

                {/* Acción para ir al partido */}
                {notification.partidoId && (
                  <div className="mt-2">
                    <Link
                      to={`/partidos/${notification.partidoId}`}
                      onClick={() => removeNotification(notification.id)}
                      className="text-xs font-medium underline opacity-75 hover:opacity-100 transition-opacity"
                    >
                      Ver partido →
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso para auto-dismiss */}
            {notification.autoRemove && notification.duration && (
              <div className="mt-3 w-full bg-black bg-opacity-10 rounded-full h-1">
                <div 
                  className="bg-current h-1 rounded-full animate-progress-bar"
                  style={{
                    animationDuration: `${notification.duration}ms`
                  }}
                ></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default GlobalNotificationToast;