# Email Setup for Driver Credentials

This guide explains how to set up email functionality to automatically send login credentials to drivers when they are created by an admin.

## Prerequisites

1. **Email Account**: You need an email account (Gmail, Outlook, Yahoo, etc.)
2. **App Password**: For Gmail, you'll need to generate an App Password (not your regular password)

## Gmail Setup (Recommended)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### Step 2: Generate App Password
1. Go to Google Account → Security → 2-Step Verification
2. Scroll down to "App passwords"
3. Select "Mail" and your device
4. Copy the generated 16-character password

### Step 3: Configure Environment Variables
Create a `.env` file in the backend directory with:

```env
# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_SERVICE=gmail
FRONTEND_URL=http://localhost:3000
```

## Other Email Services

### Outlook/Hotmail
```env
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
EMAIL_SERVICE=outlook
```

### Custom SMTP
```env
EMAIL_USER=your_email@yourdomain.com
EMAIL_PASS=your_password
EMAIL_SERVICE=custom
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
```

## Testing Email Functionality

1. **Start the backend server**:
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Create a driver** through the admin panel

3. **Check the console** for email sending logs

4. **Check the driver's email** for the credentials

## Email Template Features

The email template includes:
- ✅ Professional BusZone+ branding
- ✅ Driver's login credentials (username/password)
- ✅ Security notice about changing password
- ✅ Driver information summary
- ✅ Direct login link
- ✅ Next steps for the driver
- ✅ Responsive design

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Make sure you're using an App Password for Gmail
   - Check that 2FA is enabled

2. **"Connection refused" error**:
   - Check your internet connection
   - Verify SMTP settings

3. **Email not received**:
   - Check spam/junk folder
   - Verify email address is correct
   - Check console logs for errors

### Debug Mode:
Add this to your `.env` file to see detailed email logs:
```env
DEBUG_EMAIL=true
```

## Security Notes

- ⚠️ **Never commit your `.env` file to version control**
- ⚠️ **Use App Passwords, not your main email password**
- ⚠️ **The email contains the plain text password - this is intentional for initial setup**
- ⚠️ **Drivers should change their password after first login**

## Production Considerations

For production deployment:
1. Use a dedicated email service (SendGrid, Mailgun, etc.)
2. Set up proper email templates
3. Implement email delivery tracking
4. Add email retry logic
5. Consider using environment-specific email templates
