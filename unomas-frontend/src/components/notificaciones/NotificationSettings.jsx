import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bell,
  Mail,
  Smartphone,
  Settings,
  Send,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';
import { Card, Loading, ErrorMessage, SuccessMessage, Button, Input } from '../common';
import apiService from '../../services/api';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState({ email: false, push: false });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    notifyNewPartido: true,
    notifyPartidoArmado: true,
    notifyPartidoConfirmado: true,
    notifyEstadoChange: true
  });

  const [testData, setTestData] = useState({
    testEmail: user?.email || '',
    testPushToken: ''
  });

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = () => {
    // TODO: Cuando el backend tenga endpoint para obtener configuraciones
    // Por ahora usamos valores por defecto
    console.log('📱 Cargando configuración de notificaciones...');
  };

  const saveSettings = () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    apiService.configureNotifications(settings)
      .then(response => {
        setSuccess('Configuración de notificaciones guardada exitosamente');
      })
      .catch(err => {
        console.error('Error guardando configuraciones:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const testEmailNotification = () => {
    if (!testData.testEmail) {
      setError('Ingresa un email para probar');
      return;
    }

    setTestLoading(prev => ({ ...prev, email: true }));
    setError(null);
    setSuccess(null);

    apiService.testEmail(testData.testEmail)
      .then(response => {
        setSuccess(`Email de prueba enviado a ${testData.testEmail}`);
      })
      .catch(err => {
        console.error('Error enviando email de prueba:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setTestLoading(prev => ({ ...prev, email: false }));
      });
  };

  const testPushNotification = () => {
    if (!testData.testPushToken) {
      setError('Ingresa un token push para probar');
      return;
    }

    setTestLoading(prev => ({ ...prev, push: true }));
    setError(null);
    setSuccess(null);

    apiService.testPush(testData.testPushToken)
      .then(response => {
        setSuccess('Push notification enviada exitosamente');
      })
      .catch(err => {
        console.error('Error enviando push notification:', err);
        setError(apiService.handleApiError(err));
      })
      .finally(() => {
        setTestLoading(prev => ({ ...prev, push: false }));
      });
  };

  const handleSettingChange = (setting, value) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const handleTestDataChange = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <Bell className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h3>
            <p className="text-sm text-gray-600">Personaliza cómo y cuándo quieres recibir notificaciones</p>
          </div>
        </div>

        {error && <ErrorMessage error={error} onClose={() => setError(null)} />}
        {success && <SuccessMessage message={success} onClose={() => setSuccess(null)} />}

        {/* Configuraciones generales */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-900">Tipos de Notificaciones</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones por Email</p>
                  <p className="text-sm text-gray-600">Recibe notificaciones en tu correo electrónico</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Smartphone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notificaciones Push</p>
                  <p className="text-sm text-gray-600">Recibe notificaciones en tiempo real en tu dispositivo</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Configuraciones específicas */}
        <div className="space-y-4 mb-6">
          <h4 className="font-medium text-gray-900">Eventos a Notificar</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Nuevos partidos de mi deporte</p>
                <p className="text-xs text-gray-600">Para tu deporte favorito</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyNewPartido}
                onChange={(e) => handleSettingChange('notifyNewPartido', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Partido armado</p>
                <p className="text-xs text-gray-600">Cuando se completan los jugadores</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyPartidoArmado}
                onChange={(e) => handleSettingChange('notifyPartidoArmado', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Partido confirmado</p>
                <p className="text-xs text-gray-600">Cuando el partido está listo</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyPartidoConfirmado}
                onChange={(e) => handleSettingChange('notifyPartidoConfirmado', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Cambios de estado</p>
                <p className="text-xs text-gray-600">En juego, finalizado, cancelado</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifyEstadoChange}
                onChange={(e) => handleSettingChange('notifyEstadoChange', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* Botón guardar */}
        <div className="pt-4 border-t border-gray-200">
          <Button onClick={saveSettings} loading={loading} className="w-full md:w-auto">
            <Settings className="w-4 h-4 mr-2" />
            Guardar Configuración
          </Button>
        </div>
      </Card>

      {/* Pruebas de notificaciones */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Probar Notificaciones</h3>
        <p className="text-sm text-gray-600 mb-6">
          Envía notificaciones de prueba para verificar que la configuración funciona correctamente
        </p>

        <div className="space-y-6">
          {/* Test Email */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-blue-900">Prueba de Email</h4>
            </div>
            <div className="flex space-x-3">
              <Input
                placeholder="email@ejemplo.com"
                value={testData.testEmail}
                onChange={(e) => handleTestDataChange('testEmail', e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={testEmailNotification}
                loading={testLoading.email}
                variant="secondary"
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar Prueba
              </Button>
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Se enviará un email de prueba a la dirección especificada
            </p>
          </div>

          {/* Test Push */}
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center mb-3">
              <Smartphone className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Prueba de Push Notification</h4>
            </div>
            <div className="flex space-x-3">
              <Input
                placeholder="Token de dispositivo push"
                value={testData.testPushToken}
                onChange={(e) => handleTestDataChange('testPushToken', e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={testPushNotification}
                loading={testLoading.push}
                variant="secondary"
              >
                <Send className="w-4 h-4 mr-1" />
                Enviar Prueba
              </Button>
            </div>
            <p className="text-xs text-green-700 mt-2">
              Se enviará una notificación push al token especificado
            </p>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-amber-50 rounded-lg">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
            <div className="text-sm text-amber-700">
              <p className="font-medium mb-1">Información sobre las notificaciones:</p>
              <ul className="text-xs space-y-1">
                <li>• Las notificaciones por email se envían instantáneamente</li>
                <li>• Las push notifications requieren que tengas la app instalada y permisos habilitados</li>
                <li>• Puedes cambiar estas configuraciones en cualquier momento</li>
                <li>• Si no recibes notificaciones, verifica tu carpeta de spam</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;