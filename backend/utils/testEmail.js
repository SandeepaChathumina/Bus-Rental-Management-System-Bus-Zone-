import { sendDriverCredentials } from './emailService.js';

// Test email function
export const testEmail = async (req, res) => {
  try {
    console.log('🧪 Testing email configuration...');
    
    // Test data
    const testData = {
      firstName: 'Test',
      lastName: 'Driver',
      username: 'testdriver',
      email: req.body.email || 'test@example.com',
      password: 'testpassword123',
      phone: '0771234567',
      licenseNumber: 'B1234567',
      emergencyContact: '0112323555'
    };
    
    console.log('📧 Sending test email to:', testData.email);
    
    const result = await sendDriverCredentials(testData);
    
    if (result.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send test email',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
};
