import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import AttendanceManagement from './components/AttendanceManagement';
import AdvancedBusRentalHomepage from './pages/HomePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/attendance" element={<AttendanceManagement />} />
              <Route path="/home" element={<AdvancedBusRentalHomepage />} />

            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;