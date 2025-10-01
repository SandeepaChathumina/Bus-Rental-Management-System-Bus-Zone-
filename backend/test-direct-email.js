// Direct email test with hardcoded credentials
import nodemailer from 'nodemailer';

console.log('🧪 Testing Email with Direct Credentials...');
console.log('================================');

// Your exact credentials
const emailUser = 'sandeepachathuminaonline@gmail.com';
const emailPass = 'jxwu grzq slwo bots';

console.log('📧 Using credentials:');
console.log('User:', emailUser);
console.log('Pass length:', emailPass.length);
console.log('Pass preview:', emailPass.substring(0, 4) + '...');
console.log('================================');

// Create transporter directly
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Test email
const mailOptions = {
  from: `"BusZone+ Admin" <${emailUser}>`,
  to: emailUser,
  subject: 'Test Email from BusZone+',
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #333;">Test Email</h1>
      <p>This is a test email to verify email functionality.</p>
      <p>If you receive this, the email system is working correctly!</p>
    </div>
  `
};

console.log('📧 Sending test email...');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ Error:', error.message);
    console.log('❌ Error code:', error.code);
  } else {
    console.log('✅ Email sent successfully!');
    console.log('✅ Message ID:', info.messageId);
    console.log('✅ Response:', info.response);
    console.log('📧 Check your email inbox!');
  }
});
