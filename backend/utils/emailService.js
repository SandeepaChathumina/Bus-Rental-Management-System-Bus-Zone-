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
  bookingConfirmation: (bookingData) => (
    `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation - BusZone+</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; }
        .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #f8fafc; border-radius: 10px; }
        .qr-code { max-width: 200px; height: auto; border: 2px solid #e2e8f0; border-radius: 10px; }
        .booking-details { background: #f1f5f9; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-label { font-weight: bold; color: #475569; }
        .detail-value { color: #1e293b; }
        .passenger-list { margin: 20px 0; }
        .passenger-item { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #3b82f6; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .button { display: inline-block; background: #3b82f6; color: white !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; font-weight: bold; }
        .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your bus journey with BusZone+ is ready</p>
        </div>
        
        <div class="content">
          <h2>Hello ${bookingData.contactInfo?.email || 'Passenger'}!</h2>
          <p>Great news! Your booking has been confirmed and your payment was successful. Here are your travel details:</p>
          
          <div class="booking-details">
            <h3>📋 Booking Information</h3>
            <div class="detail-row">
              <span class="detail-label">Booking Reference:</span>
              <span class="detail-value">${bookingData.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Route:</span>
              <span class="detail-value">${bookingData.route?.from} → ${bookingData.route?.to}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Travel Date:</span>
              <span class="detail-value">${new Date(bookingData.travelDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Departure Time:</span>
              <span class="detail-value">${bookingData.departureTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bus Type:</span>
              <span class="detail-value">${bookingData.bus?.busType} (${bookingData.bus?.numberPlate})</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Total Amount:</span>
              <span class="detail-value">LKR ${bookingData.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
          
          ${bookingData.seats && bookingData.seats.length > 0 ? `
          <div class="passenger-list">
            <h3>👥 Passenger Details</h3>
            ${bookingData.seats.map(seat => `
              <div class="passenger-item">
                <strong>${seat.passengerName}</strong> - Seat ${seat.seatNumber}<br>
                <small>Age: ${seat.passengerAge} years, Gender: ${seat.passengerGender}</small>
              </div>
            `).join('')}
          </div>
          ` : ''}
          
          <div class="qr-section">
            <h3>📱 Your Boarding Pass QR Code</h3>
            <p>Your QR code is attached to this email. Please download and save it for boarding:</p>
            
            <div style="text-align: center; margin: 20px 0; padding: 20px; background: #ffffff; border: 2px solid #3b82f6; border-radius: 10px;">
              <div style="background: #ffffff; border: 2px solid #3b82f6; border-radius: 10px; padding: 20px; margin: 10px 0;">
                <h4 style="color: #3b82f6; margin: 0 0 15px 0;">📱 Your Boarding Pass</h4>
                <div style="background: #000000; color: #ffffff; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 16px; font-weight: bold; letter-spacing: 2px;">
                  ${bookingData.bookingId}
                </div>
                <p style="margin: 15px 0 0 0; font-size: 14px; color: #64748b;">
                  Show this booking reference to the driver when boarding
                </p>
              </div>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #64748b;">
                <strong>Note:</strong> Your QR code is attached as "boarding-pass-qr.png" - download and save it for boarding.
              </p>
            </div>
            
            <p><strong>Important:</strong> Keep this QR code safe and show it to the driver when boarding.</p>
          </div>
          
          <div class="highlight">
            <h3>🚌 Important Instructions</h3>
            <ul>
              <li>Arrive at the boarding point <strong>30 minutes before departure</strong></li>
              <li>Bring a <strong>valid ID proof</strong> for verification</li>
              <li>Show your <strong>QR code</strong> to the driver when boarding</li>
              <li>Keep your <strong>booking reference</strong> safe: <code>${bookingData.bookingId}</code></li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${emailSettings.frontendUrl}/mybookings" class="button">View My Bookings</a>
            <a href="${emailSettings.frontendUrl}/bus" class="button">Book Another Trip</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>BusZone+</strong> - Your trusted travel partner</p>
          <p>For support, contact us at: <strong>+94 704 222 777</strong> | <strong>support@buszone.com</strong></p>
          <p>This email was sent to ${bookingData.contactInfo?.email || 'your email address'}</p>
        </div>
      </div>
    </body>
    </html>
    `
  ),
  
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
export const sendEmail = async (to, subject, html, attachments = []) => {
  try {
    console.log('📧 ===== SEND EMAIL FUNCTION CALLED =====');
    console.log('📧 To:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 Attachments:', attachments.length);
    console.log('📧 Email User:', process.env.EMAIL_USER);
    console.log('📧 Email Service:', process.env.EMAIL_SERVICE || 'gmail');
    console.log('📧 Email Pass Length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'Not set');
    
    console.log('📧 Creating transporter...');
    const transporter = createTransporter();
    console.log('📧 Transporter created successfully');
    
    const mailOptions = {
      from: emailSettings.from,
      to: to,
      subject: subject,
      html: html,
      replyTo: emailSettings.replyTo,
      attachments: attachments
    };
    
    console.log('📧 Mail options:', {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      htmlLength: html.length
    });
    
    console.log('📧 Sending email via transporter...');
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('✅ Message ID:', result.messageId);
    console.log('✅ Response:', result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ ===== EMAIL SENDING FAILED =====');
    console.error('❌ Error message:', error.message);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error command:', error.command);
    console.error('❌ Full error:', error);
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

// Send booking confirmation email with QR code
export const sendBookingConfirmation = async (bookingData) => {
  try {
    console.log('📧 ===== STARTING BOOKING CONFIRMATION EMAIL =====');
    console.log('📧 Booking data received:', {
      bookingId: bookingData.bookingId,
      email: bookingData.contactInfo?.email || bookingData.user?.email,
      hasQRCode: !!bookingData.qrCode,
      qrCodeLength: bookingData.qrCode ? bookingData.qrCode.length : 0,
      qrCodeStart: bookingData.qrCode ? bookingData.qrCode.substring(0, 50) + '...' : 'No QR code',
      qrCodeEnd: bookingData.qrCode ? '...' + bookingData.qrCode.substring(bookingData.qrCode.length - 50) : 'No QR code',
      isDataURL: bookingData.qrCode ? bookingData.qrCode.startsWith('data:image/') : false,
      contactInfo: bookingData.contactInfo,
      user: bookingData.user,
      route: bookingData.route,
      travelDate: bookingData.travelDate
    });
    
    // Check if we have the required data - try multiple possible locations for email
    const emailAddress = bookingData.contactInfo?.email || bookingData.user?.email;
    
    if (!emailAddress) {
      console.error('❌ No email address found in booking data');
      console.error('❌ contactInfo:', bookingData.contactInfo);
      console.error('❌ user:', bookingData.user);
      return { success: false, error: 'No email address found' };
    }
    
    console.log('📧 Using email address:', emailAddress);
    
    if (!bookingData.qrCode) {
      console.warn('⚠️ No QR code found in booking data');
    }
    
    console.log('📧 Generating email template...');
    const template = emailTemplates.bookingConfirmation(bookingData);
    const subject = `🎉 Booking Confirmed - ${bookingData.bookingId} | BusZone+`;
    
    // Generate QR code as buffer for attachment
    let attachments = [];
    if (bookingData.qrCode) {
      try {
        console.log('📧 Converting QR code to buffer for attachment...');
        // Convert base64 to buffer
        const qrCodeBuffer = Buffer.from(bookingData.qrCode.split(',')[1], 'base64');
        attachments = [{
          filename: 'boarding-pass-qr.png',
          content: qrCodeBuffer,
          contentType: 'image/png'
        }];
        console.log('📧 QR code attachment prepared:', {
          filename: 'boarding-pass-qr.png',
          size: qrCodeBuffer.length,
          contentType: 'image/png'
        });
      } catch (attachmentError) {
        console.error('❌ Error preparing QR code attachment:', attachmentError);
      }
    }
    
    console.log('📧 Email details:', {
      to: emailAddress,
      subject: subject,
      templateLength: template.length,
      attachments: attachments.length
    });
    
    console.log('📧 Calling sendEmail function...');
    const result = await sendEmail(
      emailAddress, 
      subject, 
      template,
      attachments
    );
    
    console.log('📧 SendEmail result:', result);
    
    if (result.success) {
      console.log('✅ Booking confirmation email sent successfully');
    } else {
      console.error('❌ Failed to send booking confirmation email:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error sending booking confirmation email:', error);
    console.error('❌ Error stack:', error.stack);
    return { success: false, error: error.message };
  }
};
