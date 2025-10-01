import nodemailer from 'nodemailer';
import { emailConfig, emailSettings } from '../config/emailConfig.js';

// Create transporter for sending emails
const createTransporter = () => {
  // Use Gmail by default, but allow configuration via environment
  const emailService = process.env.EMAIL_SERVICE || 'gmail';
  
  console.log('🔧 Creating transporter with service:', emailService);
  console.log('🔧 Email config:', {
    service: emailConfig.service,
    user: emailConfig.auth.user,
    passLength: emailConfig.auth.pass ? emailConfig.auth.pass.length : 0,
    passPreview: emailConfig.auth.pass ? emailConfig.auth.pass.substring(0, 4) + '...' : 'none'
  });
  
  if (emailService === 'gmail') {
    return nodemailer.createTransport(emailConfig);
  } else if (emailService === 'outlook') {
    return nodemailer.createTransport(emailConfig.outlook);
  } else {
    return nodemailer.createTransport(emailConfig.custom);
  }
};

// Email templates
export const emailTemplates = {
  driverCredentials: (userData) => ({
    subject: 'Welcome to BusZone+ - Your Driver Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">BusZone+</h1>
          <p style="color: #e0e6ff; margin: 10px 0 0 0; font-size: 16px;">Driver Account Created</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome ${userData.firstName} ${userData.lastName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your driver account has been successfully created by our admin team. You can now access the BusZone+ system using the credentials below:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Your Login Credentials:</h3>
            <p style="margin: 10px 0;"><strong>Username:</strong> <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${userData.username}</span></p>
            <p style="margin: 10px 0;"><strong>Password:</strong> <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${userData.password}</span></p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${userData.email}</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">🔒 Security Notice</h4>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              For security reasons, please change your password after your first login. Keep your credentials secure and do not share them with anyone.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <h4 style="color: #333; margin-bottom: 15px;">Driver Information:</h4>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</li>
              <li><strong>Phone:</strong> ${userData.phone || 'Not provided'}</li>
              <li><strong>License Number:</strong> ${userData.licenseNumber || 'Not provided'}</li>
              <li><strong>Emergency Contact:</strong> ${userData.emergencyContact || 'Not provided'}</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">📱 Next Steps</h4>
            <ol style="color: #1976d2; margin: 0; padding-left: 20px;">
              <li>Login to your account using the credentials above</li>
              <li>Update your profile information if needed</li>
              <li>Check your assigned routes and schedules</li>
              <li>Contact admin if you have any questions</li>
            </ol>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
            If you have any questions or need assistance, please contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 BusZone+. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  }),
  
  staffCredentials: (userData) => ({
    subject: 'Welcome to BusZone+ - Your Staff Account Credentials',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">BusZone+</h1>
          <p style="color: #e0e6ff; margin: 10px 0 0 0; font-size: 16px;">Staff Account Created</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Welcome ${userData.firstName} ${userData.lastName}!</h2>
          
          <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            Your staff account has been successfully created by our admin team. You can now access the BusZone+ system using the credentials below:
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="color: #333; margin-top: 0;">Your Login Credentials:</h3>
            <p style="margin: 10px 0;"><strong>Username:</strong> <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${userData.username}</span></p>
            <p style="margin: 10px 0;"><strong>Password:</strong> <span style="background: #e9ecef; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${userData.password}</span></p>
            <p style="margin: 10px 0;"><strong>Email:</strong> ${userData.email}</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #856404; margin-top: 0;">🔒 Security Notice</h4>
            <p style="color: #856404; margin: 0; font-size: 14px;">
              For security reasons, please change your password after your first login. Keep your credentials secure and do not share them with anyone.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Login to Your Account
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
            <h4 style="color: #333; margin-bottom: 15px;">Staff Information:</h4>
            <ul style="color: #666; line-height: 1.8; padding-left: 20px;">
              <li><strong>Name:</strong> ${userData.firstName} ${userData.lastName}</li>
              <li><strong>Phone:</strong> ${userData.phone || 'Not provided'}</li>
              <li><strong>Employee ID:</strong> ${userData.employeeId || 'Not provided'}</li>
              <li><strong>Staff Role:</strong> ${userData.staffRole || 'Not provided'}</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #1976d2; margin-top: 0;">📱 Next Steps</h4>
            <ol style="color: #1976d2; margin: 0; padding-left: 20px;">
              <li>Login to your account using the credentials above</li>
              <li>Update your profile information if needed</li>
              <li>Check your assigned tasks and responsibilities</li>
              <li>Contact admin if you have any questions</li>
            </ol>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px; text-align: center;">
            If you have any questions or need assistance, please contact our support team.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 BusZone+. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `
  })
};

// Send email function
export const sendEmail = async (to, subject, html) => {
  try {
    console.log('📧 Attempting to send email...');
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('📧 Email Service:', process.env.EMAIL_SERVICE || 'gmail');
    
    const transporter = createTransporter();
    
    const mailOptions = {
      from: emailSettings.from,
      to: to,
      subject: subject,
      html: html,
      replyTo: emailSettings.replyTo
    };
    
    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', result.messageId);
    console.log('✅ Response:', result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('❌ Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    return { success: false, error: error.message };
  }
};

// Send driver credentials email
export const sendDriverCredentials = async (userData) => {
  try {
    const template = emailTemplates.driverCredentials(userData);
    const result = await sendEmail(userData.email, template.subject, template.html);
    return result;
  } catch (error) {
    console.error('Error sending driver credentials email:', error);
    return { success: false, error: error.message };
  }
};

// Send staff credentials email
export const sendStaffCredentials = async (userData) => {
  try {
    const template = emailTemplates.staffCredentials(userData);
    const result = await sendEmail(userData.email, template.subject, template.html);
    return result;
  } catch (error) {
    console.error('Error sending staff credentials email:', error);
    return { success: false, error: error.message };
  }
};
