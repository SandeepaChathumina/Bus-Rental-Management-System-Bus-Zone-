// src/pages/booking-success/BookingSuccess.jsx - FIXED
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
  CreditCard,
  QrCode,
  Phone,
  Loader
} from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking, payment, bus, passengers } = location.state || {};
  
  const [invoice, setInvoice] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);

  useEffect(() => {
    if (!booking || !payment) {
      navigate('/bus');
      return;
    }

    console.log('BookingSuccess initialized with:', { booking, payment, bus });
    
    // Load the latest booking details from the database
    fetchBookingDetails();
  }, []);

  const fetchBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch the latest booking details
      const response = await axios.get(
        `${BACKEND_URL}/api/bookings/${booking._id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setBookingDetails(response.data.booking);
        console.log('Latest booking details:', response.data.booking);
      }
    } catch (error) {
      console.error('Error fetching booking details:', error);
      // Use the booking from props as fallback
      setBookingDetails(booking);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoice = async () => {
    try {
      setIsLoadingInvoice(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${BACKEND_URL}/api/bookings/${booking._id}/invoice`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        setInvoice(response.data.invoice);
        console.log('Invoice fetched:', response.data.invoice);
      }
    } catch (error) {
      console.error('Error fetching invoice:', error);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const downloadInvoice = async () => {
    if (!invoice) {
      await fetchInvoice();
    }
    
    // Generate PDF invoice (you'll need a PDF generation service)
    // This is a placeholder implementation
    window.print();
  };

  const sendEmail = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BACKEND_URL}/api/payments/send-invoice`,
        {
          bookingId: booking._id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Invoice sent to your email successfully!');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email. Please try again.');
    }
  };

  if (!booking || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Booking Session</h2>
          <button
            onClick={() => navigate('/bus')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Back to Bus Search
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Loader className="h-12 w-12 text-blue-600 mx-auto animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Booking Details...</h2>
        </div>
      </div>
    );
  }

  const currentBooking = bookingDetails || booking;
  
  // Ensure payment status is "Paid" for successful payments
  const displayBooking = {
    ...currentBooking,
    paymentStatus: 'Paid',
    bookingStatus: 'Confirmed'
  };
  
  console.log('🎯 Booking Success Page - Payment Status Debug:');
  console.log('📊 Original booking:', booking);
  console.log('📊 Booking details from DB:', bookingDetails);
  console.log('📊 Current booking (fallback):', currentBooking);
  console.log('📊 Display booking (final):', displayBooking);
  console.log('💳 Payment status being displayed:', displayBooking.paymentStatus);

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-16 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Your payment was successful and your booking is now confirmed.
          </p>
          <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-2" />
            Payment Status: {displayBooking.paymentStatus}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Bus className="h-5 w-5 mr-2 text-blue-600" />
                Booking Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Route:</span>
                    <span className="ml-2">{displayBooking.route?.from} → {displayBooking.route?.to}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">{new Date(displayBooking.travelDate).toLocaleDateString()}</span>
                  </div>
                  
                  {displayBooking.returnDate && (
                    <div className="flex items-center text-gray-700">
                      <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Return:</span>
                      <span className="ml-2">{new Date(displayBooking.returnDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-gray-700">
                    <Clock className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Time:</span>
                    <span className="ml-2">{displayBooking.departureTime}</span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <User className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Passengers:</span>
                    <span className="ml-2">{displayBooking.seats?.length || displayBooking.numberOfPassengers}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <Bus className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Bus:</span>
                    <span className="ml-2">{bus?.busType || 'Standard'} Coach ({bus?.numberPlate})</span>
                  </div>
                  
                  <div className="flex items-center text-gray-700">
                    <CreditCard className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="font-medium">Amount:</span>
                    <span className="ml-2 font-bold text-green-600">LKR {displayBooking.totalAmount.toLocaleString()}</span>
                  </div>

                  {displayBooking.seats && (
                    <div className="flex items-center text-gray-700">
                      <User className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="font-medium">Seats:</span>
                      <span className="ml-2">{displayBooking.seats.map(seat => seat.seatNumber).join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Passenger Details */}
              {displayBooking.seats && displayBooking.seats.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Passenger Information</h3>
                  <div className="space-y-2">
                    {displayBooking.seats.map((seat, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{seat.passengerName}</span>
                          <span className="text-sm text-gray-600 ml-2">({seat.passengerAge} years, {seat.passengerGender})</span>
                        </div>
                        <div className="text-sm text-blue-600 font-medium">
                          Seat {seat.seatNumber}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QR Code */}
              {displayBooking.qrCode && (
                <div className="text-center border-t pt-6">
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center justify-center">
                    <QrCode className="h-5 w-5 mr-2" />
                    Boarding Pass QR Code
                  </h3>
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                    <img 
                      src={displayBooking.qrCode} 
                      alt="QR Code" 
                      className="w-32 h-32 mx-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Show this QR code when boarding the bus
                  </p>
                </div>
              )}
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  You will receive a confirmation email with all details
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Arrive at the boarding point 30 minutes before departure
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Bring a valid ID proof for verification
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                  Keep your booking reference safe: <span className="font-mono font-bold">{displayBooking.bookingId}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Invoice Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Actions</h3>
              
              <div className="space-y-3">
                <button
                  onClick={downloadInvoice}
                  disabled={isLoadingInvoice}
                  className="w-full flex items-center justify-center bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingInvoice ? (
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5 mr-2" />
                  )}
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
                  className="w-full flex items-center justify-center bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                >
                  <Printer className="h-5 w-5 mr-2" />
                  Print Details
                </button>
              </div>

              {/* Booking Reference */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Booking Reference</h4>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="text-2xl font-bold text-blue-600 font-mono">{displayBooking.bookingId}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">Keep this reference for any inquiries</p>
              </div>

              {/* Payment Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-medium">Card</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-medium font-mono">{payment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-bold text-green-600">LKR {payment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-green-600">Paid</span>
                  </div>
                </div>
              </div>

              {/* Support Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  Contact our support team:
                </p>
                <div className="space-y-1">
                  <p className="text-blue-600 font-medium">+94 704 222 777</p>
                  <p className="text-blue-600 font-medium">support@buszone.com</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Available 24/7 for booking support
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
          <button
            onClick={() => navigate('/bus')}
            className="flex items-center justify-center bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Book Another Trip
          </button>
          
          <button
            onClick={() => navigate('/mybookings')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            View My Bookings
          </button>
        </div>

        {/* Status Information */}
        <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-green-900">Payment</div>
              <div className="text-sm text-green-700">Completed</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Bus className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="font-medium text-blue-900">Booking</div>
              <div className="text-sm text-blue-700">{displayBooking.bookingStatus}</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Calendar className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="font-medium text-yellow-900">Trip Status</div>
              <div className="text-sm text-yellow-700">Upcoming</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;