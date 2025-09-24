// src/pages/booking-success/BookingSuccess.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  Download, 
  Mail, 
  Printer, 
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Clock,
  Bus,
  CreditCard
} from 'lucide-react';
import axios from 'axios';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, payment, bus, passengers } = location.state || {};
  
  const [invoice, setInvoice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!booking || !payment) {
      navigate('/bus');
      return;
    }
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/invoice/${payment.paymentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInvoice(response.data);
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadInvoice = async () => {
    try {
      window.print();
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const sendEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/payments/send-invoice`,
        { paymentId: payment.paymentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Invoice sent to your email successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  if (!booking || !payment) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-6">
        <div className="max-w-2xl mx-auto text-center bg-gray-900 p-8 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-white mb-4">Invalid Booking Session</h2>
          <button
            onClick={() => navigate('/bus')}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Bus Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pt-32 pb-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-10">
          <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-4 drop-shadow-lg" />
          <h1 className="text-4xl font-extrabold text-white mb-2">Booking Confirmed!</h1>
          <p className="text-gray-400 text-lg">
            Your payment was successful and your booking is now confirmed.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl mb-6 border border-gray-800">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Bus className="h-5 w-5 mr-2 text-indigo-400" />
                Booking Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <MapPin className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="font-medium">Route:</span>
                    <span className="ml-2">{booking.route?.from} → {booking.route?.to}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Calendar className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{new Date(booking.travelDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Clock className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="font-medium">Time:</span>
                    <span className="ml-2">{booking.departureTime}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-300">
                    <User className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="font-medium">Passengers:</span>
                    <span className="ml-2">{booking.seats?.length || passengers.length}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <Bus className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="font-medium">Bus:</span>
                    <span className="ml-2">{bus.busType} Coach</span>
                  </div>
                  
                  <div className="flex items-center text-gray-300">
                    <CreditCard className="h-4 w-4 mr-2 text-indigo-400" />
                    <span className="font-medium">Amount:</span>
                    <span className="ml-2 font-bold text-green-400">LKR {payment.amount}</span>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              {booking.qrCode && (
                <div className="text-center border-t border-gray-700 pt-6">
                  <h3 className="font-medium text-white mb-3">Boarding Pass QR Code</h3>
                  <img 
                    src={booking.qrCode} 
                    alt="QR Code" 
                    className="w-32 h-32 mx-auto border border-gray-700 rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-400 mt-2">
                    Show this QR code when boarding the bus
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-bold text-indigo-300 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  You will receive a confirmation email with all details
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  Arrive at the boarding point 30 minutes before departure
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  Bring a valid ID proof for verification
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mr-3"></div>
                  Contact support if you have any questions
                </li>
              </ul>
            </div>
          </div>

          {/* Invoice Actions */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 rounded-2xl p-6 shadow-xl sticky top-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Invoice Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={downloadInvoice}
                  className="w-full flex items-center justify-center bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Invoice
                </button>
                
                <button
                  onClick={sendEmail}
                  className="w-full flex items-center justify-center bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Send to Email
                </button>
                
                <button
                  onClick={() => window.print()}
                  className="w-full flex items-center justify-center bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print Invoice
                </button>
              </div>

              {/* Booking Reference */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-medium text-white mb-2">Booking Reference</h4>
                <p className="text-2xl font-bold text-indigo-400">{booking.bookingId}</p>
                <p className="text-sm text-gray-400 mt-1">Keep this reference for any inquiries</p>
              </div>

              {/* Support Information */}
              <div className="mt-6 pt-6 border-t border-gray-700">
                <h4 className="font-medium text-white mb-2">Need Help?</h4>
                <p className="text-sm text-gray-400">
                  Contact our support team:
                </p>
                <p className="text-indigo-400 font-medium">+94 704 222 777</p>
                <p className="text-indigo-400 font-medium">support@buszone.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-10">
          <button
            onClick={() => navigate('/bus')}
            className="flex items-center bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Book Another Trip
          </button>
          
          <button
            onClick={() => navigate('/my-bookings')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            View My Bookings
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
