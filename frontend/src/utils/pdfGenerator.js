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
    const customerName = booking?.user ? 
      `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() || 'N/A' : 'N/A';
    doc.text(`Name: ${customerName}`, 20, 65);
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
      `Route: ${booking.route?.from || 'N/A'} to ${booking.route?.to || 'N/A'}`,
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
    
    // Simple color scheme
    const primaryBlue = [59, 130, 246]; // Blue-500
    const darkGray = [75, 85, 99]; // Gray-600
    const lightGray = [156, 163, 175]; // Gray-400
    
    // Simple header
    doc.setFillColor(...primaryBlue);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('BusZone - Booking Confirmation', 20, 20);
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Booking Details Section
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Booking Details', 20, 55);
    
    // Simple booking information with proper spacing
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    let yPos = 70;
    const details = [
      `Booking ID: ${booking.bookingId}`,
      `Route: ${booking.route?.from || 'N/A'} to ${booking.route?.to || 'N/A'}`,
      `Travel Date: ${new Date(booking.travelDate).toLocaleDateString()}`,
      `Departure Time: ${booking.departureTime || 'N/A'}`,
      `Bus: ${booking.bus?.busType || 'N/A'} (${booking.bus?.numberPlate || 'N/A'})`,
      `Passengers: ${booking.numberOfPassengers || 0}`,
      `Status: ${booking.bookingStatus}`,
      `Payment: ${booking.paymentStatus}`,
      `Total Amount: LKR ${(booking.totalAmount || 0).toLocaleString()}`
    ];
    
    details.forEach((detail, index) => {
      doc.text(detail, 20, yPos + (index * 10));
    });
    
    // Add space before passenger section
    yPos = yPos + (details.length * 10) + 15;
    
    // Passenger details (if available)
    if (booking.seats && booking.seats.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Passenger Information', 20, yPos);
      
      yPos += 15;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      booking.seats.forEach((seat, index) => {
        doc.text(`Passenger ${index + 1}: ${seat.passengerName || 'N/A'}`, 20, yPos);
        doc.text(`  Seat: ${seat.seatNumber || 'N/A'}`, 30, yPos + 8);
        doc.text(`  Age: ${seat.passengerAge || 'N/A'}, Gender: ${seat.passengerGender || 'N/A'}`, 30, yPos + 16);
        yPos += 30;
      });
    }
    
    // Simple footer with proper spacing
    yPos = Math.max(yPos + 20, 250);
    doc.setFontSize(10);
    doc.setTextColor(...lightGray);
    doc.text('Thank you for choosing BusZone!', 20, yPos);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos + 8);
    
    // Save the PDF
    const fileName = `Booking_Confirmation_${booking.bookingId}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    return fileName;
  } catch (error) {
    console.error('Error generating simple PDF:', error);
    throw new Error('Failed to generate PDF: ' + error.message);
  }
};