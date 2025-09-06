import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AdminPage from './pages/AdminPage';
import { AuthProvider } from './context/AuthContext';
import AttendanceManagement from './components/AttendanceManagement';
import AdvancedBusRentalHomepage from './pages/HomePage';
import LoginPage from './pages/loginPage';
import Booking from './pages/bookingContainer/Booking';
import Checkout from './pages/checkout/Checkout';
import Details from './pages/bus/Detailss';
import { Bus } from 'lucide-react';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/booking" element={<Booking />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/attendance" element={<AttendanceManagement />} />
              <Route path="/home" element={<AdvancedBusRentalHomepage />} />
              <Route path="/bus" element={<Bus/>} />
              <Route path="/bus/bus-details" element={<Details/>} />
              <Route path="/bus/bus-details/checkout" element={<Checkout/>} />

            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;