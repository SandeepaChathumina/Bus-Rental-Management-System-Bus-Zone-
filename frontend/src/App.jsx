// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/loginPage';
import PassengerProfilePage from './pages/PassengerProfilePage'; // Correct import name
import AdminPage from './pages/AdminPage';
import AttendanceManagement from './components/AttendanceManagement';
import Booking from './pages/bookingContainer/Booking';
import Checkout from './pages/checkout/Checkout';
import Details from './pages/bus/Detailss';
import BusManagement from './pages/buscrud';
import AdminDashboard from './pages/admindash';
import Feedback from './pages/Feedback';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import DriverDashboard from './components/DriverDashboard';
import NotificationsPage from './pages/NotificationsPage';
import AdminNotificationPanel from './pages/AdminNotificationPanel';
import SeasonalOffers from './components/SeasonalOffers';
import Bus from './pages/bus/Bus';
import NotificationBell   from './components/NotificationBell';

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
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/profile" element={<PassengerProfilePage />} /> {/* Correct component name */}
              <Route path="/booking" element={<Booking />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/attendance" element={<AttendanceManagement />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/bus" element={<Bus/>} />
              <Route path="/bus/bus-details" element={<Details/>} />
              <Route path="/bus/bus-details/checkout" element={<Checkout/>} />
              <Route path="/buses" element={<BusManagement/>} />
              <Route path="/admin-dashboard" element={<AdminDashboard/>} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/notifications" element={<NotificationsPage />} />   
              <Route path='/offers' element={<SeasonalOffers/>}/>
             <Route path="/admin/notifications" element={<AdminNotificationPanel />} />
              <Route path="/driver-dashboard" element={<DriverDashboard/>} />
              <Route path='/notification-bell' element={<NotificationBell/>}/>
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;