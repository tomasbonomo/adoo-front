import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import app from "./firebase";
import { getMessaging, getToken } from "firebase/messaging";
import apiService from "./services/api";

// Verificar que el elemento root existe
const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

// Registro explícito del Service Worker de Firebase Messaging
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/firebase-messaging-sw.js')
      .then(function(registration) {
        console.log('✅ Service Worker registrado correctamente:', registration);
      }).catch(function(err) {
        console.error('❌ Error al registrar el Service Worker:', err);
        console.error('   Detalles del error:', err.message);
        console.error('   Stack trace:', err.stack);
      });
  });
} else {
  console.warn('⚠️ Service Worker no soportado en este navegador');
}

// Obtener y guardar el token FCM si el usuario está logueado
if (localStorage.getItem("token")) {
  try {
    console.log('🔧 Inicializando Firebase Messaging...');
    const messaging = getMessaging(app);
    
    // VAPID_KEY real del proyecto UnoMas
    const VAPID_KEY = "BHZ-U4vIghYz4LSZQ3MYbolcxzFLwqD6n8oeoARbZ38Eprr8O4g7cv5KKNVtxRAkV-Uoe6QSEWOPgUmyE7dvwew";
    
    console.log('🔑 VAPID Key configurada:', VAPID_KEY.substring(0, 10) + '...');
    
    navigator.serviceWorker.ready.then((registration) => {
      console.log('📱 Service Worker listo, obteniendo token FCM...');
      
      getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: registration })
        .then((currentToken) => {
          if (currentToken) {
            console.log('🎯 Token FCM obtenido:', currentToken.substring(0, 20) + '...');
            apiService.guardarPushToken(currentToken)
              .then(() => console.log("✅ Token FCM guardado en backend"))
              .catch((err) => {
                console.error("❌ Error guardando token FCM en backend:", err);
                console.error("   Detalles:", err.message);
              });
          } else {
            console.warn("⚠️ No se obtuvo token FCM. Posibles causas:");
            console.warn("   - Permisos de notificación denegados");
            console.warn("   - Service Worker no registrado correctamente");
            console.warn("   - VAPID Key incorrecta");
            console.warn("   - Problemas de configuración de Firebase");
          }
        })
        .catch((err) => {
          console.error("❌ Error obteniendo token FCM:", err);
          console.error("   Código de error:", err.code);
          console.error("   Mensaje:", err.message);
          console.error("   Stack trace:", err.stack);
        });
    }).catch((err) => {
      console.error("❌ Error esperando Service Worker:", err);
    });
  } catch (e) {
    console.error("❌ Error inicializando FCM:", e);
    console.error("   Detalles:", e.message);
    console.error("   Stack trace:", e.stack);
  }
} else {
  console.log('👤 Usuario no autenticado, saltando inicialización de FCM');
}

// Crear y renderizar la aplicación
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)