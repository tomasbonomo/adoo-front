import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCur0oZmi8nAyO0lkNGoi6_rGVp6_c0w5w",
  authDomain: "uno-mas-1f274.firebaseapp.com",
  projectId: "uno-mas-1f274",
  storageBucket: "uno-mas-1f274.firebasestorage.app",
  messagingSenderId: "841760213313",
  appId: "1:841760213313:web:4cc1190e492ae58e2239c0",
  measurementId: "G-YVXV2D40PT"
};
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// VAPID Key pública de tu proyecto (de la consola de Firebase Cloud Messaging)
const VAPID_KEY = "BHZ-U4vIghYz4LSZQ3MYbolcxzFLwqD6n8oeoARbZ38Eprr8O4g7cv5KKNVtxRAkV-Uoe6QSEWOPgUmyE7dvwew";

export const solicitarToken = async () => {
  try {
    const messaging = getMessaging(app);
    const currentToken = await getToken(messaging, { vapidKey: VAPID_KEY });
    if (currentToken) {
      console.log("Token FCM obtenido:", currentToken);
      // Aquí puedes enviar el token a tu backend si lo necesitas
      return currentToken;
    } else {
      console.warn("No se pudo obtener el token FCM. ¿Permisos de notificación concedidos?");
      return null;
    }
  } catch (err) {
    console.error("Error obteniendo token FCM:", err);
    return null;
  }
};

export default app;
