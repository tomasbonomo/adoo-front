import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Home, 
  Search, 
  Plus,
  BarChart3,
  Settings,
  Trophy
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActivePath = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, icon: Icon, onClick }) => {
    const isActive = isActivePath(to);
    
    return (
      <Link
        to={to}
        onClick={onClick}
        className={`
          flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
          ${isActive 
            ? 'bg-primary-100 text-primary-700' 
            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
          }
        `}
      >
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {children}
      </Link>
    );
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: Home },
    { to: '/partidos/buscar', label: 'Buscar Partidos', icon: Search },
    { to: '/partidos/crear', label: 'Crear Partido', icon: Plus },
    { to: '/estadisticas', label: 'Estadísticas', icon: BarChart3 },
    ...(isAdmin() ? [{ to: '/admin', label: 'Administración', icon: Settings }] : [])
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo y marca */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Trophy className="h-8 w-8 text-primary-600" />
                <span className="ml-2 text-xl font-bold text-gradient">
                  UnoMas
                </span>
              </div>
            </Link>
          </div>

          {/* Navegación desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user && navItems.map((item) => (
              <NavLink key={item.to} to={item.to} icon={item.icon}>
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* User menu desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Hola, {user.nombreUsuario}
                </span>
                <div className="flex items-center space-x-2">
                  <NavLink to="/perfil" icon={User}>
                    Perfil
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Salir
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-lg text-sm font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="btn-primary text-sm"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Menú móvil button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-primary-600 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && navItems.map((item) => (
              <NavLink 
                key={item.to} 
                to={item.to} 
                icon={item.icon}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            
            {user && (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <NavLink 
                  to="/perfil" 
                  icon={User}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Perfil ({user.nombreUsuario})
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </button>
              </>
            )}
            
            {!user && (
              <>
                <NavLink 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </NavLink>
                <NavLink 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;