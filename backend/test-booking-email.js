// Test script for booking confirmation email
import dotenv from 'dotenv';
import { sendBookingConfirmation } from './utils/emailService.js';

// Load environment variables
dotenv.config();

const testBookingData = {
  bookingId: 'TEST123456',
  contactInfo: {
    email: 'sandeepachathuminaonline@gmail.com' // Replace with your email
  },
  route: {
    from: 'Colombo',
    to: 'Kandy'
  },
  travelDate: new Date(),
  departureTime: '08:00 AM',
  bus: {
    busType: 'Luxury Coach',
    numberPlate: 'ABC-1234'
  },
  totalAmount: 2500,
  seats: [
    {
      passengerName: 'John Doe',
      seatNumber: 'A1',
      passengerAge: 25,
      passengerGender: 'male'
    }
  ],
  qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==' // Dummy QR code
};

async function testBookingEmail() {
  console.log('🧪 Testing booking confirmation email...');
  console.log('📧 Environment check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');
  console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
  
  try {
    const result = await sendBookingConfirmation(testBookingData);
    console.log('📧 Test result:', result);
    
    if (result.success) {
      console.log('✅ Test email sent successfully!');
    } else {
      console.log('❌ Test email failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

testBookingEmail();
