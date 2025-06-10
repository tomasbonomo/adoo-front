import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common';
import Navbar from './components/layout/Navbar';
import { PartidoProvider } from './contexts/PartidoContext';
import { GlobalNotificationProvider } from './contexts/GlobalNotificationContext';
import GlobalNotificationToast from './components/notificaciones/GlobalNotificationToast';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Main components
import Dashboard from './components/dashboard/Dashboard';
import UserProfile from './components/user/UserProfile';
import Estadisticas from './components/estadisticas/Estadisticas';
import NotificationsPage from './components/notificaciones/NotificationsPage';

// Partido components
import SearchPartidos from './components/partidos/SearchPartidos';
import CreatePartido from './components/partidos/CreatePartido';
import PartidoDetails from './components/partidos/PartidoDetails';
import MisPartidos from './components/partidos/MisPartidos';

// Landing page component
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="pt-16 pb-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-gradient">UnoMas</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8">
              Encuentra jugadores, organiza partidos y disfruta del deporte que amas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/register"
                className="btn-primary text-lg px-8 py-3"
              >
                Comenzar Ahora
              </a>
              <a
                href="/login"
                className="btn-secondary text-lg px-8 py-3"
              >
                Iniciar Sesión
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">⚽</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Múltiples Deportes
              </h3>
              <p className="text-gray-600">
                Fútbol, básquet, vóley, tenis y más. Encuentra tu deporte favorito.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Emparejamiento Inteligente
              </h3>
              <p className="text-gray-600">
                Sistema de compatibilidad por nivel, ubicación e historial de juego.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-white">📍</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ubicaciones Cercanas
              </h3>
              <p className="text-gray-600">
                Encuentra partidos cerca de ti y descubre nuevos lugares para jugar.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              ¿Listo para tu próximo partido?
            </h2>
            <p className="text-gray-600 mb-8">
              Únete a miles de deportistas que ya están disfrutando de UnoMas
            </p>
            <a
              href="/register"
              className="btn-primary text-lg px-8 py-3"
            >
              Registrarse Gratis
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// Error 404 component
const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mt-4">
            Página no encontrada
          </h2>
          <p className="text-gray-600 mt-2">
            Lo sentimos, la página que buscas no existe.
          </p>
        </div>
        <div className="space-y-4">
          <a
            href="/dashboard"
            className="btn-primary w-full"
          >
            Ir al Dashboard
          </a>
          <a
            href="/"
            className="btn-secondary w-full"
          >
            Volver al Inicio
          </a>
        </div>
      </div>
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <GlobalNotificationProvider>
        <PartidoProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gray-50">
              <Navbar />
              
              {/* ✅ NUEVO: Componente de notificaciones globales */}
              <GlobalNotificationToast />
              
              <main>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/perfil" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />

                  {/* Notificaciones */}
                  <Route path="/notificaciones" element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  } />

                  {/* Partido routes */}
                  <Route path="/partidos/buscar" element={
                    <ProtectedRoute>
                      <SearchPartidos />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/partidos/crear" element={
                    <ProtectedRoute>
                      <CreatePartido />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/partidos/:id" element={
                    <ProtectedRoute>
                      <PartidoDetails />
                    </ProtectedRoute>
                  } />

                  <Route path="/partidos/mis-partidos" element={
                    <ProtectedRoute>
                      <MisPartidos />
                    </ProtectedRoute>
                  } />

                  {/* Estadísticas */}
                  <Route path="/estadisticas" element={
                    <ProtectedRoute>
                      <Estadisticas />
                    </ProtectedRoute>
                  } />

                  {/* Redirect /partidos to /partidos/buscar */}
                  <Route path="/partidos" element={<Navigate to="/partidos/buscar" replace />} />

                  {/* Default redirect for authenticated users */}
                  <Route path="/home" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </AuthProvider>
        </PartidoProvider>
      </GlobalNotificationProvider>
    </Router>
  );
}

export default App;