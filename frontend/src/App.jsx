// src/App.js - UPDATED with Lost & Found route
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
import Lost from './pages/Lost'; // ✅ Import Lost & Found component
import AdminLostFound from './pages/AdminLostFound'; // ✅ Import Admin Lost & Found component
import PassengerDetails from './components/PassengerDetails';
import Checkout from './pages/checkout/Checkout';
import BookingSuccess from './pages/booking-success/BookingSuccess';
import GalleryPage from './pages/GalleryPage';
import PaymentManagement from './pages/PaymentManagement';
import Chatbot from './components/Chatbot';

// ✅ Import ProtectedRoute
import ProtectedRoute from './components/ProtectedRoute';
import ViewMyBookings from './pages/ViewMyBookings';
import AllBookings from './pages/allbookings';
import PaymentTestPage from './pages/PaymentTestPage';

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
              <Route path="/paymnets" element={<PaymentManagement />} />
              
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
                path="/mybookings"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'admin']}>
                    <ViewMyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/payment-test"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'admin']}>
                    <PaymentTestPage />
                  </ProtectedRoute>
                }
              />
                            <Route
                path="/allbookings"
                element={
                  <ProtectedRoute allowedRoles={[ 'admin']}>
                    <AllBookings />
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

              {/* ✅ Lost & Found route - Available to all authenticated users */}
              <Route
                path="/lost-found"
                element={
                  <ProtectedRoute allowedRoles={['passenger', 'admin', 'driver', 'staff']}>
                    <Lost />
                  </ProtectedRoute>
                }
              />

              {/* ✅ Admin Lost & Found Management */}
              <Route
                path="/admin/lost-found"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminLostFound />
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
              <Route 
                path="/payments" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PaymentManagement />
                  </ProtectedRoute>
                }
              />
                            <Route
                              path="/driver-dashboard"
                              element={
                                <ProtectedRoute allowedRoles={['driver', 'admin']}>
                                  <DriverDashboard />
                                </ProtectedRoute>
                              }
                            />
            </Routes>
          </main>
          <Chatbot />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;