// Email configuration
export const emailConfig = {
  // Gmail configuration
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'sandeepachathuminaonline@gmail.com',
    pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s/g, '') : 'nnvk apjf lqcf jzyz' 
  },
  
  // Alternative configurations for other email services
  // Outlook/Hotmail
  outlook: {
    service: 'hotmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  
  // Custom SMTP
  custom: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
};

// Email settings
export const emailSettings = {
  from: `"BusZone+ Admin" <${process.env.EMAIL_USER || 'noreply@buszone.com'}>`,
  replyTo: process.env.EMAIL_REPLY_TO || process.env.EMAIL_USER,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
};
