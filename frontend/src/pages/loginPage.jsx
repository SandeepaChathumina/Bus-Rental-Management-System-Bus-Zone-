// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FaUserTie, FaUserShield, FaBus } from 'react-icons/fa'; // Example icons

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    role: '' // added role field
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleSelect = (role) => {
    setCredentials({ ...credentials, role });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const result = await login(credentials);

  if (result.success) {
    toast.success('Login successful!');

    // Determine navigation based on role
    const userRole = credentials.role || result.user?.role; // use selected role or backend role

    switch (userRole) {
      case 'driver':
        navigate('/driver-dashboard');
        break;
      case 'staff':
        navigate('/staff-dashboard');
        break;
      case 'admin':
        navigate('/admin-dashboard');
        break;
      default:
        navigate('/booking'); // passenger or no role
    }
  } else {
    toast.error(result.message);
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Role selection */}
        <div className="flex justify-center gap-6 mt-4">
          <div
            onClick={() => handleRoleSelect('driver')}
            className={`p-4 rounded-full cursor-pointer border-2 ${
              credentials.role === 'driver'
                ? 'border-blue-600 bg-blue-100'
                : 'border-gray-300'
            }`}
          >
            <FaBus size={30} />
            <p className="text-center text-sm mt-1">Driver</p>
          </div>

          <div
            onClick={() => handleRoleSelect('staff')}
            className={`p-4 rounded-full cursor-pointer border-2 ${
              credentials.role === 'staff'
                ? 'border-blue-600 bg-blue-100'
                : 'border-gray-300'
            }`}
          >
            <FaUserTie size={30} />
            <p className="text-center text-sm mt-1">Staff</p>
          </div>

          <div
            onClick={() => handleRoleSelect('admin')}
            className={`p-4 rounded-full cursor-pointer border-2 ${
              credentials.role === 'admin'
                ? 'border-blue-600 bg-blue-100'
                : 'border-gray-300'
            }`}
          >
            <FaUserShield size={30} />
            <p className="text-center text-sm mt-1">Admin</p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={credentials.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
