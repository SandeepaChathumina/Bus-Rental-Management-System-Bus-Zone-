// Invoice Generator Utility Functions
import jsPDF from 'jspdf';

// Generate company invoice
export const generateCompanyInvoice = (bookingData, paymentData, companyInfo = {}) => {
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name || 'Bus Zone', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(companyInfo.address || '123 Main Street, Colombo, Sri Lanka', 20, 28);
  doc.text(`Phone: ${companyInfo.phone || '+94 11 234 5678'}`, 20, 34);
  
  // Invoice Title
  doc.setTextColor(...secondaryColor);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 150, 20);
  
  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${paymentData?.paymentId || 'N/A'}`, 150, 28);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 34);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Customer Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Customer Information', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const customerName = bookingData?.user ? 
    `${bookingData.user.firstName || ''} ${bookingData.user.lastName || ''}`.trim() || 'N/A' : 'N/A';
  doc.text(`Name: ${customerName}`, 20, 65);
  doc.text(`Email: ${bookingData?.user?.email || 'N/A'}`, 20, 70);
  doc.text(`Phone: ${bookingData?.user?.phone || 'N/A'}`, 20, 75);
  
  // Booking Information
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Booking Details', 20, 90);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  let yPos = 100;
  
  const bookingDetails = [
    `Route: ${bookingData?.route?.from || 'N/A'} to ${bookingData?.route?.to || 'N/A'}`,
    `Travel Date: ${bookingData?.travelDate ? new Date(bookingData.travelDate).toLocaleDateString() : 'N/A'}`,
    `Departure Time: ${bookingData?.departureTime || 'N/A'}`,
    `Bus Type: ${bookingData?.bus?.busType || 'N/A'}`,
    `Bus Number: ${bookingData?.bus?.numberPlate || 'N/A'}`,
    `Status: ${bookingData?.bookingStatus || 'N/A'}`,
    `Payment Status: ${bookingData?.paymentStatus || 'N/A'}`
  ];
  
  bookingDetails.forEach(detail => {
    doc.text(detail, 20, yPos);
    yPos += 5;
  });
  
  // Payment Summary
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Summary', 20, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Item: Bus Booking`, 20, yPos);
  doc.text(`Quantity: ${bookingData?.seats?.length || 1}`, 20, yPos + 5);
  doc.text(`Unit Price: LKR ${((bookingData?.totalAmount || 0) / (bookingData?.seats?.length || 1)).toLocaleString()}`, 20, yPos + 10);
  doc.text(`Total Amount: LKR ${(bookingData?.totalAmount || 0).toLocaleString()}`, 20, yPos + 15);
  
  // Payment Information
  if (paymentData) {
    yPos += 25;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Information', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment ID: ${paymentData.paymentId || 'N/A'}`, 20, yPos);
    doc.text(`Payment Method: ${paymentData.paymentMethod || 'N/A'}`, 20, yPos + 5);
    doc.text(`Transaction ID: ${paymentData.transactionId || 'N/A'}`, 20, yPos + 10);
    doc.text(`Status: ${paymentData.status || 'N/A'}`, 20, yPos + 15);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for choosing Bus Zone!', 20, 280);
  doc.text(`For support, contact us at ${companyInfo.email || 'support@buszonesl.com'}`, 20, 285);
  doc.text('Generated on: ' + new Date().toLocaleString(), 20, 290);
  
  // Save the PDF
  const fileName = `Invoice_${bookingData?.bookingId || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

// Generate payment receipt
export const generatePaymentReceipt = (paymentData, bookingData) => {
  const doc = new jsPDF();
  
  // Set up colors
  const primaryColor = [34, 197, 94]; // Green
  const secondaryColor = [52, 73, 94]; // Dark gray
  
  // Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Company Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Bus Zone', 20, 20);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment Receipt', 20, 28);
  doc.text('Transaction Confirmation', 20, 34);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  
  // Receipt details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Information', 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Receipt #: ${paymentData?.transactionId || paymentData?.paymentId || 'N/A'}`, 20, 65);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 70);
  doc.text(`Amount: LKR ${(paymentData?.amount || 0).toLocaleString()}`, 20, 75);
  doc.text(`Payment Method: ${paymentData?.paymentMethod || 'N/A'}`, 20, 80);
  doc.text(`Status: ${paymentData?.status || 'Pending'}`, 20, 85);
  
  // Booking reference
  if (bookingData) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Reference', 20, 100);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Route: ${bookingData.route?.from || 'N/A'} to ${bookingData.route?.to || 'N/A'}`, 20, 110);
    doc.text(`Route: ${bookingData.route?.from || 'N/A'} to ${bookingData.route?.to || 'N/A'}`, 20, 115);
    doc.text(`Travel Date: ${bookingData.travelDate ? new Date(bookingData.travelDate).toLocaleDateString() : 'N/A'}`, 20, 120);
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Thank you for your payment!', 20, 280);
  doc.text('For support, contact us at support@buszonesl.com', 20, 285);
  doc.text('Generated on: ' + new Date().toLocaleString(), 20, 290);
  
  // Save the PDF
  const fileName = `Receipt_${paymentData?.transactionId || paymentData?.paymentId || 'unknown'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
  
  return fileName;
};

// Download invoice as PDF
export const downloadInvoice = (bookingData, paymentData, companyInfo = {}) => {
  return generateCompanyInvoice(bookingData, paymentData, companyInfo);
};

// Download receipt as PDF
export const downloadReceipt = (paymentData, bookingData) => {
  return generatePaymentReceipt(paymentData, bookingData);
};
