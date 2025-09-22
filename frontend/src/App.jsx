// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Pages / Components
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/loginPage';
import PassengerProfilePage from './pages/PassengerProfilePage';
import AdminPage from './pages/AdminPage';
import AttendanceManagement from './components/AttendanceManagement';
import Booking from './pages/bookingContainer/Booking';
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
import Services from './pages/services';
import BusZoneDashboard from './pages/staffdash';
import MaintenanceManagement from './pages/MaintenanceManagement';
import NotificationBell from './components/NotificationBell';
import PassengerDetails from './components/PassengerDetails';
import Checkout from './pages/checkout/Checkout';
import BookingSuccess from './pages/booking-success/BookingSuccess';
import GalleryPage from './pages/GalleryPage';

// ✅ Import ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <main>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path='/services' element={<Services/>}/>
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/feedback" element={<Feedback />} />
              <Route path="/offers" element={<SeasonalOffers />} />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/bus" element={<Bus />} />
              <Route path="/passenger-details" element={<PassengerDetails />} />
              <Route path="/gallery" element={<GalleryPage />} />

              {/* Protected routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'admin']}>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/booking-success"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'admin']}>
                    <BookingSuccess />
                  </ProtectedRoute>
                }
              />

              {/* Passenger only (plus admin override) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'admin']}>
                    <PassengerProfilePage />
                  </ProtectedRoute>
                }
              />

              
              <Route
                path="/booking"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'admin']}>
                    <Booking />
                  </ProtectedRoute>
                }
              />

              {/* Driver only (plus admin override) */}
              <Route
                path="/driver-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['driver', 'admin']}>
                    <DriverDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Staff only (plus admin override) */}
              <Route
                path="/staffdash"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <BusZoneDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin only */}
              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminNotificationPanel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/buses"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BusManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/attendance"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AttendanceManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/maintain"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MaintenanceManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notification-bell"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <NotificationBell />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;