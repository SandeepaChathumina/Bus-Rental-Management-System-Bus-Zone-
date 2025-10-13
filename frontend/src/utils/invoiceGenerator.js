// Invoice Generator Utility Functions
import jsPDF from 'jspdf';

// Generate company invoice
export const generateCompanyInvoice = (bookingData, paymentData) => {
  const doc = new jsPDF();
  
  // Company header
  doc.setFontSize(20);
  doc.text('Bus Zone - Invoice', 20, 30);
  
  // Invoice details
  doc.setFontSize(12);
  doc.text(`Invoice #: ${paymentData?.paymentId || 'N/A'}`, 20, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
  
  // Booking details
  doc.text(`Booking ID: ${bookingData?.bookingId || 'N/A'}`, 20, 80);
  doc.text(`Route: ${bookingData?.route || 'N/A'}`, 20, 90);
  doc.text(`Amount: LKR ${paymentData?.amount || 0}`, 20, 100);
  
  // Payment status
  doc.text(`Status: ${paymentData?.status || 'Pending'}`, 20, 120);
  
  return doc;
};

// Generate payment receipt
export const generatePaymentReceipt = (paymentData, bookingData) => {
  const doc = new jsPDF();
  
  // Receipt header
  doc.setFontSize(18);
  doc.text('Payment Receipt', 20, 30);
  
  // Receipt details
  doc.setFontSize(12);
  doc.text(`Receipt #: ${paymentData?.transactionId || 'N/A'}`, 20, 50);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
  doc.text(`Amount: LKR ${paymentData?.amount || 0}`, 20, 70);
  doc.text(`Payment Method: ${paymentData?.paymentMethod || 'N/A'}`, 20, 80);
  doc.text(`Status: ${paymentData?.status || 'Pending'}`, 20, 90);
  
  // Booking reference
  if (bookingData) {
    doc.text(`Booking Reference: ${bookingData.bookingId || 'N/A'}`, 20, 110);
  }
  
  return doc;
};

// Download invoice as PDF
export const downloadInvoice = (bookingData, paymentData) => {
  const doc = generateCompanyInvoice(bookingData, paymentData);
  doc.save(`invoice-${paymentData?.paymentId || 'unknown'}.pdf`);
};

// Download receipt as PDF
export const downloadReceipt = (paymentData, bookingData) => {
  const doc = generatePaymentReceipt(paymentData, bookingData);
  doc.save(`receipt-${paymentData?.transactionId || 'unknown'}.pdf`);
};
