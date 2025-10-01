// Test email setup script
import dotenv from 'dotenv';
import { sendDriverCredentials } from './utils/emailService.js';

// Load environment variables
dotenv.config();

// Debug: Check if .env is loaded correctly
console.log('🔍 Environment variables check:');
console.log('EMAIL_USER from .env:', process.env.EMAIL_USER);
console.log('EMAIL_PASS from .env:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');
console.log('================================');

console.log('🧪 Testing Email Setup...');
console.log('================================');

// Check environment variables
console.log('📧 Email Configuration:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');
console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('================================');

// Test data
const testData = {
  firstName: 'Test',
  lastName: 'Driver',
  username: 'testdriver',
  email: 'sandeepachathuminaonline@gmail.com', // Send to your own email for testing
  password: 'testpassword123',
  phone: '0771234567',
  licenseNumber: 'B1234567',
  emergencyContact: '0112323555'
};

console.log('📧 Sending test email to:', testData.email);
console.log('================================');

// Send test email
sendDriverCredentials(testData)
  .then(result => {
    if (result.success) {
      console.log('✅ Test email sent successfully!');
      console.log('Message ID:', result.messageId);
      console.log('📧 Check your email inbox (and spam folder)');
    } else {
      console.log('❌ Test email failed:');
      console.log('Error:', result.error);
    }
  })
  .catch(error => {
    console.log('❌ Test email error:');
    console.log('Error:', error.message);
  });
