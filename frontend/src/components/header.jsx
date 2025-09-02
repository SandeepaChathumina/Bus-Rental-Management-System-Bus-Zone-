// src/components/Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">BusZone+</Link>
        
        <nav className="flex items-center space-x-6">
          <Link to="/" className="hover:text-blue-200 transition-colors">Home</Link>
          
          {user ? (
            <div className="flex items-center space-x-4">
              <span>Welcome, {user.firstName}</span>
              {user.role === 'admin' && (
                <Link to="/admin" className="hover:text-blue-200 transition-colors">Admin Dashboard</Link>
              )}
              <Link to="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="hover:text-blue-200 transition-colors">Login</Link>
              <Link 
                to="/register" 
                className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;