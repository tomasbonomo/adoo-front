import React, { useState, useEffect } from 'react';
import { getMessaging, getToken } from "firebase/messaging";
import app from "../../firebase";
import apiService from "../../services/api";
import { Card, Button, Loading, ErrorMessage, SuccessMessage } from '../common';
import { Bell, RefreshCw, Check, X, AlertCircle, Info } from 'lucide-react';

const PushTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [token, setToken] = useState('eggmB1YNO_MCE3E35SFL8S:APA91bE1wKeKLmywwaisFVhOZyYmryHkeKzGoetHhD2WLHeo2uW2kJhaTGG4sZ-hgdJagMjstrpY5CpLtJIluxGigFVVIUZ0aMmpU44CMC9IPh8QqpLloZk');
  const [firebaseStatus, setFirebaseStatus] = useState({
    backendConfigured: false,
    backendStatus: '',
    frontendToken: '',
    serviceWorkerRegistered: false,
    permissionsGranted: false,
    messagingSupported: false
  });

  useEffect(() => {
    checkFirebaseStatus();
  }, []);

  const checkFirebaseStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verificar soporte de messaging
      const messagingSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      setFirebaseStatus(prev => ({ ...prev, messagingSupported }));

      // Verificar permisos
      if ('Notification' in window) {
        setFirebaseStatus(prev => ({ 
          ...prev, 
          permissionsGranted: Notification.permission === 'granted' 
        }));
      }

      // Verificar Service Worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        const hasFirebaseSW = registrations.some(reg => 
          reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
        );
        setFirebaseStatus(prev => ({ ...prev, serviceWorkerRegistered: hasFirebaseSW }));
      }

      // Usar el token específico en lugar de obtenerlo dinámicamente
      setFirebaseStatus(prev => ({ ...prev, frontendToken: token }));

      // Verificar estado del backend
      try {
        const status = await apiService.getFirebaseStatus();
        setFirebaseStatus(prev => ({
          ...prev,
          backendConfigured: status.firebaseConfigured,
          backendStatus: status.configurationStatus
        }));
      } catch (backendError) {
        console.error('Error verificando backend:', backendError);
        setFirebaseStatus(prev => ({
          ...prev,
          backendConfigured: false,
          backendStatus: 'Error conectando con el backend'
        }));
      }

    } catch (err) {
      setError('Error verificando estado de Firebase: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testPushNotification = async () => {
    if (!token) {
      setError('No hay token FCM disponible');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await apiService.testPushDetailed(token);
      
      if (response.success) {
        setSuccess('✅ Push notification enviada exitosamente');
      } else {
        setError(`❌ Error: ${response.message} - ${response.error}`);
      }
    } catch (err) {
      setError('Error enviando push notification: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setError('Las notificaciones no están soportadas en este navegador');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setFirebaseStatus(prev => ({ ...prev, permissionsGranted: true }));
        setSuccess('✅ Permisos de notificación concedidos');
        // Recargar token después de obtener permisos
        await checkFirebaseStatus();
      } else {
        setError('❌ Permisos de notificación denegados');
      }
    } catch (err) {
      setError('Error solicitando permisos: ' + err.message);
    }
  };

  const getStatusIcon = (status) => {
    return status ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-600" />;
  };

  const getStatusText = (status) => {
    return status ? 'Conectado' : 'Desconectado';
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Prueba de Firebase Push Notifications</h3>
            <p className="text-sm text-gray-600">Diagnóstico completo del sistema de notificaciones push</p>
          </div>
        </div>

        {error && <ErrorMessage error={error} onClose={() => setError(null)} />}
        {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

        {/* Diagnóstico de Firebase */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Estado del Sistema</h4>
            <Button 
              onClick={checkFirebaseStatus} 
              loading={loading}
              variant="secondary" 
              size="sm"
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Actualizar
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              {getStatusIcon(firebaseStatus.messagingSupported)}
              <span className="text-sm">Push API:</span>
              <span className={`text-sm font-medium ${firebaseStatus.messagingSupported ? 'text-green-600' : 'text-red-600'}`}>
                {firebaseStatus.messagingSupported ? 'Soportada' : 'No soportada'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(firebaseStatus.backendConfigured)}
              <span className="text-sm">Backend Firebase:</span>
              <span className={`text-sm font-medium ${firebaseStatus.backendConfigured ? 'text-green-600' : 'text-red-600'}`}>
                {getStatusText(firebaseStatus.backendConfigured)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(firebaseStatus.serviceWorkerRegistered)}
              <span className="text-sm">Service Worker:</span>
              <span className={`text-sm font-medium ${firebaseStatus.serviceWorkerRegistered ? 'text-green-600' : 'text-red-600'}`}>
                {getStatusText(firebaseStatus.serviceWorkerRegistered)}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(firebaseStatus.permissionsGranted)}
              <span className="text-sm">Permisos:</span>
              <span className={`text-sm font-medium ${firebaseStatus.permissionsGranted ? 'text-green-600' : 'text-red-600'}`}>
                {firebaseStatus.permissionsGranted ? 'Concedidos' : 'Denegados'}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {getStatusIcon(!!firebaseStatus.frontendToken)}
              <span className="text-sm">Token FCM:</span>
              <span className={`text-sm font-medium ${firebaseStatus.frontendToken ? 'text-green-600' : 'text-red-600'}`}>
                {firebaseStatus.frontendToken ? 'Configurado' : 'No configurado'}
              </span>
            </div>
          </div>
          
          {firebaseStatus.backendStatus && (
            <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
              <strong>Estado del backend:</strong> {firebaseStatus.backendStatus}
            </div>
          )}
        </div>

        {/* Token FCM */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Token FCM (Configurado Manualmente)</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="flex-1 px-3 py-2 border border-blue-200 rounded text-sm font-mono bg-white"
              placeholder="Token FCM no disponible"
            />
            <Button
              onClick={() => navigator.clipboard.writeText(token)}
              variant="secondary"
              size="sm"
              disabled={!token}
            >
              Copiar
            </Button>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Token FCM configurado manualmente para pruebas
          </p>
        </div>

        {/* Acciones */}
        <div className="space-y-4">
          {!firebaseStatus.permissionsGranted && (
            <div className="p-4 bg-amber-50 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium mb-1">Permisos de notificación requeridos</p>
                  <p className="mb-2">Para recibir notificaciones push, necesitas conceder permisos al navegador.</p>
                  <Button
                    onClick={requestNotificationPermission}
                    variant="secondary"
                    size="sm"
                  >
                    Solicitar Permisos
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={testPushNotification}
              loading={loading}
              disabled={!token || !firebaseStatus.backendConfigured}
              className="flex-1"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enviar Notificación de Prueba
            </Button>
          </div>

          {(!token || !firebaseStatus.backendConfigured) && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-start">
                <X className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">No se puede enviar notificación</p>
                  <ul className="text-xs space-y-1">
                    {!token && <li>• Token FCM no disponible</li>}
                    {!firebaseStatus.backendConfigured && <li>• Firebase no configurado en el backend</li>}
                    {!firebaseStatus.permissionsGranted && <li>• Permisos de notificación no concedidos</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-gray-600 mr-2 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Información sobre las notificaciones push:</p>
              <ul className="text-xs space-y-1">
                <li>• Las notificaciones push funcionan solo en navegadores modernos</li>
                <li>• Necesitas conceder permisos de notificación al navegador</li>
                <li>• El Service Worker debe estar registrado correctamente</li>
                <li>• Firebase debe estar configurado tanto en frontend como backend</li>
                <li>• Las notificaciones pueden tardar unos segundos en llegar</li>
                <li>• Token FCM configurado manualmente para pruebas específicas</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PushTest; 