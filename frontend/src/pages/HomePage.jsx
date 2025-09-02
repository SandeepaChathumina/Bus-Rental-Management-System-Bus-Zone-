// src/pages/HomePage.jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Welcome to BusZone+</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your premier bus rental management system for efficient transportation solutions
          </p>
          {!user ? (
            <div className="space-x-4">
              <Link 
                to="/register" 
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
              >
                Get Started
              </Link>
              <Link 
                to="/login" 
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
            </div>
          ) : (
            <Link 
              to="/dashboard" 
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose BusZone+?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">🚌</div>
              <h3 className="text-xl font-semibold mb-3">Modern Fleet</h3>
              <p>Well-maintained buses with modern amenities for your comfort and safety.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">⏱️</div>
              <h3 className="text-xl font-semibold mb-3">On-Time Service</h3>
              <p>Punctual services with real-time tracking and updates.</p>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-4xl mb-4">👨‍💼</div>
              <h3 className="text-xl font-semibold mb-3">Professional Staff</h3>
              <p>Experienced drivers and support staff dedicated to your satisfaction.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;