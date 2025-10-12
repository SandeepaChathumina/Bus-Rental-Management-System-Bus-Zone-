import jsPDF from 'jspdf';

export const generateBookingInvoicePDF = (booking, invoice) => {
  try {
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
    doc.text('Bus Zone', 20, 20);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Luxury Bus Rental Service', 20, 28);
    doc.text('Your Journey, Our Priority', 20, 34);
    
    // Invoice Title
    doc.setTextColor(...secondaryColor);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BOOKING INVOICE', 150, 20);
    
    // Invoice Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Invoice #: ${invoice?.invoiceNumber || 'N/A'}`, 150, 28);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, 34);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Customer Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Customer Information', 20, 55);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${booking.user?.name || 'N/A'}`, 20, 65);
    doc.text(`Email: ${booking.user?.email || 'N/A'}`, 20, 70);
    doc.text(`Phone: ${booking.user?.phone || 'N/A'}`, 20, 75);
    
    // Booking Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', 20, 90);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    let yPos = 100;
    
    const bookingDetails = [
      `Booking ID: ${booking.bookingId}`,
      `Route: ${booking.route?.from || 'N/A'} → ${booking.route?.to || 'N/A'}`,
      `Travel Date: ${new Date(booking.travelDate).toLocaleDateString()}`,
      `Departure Time: ${booking.departureTime || 'N/A'}`,
      `Bus Type: ${booking.bus?.busType || 'N/A'}`,
      `Bus Number: ${booking.bus?.numberPlate || 'N/A'}`,
      `Status: ${booking.bookingStatus}`,
      `Payment Status: ${booking.paymentStatus}`
    ];
    
    bookingDetails.forEach(detail => {
      doc.text(detail, 20, yPos);
      yPos += 5;
    });
    
    // Passenger Information
    if (booking.seats && booking.seats.length > 0) {
      yPos += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Passenger & Seat Information', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      booking.seats.forEach((seat, index) => {
        doc.text(`Passenger ${index + 1}:`, 20, yPos);
        doc.text(`  Name: ${seat.passengerName || 'N/A'}`, 30, yPos + 5);
        doc.text(`  Seat: ${seat.seatNumber || 'N/A'}`, 30, yPos + 10);
        doc.text(`  Age: ${seat.passengerAge || 'N/A'}`, 30, yPos + 15);
        doc.text(`  Gender: ${seat.passengerGender || 'N/A'}`, 30, yPos + 20);
        yPos += 25;
      });
    }
    
    // Payment Summary
    yPos += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Summary', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Item: Bus Booking - ${booking.bookingId}`, 20, yPos);
    doc.text(`Quantity: ${booking.seats?.length || 1}`, 20, yPos + 5);
    doc.text(`Unit Price: LKR ${((booking.totalAmount || 0) / (booking.seats?.length || 1)).toLocaleString()}`, 20, yPos + 10);
    doc.text(`Total Amount: LKR ${(booking.totalAmount || 0).toLocaleString()}`, 20, yPos + 15);
    
    // Footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing Bus Zone!', 20, 280);
    doc.text('For support, contact us at support@buszonesl.com', 20, 285);
    doc.text('Generated on: ' + new Date().toLocaleString(), 20, 290);
    
    // Save the PDF
    const fileName = `Booking_Invoice_${booking.bookingId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};

export const generateSimpleBookingPDF = (booking) => {
  try {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Bus Zone - Booking Confirmation', 20, 20);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Booking Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', 20, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const details = [
      `Booking ID: ${booking.bookingId}`,
      `Route: ${booking.route?.from || 'N/A'} → ${booking.route?.to || 'N/A'}`,
      `Travel Date: ${new Date(booking.travelDate).toLocaleDateString()}`,
      `Departure Time: ${booking.departureTime || 'N/A'}`,
      `Bus: ${booking.bus?.busType || 'N/A'} (${booking.bus?.numberPlate || 'N/A'})`,
      `Passengers: ${booking.numberOfPassengers || 0}`,
      `Seats: ${booking.seats?.map(s => s.seatNumber).join(', ') || 'N/A'}`,
      `Status: ${booking.bookingStatus}`,
      `Payment: ${booking.paymentStatus}`,
      `Total Amount: LKR ${(booking.totalAmount || 0).toLocaleString()}`
    ];
    
    details.forEach((detail, index) => {
      doc.text(detail, 20, 65 + (index * 5));
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Thank you for choosing Bus Zone!', 20, 280);
    doc.text('Generated on: ' + new Date().toLocaleString(), 20, 285);
    
    // Save the PDF
    const fileName = `Booking_${booking.bookingId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};