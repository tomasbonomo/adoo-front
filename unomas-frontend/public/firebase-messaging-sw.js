// Importa los scripts de Firebase
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Configuración de Firebase de tu proyecto (debe ser EXACTAMENTE igual a la del frontend)
firebase.initializeApp({
  apiKey: "AIzaSyCur0oZmi8nAyO0lkNGoi6_rGVp6_c0w5w",
  authDomain: "uno-mas-1f274.firebaseapp.com",
  projectId: "uno-mas-1f274",
  storageBucket: "uno-mas-1f274.firebasestorage.app",
  messagingSenderId: "841760213313",
  appId: "1:841760213313:web:4cc1190e492ae58e2239c0",
  measurementId: "G-YVXV2D40PT"
});

// Inicializa messaging
const messaging = firebase.messaging();

// Muestra la notificación cuando llega un push
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Mensaje recibido:', payload);
  const notificationTitle = payload.notification?.title || "Notificación";
  const notificationOptions = {
    body: payload.notification?.body || "Tienes una nueva notificación.",
    icon: '/logo192.png' // Cambia por el ícono que prefieras
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
}); 