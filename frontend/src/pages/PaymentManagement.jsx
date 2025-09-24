// src/pages/admin/PaymentManagement.jsx - COMBINED VIEW WITHOUT TABS
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  CreditCard, 
  Wrench, 
  User,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MoreVertical,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  ExternalLink,
  Copy,
  Play,
  Loader,
  Shield,
  Check,
  Lock,
  ArrowLeft,
  FileText,
  Printer,
  Mail,
  Home,
  PieChart,
  Activity,
  Users,
  Building,
  CreditCard as CardIcon,
  Banknote,
  Receipt,
  Calendar as CalendarIcon,
  Filter as FilterIcon,
  DownloadCloud,
  Upload,
  Settings
} from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
// Export modal state
const [showExportModal, setShowExportModal] = useState(false);
const [exportFormat, setExportFormat] = useState('pdf');
const [exportLoading, setExportLoading] = useState(false);

const PaymentManagement = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showNewPaymentModal, setShowNewPaymentModal] = useState(false);
  const [newPaymentType, setNewPaymentType] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('details');
  const [generatedInvoice, setGeneratedInvoice] = useState(null);
  
  // Revenue data state
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    monthlyData: [],
    paymentMethods: {},
    pendingPayments: 0,
    completedPayments: 0,
    failedPayments: 0
  });
  
  const [timeRange, setTimeRange] = useState('month');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    dateFrom: '',
    dateTo: ''
  });

  // New payment form state
  const [newPayment, setNewPayment] = useState({
    type: '',
    amount: '',
    description: '',
    employeeId: '',
    maintenanceId: '',
    paymentMethod: 'bank_transfer',
    date: new Date().toISOString().split('T')[0]
  });

  // Stripe form state with sample data pre-filled
  const [stripeForm, setStripeForm] = useState({
    cardNumber: '4242 4242 4242 4242',
    expiryDate: '12/34',
    cvc: '123',
    cardholderName: 'John Doe',
    email: 'john.doe@example.com',
    agreeToTerms: true
  });

  // Dummy data for demonstration
  // Dummy data for demonstration
  const dummyPayments = [
    {
      _id: 'PAY-1001',
      type: 'rent',
      amount: 35000,
      description: 'Monthly Rent Payment - Apartment A101',
      status: 'completed',
      paymentMethod: 'stripe',
      date: '2024-01-15',
      createdAt: '2024-01-15T10:30:00Z',
      apartmentId: 'APT-A101'
    },
    {
      _id: 'PAY-1002',
      type: 'salary',
      amount: 45000,
      description: 'January Salary - John Smith',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      date: '2024-01-20',
      createdAt: '2024-01-20T09:15:00Z',
      employeeId: 'EMP-001'
    },
    {
      _id: 'PAY-1003',
      type: 'maintenance',
      amount: 12500,
      description: 'AC Repair Service',
      status: 'pending',
      paymentMethod: 'cash',
      date: '2024-01-22',
      createdAt: '2024-01-22T14:20:00Z',
      maintenanceId: 'MNT-001'
    },
    {
      _id: 'PAY-1004',
      type: 'booking',
      amount: 28000,
      description: 'Booking Payment - Family Vacation',
      status: 'completed',
      paymentMethod: 'stripe',
      date: '2024-01-18',
      createdAt: '2024-01-18T16:45:00Z',
      bookingId: 'BK-001'
    },
    {
      _id: 'PAY-1005',
      type: 'rent',
      amount: 32000,
      description: 'Monthly Rent Payment - Apartment B202',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      date: '2024-01-10',
      createdAt: '2024-01-10T11:00:00Z',
      apartmentId: 'APT-B202'
    },
    {
      _id: 'PAY-1006',
      type: 'salary',
      amount: 38000,
      description: 'January Salary - Maria Garcia',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      date: '2024-01-20',
      createdAt: '2024-01-20T09:15:00Z',
      employeeId: 'EMP-002'
    },
    {
      _id: 'PAY-1007',
      type: 'maintenance',
      amount: 8500,
      description: 'Plumbing Repair',
      status: 'failed',
      paymentMethod: 'cash',
      date: '2024-01-25',
      createdAt: '2024-01-25T13:30:00Z',
      maintenanceId: 'MNT-002'
    },
    {
      _id: 'PAY-1008',
      type: 'booking',
      amount: 45000,
      description: 'Booking Payment - Business Trip',
      status: 'completed',
      paymentMethod: 'stripe',
      date: '2024-01-12',
      createdAt: '2024-01-12T15:20:00Z',
      bookingId: 'BK-002'
    }
  ];

  // Test card data
  const testCards = [
    { number: '4242424242424242', type: 'Visa', status: 'Success' },
    { number: '5555555555554444', type: 'MasterCard', status: 'Success' },
    { number: '4000000000000002', type: 'Visa', status: 'Declined' }
  ];

  // Payment methods including Stripe
  const paymentMethods = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'check', label: 'Check' },
    { value: 'stripe', label: 'Credit/Debit Card (Stripe)' }
  ];

  // New payment types for the form
  const newPaymentTypes = [
    { value: '', label: 'Select Payment Type', disabled: true },
    { value: 'salary', label: 'Salary Payment (Expense)', category: 'expense' },
    { value: 'maintenance', label: 'Maintenance Payment (Expense)', category: 'expense' },
    { value: 'rent', label: 'Rent Payment (Income)', category: 'income' },
    { value: 'booking', label: 'Booking Payment (Income)', category: 'income' },
    { value: 'test_salary', label: '💰 Test Salary Payment', category: 'expense', test: true },
    { value: 'test_maintenance', label: '🔧 Test Maintenance Payment', category: 'expense', test: true },
    { value: 'test_rent', label: '🏠 Test Rent Payment', category: 'income', test: true },
    { value: 'test_booking', label: '📅 Test Booking Payment', category: 'income', test: true }
  ];

  // Fixed PDF ජනන ක්රියාකාරිත්වය
  const generatePDFReport = () => {
    try {
      const doc = new jsPDF();
      doc.setProperties({
        title: 'Payment Management Report',
        subject: 'Payment Export',
        author: 'BusZone+ System',
        keywords: 'payment, report, management',
        creator: 'BusZone+'
      });

      // Header
      doc.setFillColor(30, 41, 59);
      doc.rect(0, 0, 210, 30, 'F');
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text('PAYMENT MANAGEMENT REPORT', 105, 15, { align: 'center' });

      // Subtitle
      doc.setFontSize(10);
      doc.setTextColor(200, 200, 200);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 22, { align: 'center' });

      // Table
      const headers = ['ID', 'Type', 'Amount', 'Status', 'Date', 'Method', 'Description'];
      let paymentsToExport = [];
      if (filteredPayments.length > 0) {
        paymentsToExport = filteredPayments.slice(0, 5);
        if (paymentsToExport.length < 5) {
          paymentsToExport = paymentsToExport.concat(dummyPayments.slice(0, 5 - paymentsToExport.length));
        }
      } else {
        paymentsToExport = dummyPayments.slice(0, 5);
      }
      const tableData = paymentsToExport.map(payment => [
        payment._id,
        payment.type,
        formatCurrency(payment.amount),
        payment.status,
        payment.date,
        payment.paymentMethod,
        payment.description
      ]);
      doc.autoTable({
        startY: 35,
        head: [headers],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 8 }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
        doc.text('BusZone+ Payment Management System', 105, 295, { align: 'center' });
      }

      doc.save(`Payment_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF report. Please try again.');
    }
  };

  // Detailed PDF report function
  const generateDetailedPDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Cover page
      doc.setFontSize(24);
      doc.setTextColor(59, 130, 246);
      doc.text('COLOMBO CITY APARTMENTS', 105, 40, null, null, 'center');
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40);
      doc.text('COMPREHENSIVE PAYMENT REPORT', 105, 55, null, null, 'center');
      
      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Report Period: ${new Date().toLocaleDateString('en-LK', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`, 105, 65, null, null, 'center');
      
      // Executive Summary
      let yPosition = 85;
      
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Executive Summary', 15, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      const summaryText = [
        `Total Revenue: ${formatCurrency(revenueData.totalRevenue)}`,
        `Total Expenses: ${formatCurrency(revenueData.totalExpenses)}`,
        `Net Profit: ${formatCurrency(revenueData.netProfit)}`,
        `Payment Success Rate: ${payments.length > 0 ? ((revenueData.completedPayments / payments.length) * 100).toFixed(1) : 0}%`,
        `Total Transactions: ${payments.length}`
      ];
      
      summaryText.forEach(line => {
        doc.text(line, 20, yPosition);
        yPosition += 7;
      });
      
      // Payment methods distribution
      yPosition += 10;
      doc.setFontSize(14);
      doc.text('Payment Methods Distribution', 15, yPosition);
      
      const paymentMethodsData = Object.entries(revenueData.paymentMethods).map(([method, count]) => [
        method.replace('_', ' ').toUpperCase(),
        count.toString(),
        `${payments.length > 0 ? ((count / payments.length) * 100).toFixed(1) : 0}%`
      ]);
      
      doc.autoTable({
        startY: yPosition + 5,
        head: [['Payment Method', 'Count', 'Percentage']],
        body: paymentMethodsData,
        theme: 'grid',
        headStyles: { fillColor: [16, 185, 129] },
        styles: { fontSize: 9 }
      });
      
      // Detailed payment records
      const detailedTableTop = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(14);
      doc.text('Detailed Payment Records', 15, detailedTableTop);
      
      const detailedData = filteredPayments.map(payment => [
        payment._id,
        payment.type.toUpperCase(),
        formatCurrency(payment.amount),
        payment.status.toUpperCase(),
        new Date(payment.date).toLocaleDateString('en-LK'),
        payment.paymentMethod.toUpperCase(),
        payment.description.substring(0, 30) + (payment.description.length > 30 ? '...' : '')
      ]);
      
      doc.autoTable({
        startY: detailedTableTop + 5,
        head: [['ID', 'Type', 'Amount', 'Status', 'Date', 'Method', 'Description']],
        body: detailedData,
        theme: 'grid',
        headStyles: { fillColor: [59, 130, 246] },
        styles: { fontSize: 7 }
      });
      
      // Page numbers
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Confidential - Colombo City Apartments - Page ${i} of ${pageCount}`, 
          doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, 
          null, null, 'center');
      }
      
      doc.save(`detailed-payment-report-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating detailed PDF:', error);
      alert('Error generating detailed PDF report. Please try again.');
    }
  };

  // Fetch payments data from backend API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Try to fetch from backend first
      const response = await axios.get('/api/payments/admin/all', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          page: 1,
          limit: 100
        }
      });

      if (response.data.success) {
        const paymentsData = response.data.payments;
        
        // Transform backend data to match frontend format
        const transformedPayments = paymentsData.map(payment => ({
          _id: payment._id || payment.paymentId,
          paymentId: payment.paymentId,
          type: payment.paymentType || 'other',
          amount: payment.amount || 0,
          description: payment.description || 'No description',
          status: mapPaymentStatus(payment.status),
          paymentMethod: payment.paymentMethod || 'unknown',
          date: payment.createdAt ? new Date(payment.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          createdAt: payment.createdAt || new Date().toISOString(),
          
          // Related entity IDs
          employeeId: payment.driver ? payment.driver.user?.firstName + ' ' + payment.driver.user?.lastName : undefined,
          maintenanceId: payment.maintenance?.maintenanceId,
          bookingId: payment.booking?.bookingId,
          apartmentId: payment.relatedEntity?.id,
          
          // Additional backend fields
          originalData: payment
        }));
        
        setPayments(transformedPayments);
        setFilteredPayments(transformedPayments);
        calculateRevenueData(transformedPayments);
      }
    } catch (error) {
      console.error('Error fetching payments from backend. Using dummy data:', error);
      
      // Use dummy data if API fails
      setPayments(dummyPayments);
      setFilteredPayments(dummyPayments);
      calculateRevenueData(dummyPayments);
    } finally {
      setLoading(false);
    }
  };

  // Map backend status to frontend status
  const mapPaymentStatus = (backendStatus) => {
    const statusMap = {
      'success': 'completed',
      'completed': 'completed',
      'pending': 'pending',
      'failed': 'failed',
      'refunded': 'refunded',
      'processing': 'pending'
    };
    return statusMap[backendStatus] || 'pending';
  };

  // Calculate revenue data
  const calculateRevenueData = (payments) => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let pendingPayments = 0;
    let completedPayments = 0;
    let failedPayments = 0;
    const paymentMethodsCount = {};
    const monthlyData = [];
    
    const monthlyTotals = {};
    
    payments.forEach(payment => {
      // Count by status
      if (payment.status === 'pending') pendingPayments++;
      else if (payment.status === 'completed') completedPayments++;
      else if (payment.status === 'failed') failedPayments++;
      
      // Count by payment method
      paymentMethodsCount[payment.paymentMethod] = 
        (paymentMethodsCount[payment.paymentMethod] || 0) + 1;
      
      // Calculate revenue and expenses
      if (payment.type === 'rent' || payment.type === 'booking') {
        totalRevenue += payment.amount;
      } else {
        totalExpenses += payment.amount;
      }
      
      // Group by month
      const paymentDate = new Date(payment.date);
      const monthYear = `${paymentDate.getFullYear()}-${paymentDate.getMonth() + 1}`;
      
      if (!monthlyTotals[monthYear]) {
        monthlyTotals[monthYear] = { revenue: 0, expenses: 0 };
      }
      
      if (payment.type === 'rent' || payment.type === 'booking') {
        monthlyTotals[monthYear].revenue += payment.amount;
      } else {
        monthlyTotals[monthYear].expenses += payment.amount;
      }
    });
    
    // Convert monthly totals to array
    Object.keys(monthlyTotals).forEach(month => {
      monthlyData.push({
        month,
        revenue: monthlyTotals[month].revenue,
        expenses: monthlyTotals[month].expenses,
        profit: monthlyTotals[month].revenue - monthlyTotals[month].expenses
      });
    });
    
    // Sort monthly data
    monthlyData.sort((a, b) => {
      const [aYear, aMonth] = a.month.split('-').map(Number);
      const [bYear, bMonth] = b.month.split('-').map(Number);
      return aYear === bYear ? aMonth - bMonth : aYear - bYear;
    });
    
    setRevenueData({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      monthlyData,
      paymentMethods: paymentMethodsCount,
      pendingPayments,
      completedPayments,
      failedPayments
    });
  };

  // Filter payments based on search and filters
  const applyFilters = () => {
    let filtered = payments;
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (payment.employeeId && payment.employeeId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.maintenanceId && payment.maintenanceId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.bookingId && payment.bookingId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (payment.apartmentId && payment.apartmentId.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(payment => payment.status === filters.status);
    }
    
    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(payment => payment.type === filters.type);
    }
    
    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(payment => payment.date >= filters.dateFrom);
    }
    
    if (filters.dateTo) {
      filtered = filtered.filter(payment => payment.date <= filters.dateTo);
    }
    
    setFilteredPayments(filtered);
  };

  // Generate Invoice Function
  const generateInvoice = (paymentData) => {
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const invoiceDate = new Date().toLocaleDateString('en-LK');
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-LK');
    
    const invoice = {
      invoiceNumber: invoiceNumber,
      invoiceDate: invoiceDate,
      dueDate: dueDate,
      paymentId: paymentData._id || `PAY-${Date.now()}`,
      paymentDate: paymentData.date || new Date().toLocaleDateString('en-LK'),
      type: paymentData.type,
      amount: paymentData.amount,
      description: paymentData.description,
      paymentMethod: paymentData.paymentMethod || 'stripe',
      status: paymentData.status || 'Paid',
      recipient: {
        name: paymentData.employeeId ? 'Employee Salary' : 
              paymentData.maintenanceId ? 'Maintenance Service' :
              paymentData.bookingId ? 'Booking Customer' : 'Rent Tenant',
        id: paymentData.employeeId || paymentData.maintenanceId || paymentData.bookingId || paymentData.apartmentId,
        type: paymentData.employeeId ? 'Employee' : 
              paymentData.maintenanceId ? 'Service Provider' :
              paymentData.bookingId ? 'Customer' : 'Tenant'
      },
      company: {
        name: 'Colombo City Apartments',
        address: '123 Galle Road, Colombo 03, Sri Lanka',
        phone: '+94 11 234 5678',
        email: 'accounts@colomboapartments.lk',
        taxId: 'TAX-123-456-789'
      },
      items: [
        {
          description: paymentData.description,
          quantity: 1,
          unitPrice: paymentData.amount,
          total: paymentData.amount
        }
      ],
      subtotal: paymentData.amount,
      tax: 0,
      total: paymentData.amount,
      paymentDetails: {
        method: paymentData.paymentMethod || 'stripe',
        transactionId: `txn_${Math.random().toString(36).substr(2, 14)}`,
        cardLast4: '4242',
        timestamp: new Date().toLocaleString('en-LK'),
        cardholderName: stripeForm.cardholderName,
        email: stripeForm.email
      }
    };
    
    return invoice;
  };

  // Handle Stripe payment submission
  const handleStripePaymentSubmit = async (e) => {
    e.preventDefault();
    setProcessingPayment(true);

    try {
      if (!stripeForm.agreeToTerms) {
        alert('Please agree to the Terms & Conditions');
        setProcessingPayment(false);
        return;
      }

      // Simulate API call delay
      setTimeout(() => {
        const paymentData = {
          ...newPayment,
          _id: `PAY-${Date.now()}`,
          stripePaymentId: `pi_${Math.random().toString(36).substr(2, 14)}`,
          date: new Date().toISOString().split('T')[0],
          status: 'completed'
        };
        
        const invoice = generateInvoice(paymentData);
        setGeneratedInvoice(invoice);
        setProcessingPayment(false);
        setPaymentStep('success');
        
        let updatedPayments;
        if (filteredPayments.length === 0) {
          // Show new payment above dummy data
          updatedPayments = [
            {
              ...paymentData,
              invoiceNumber: invoice.invoiceNumber,
              createdAt: new Date().toISOString()
            },
            ...dummyPayments.slice(0, 5)
          ];
        } else {
          updatedPayments = [
            {
              ...paymentData,
              invoiceNumber: invoice.invoiceNumber,
              createdAt: new Date().toISOString()
            },
            ...filteredPayments
          ];
        }
        setPayments(updatedPayments);
        setFilteredPayments(updatedPayments);
        calculateRevenueData(updatedPayments);
        
      }, 2000);

    } catch (error) {
      console.error('Error processing Stripe payment:', error);
      alert('Payment failed: ' + (error.response?.data?.message || error.message));
      setProcessingPayment(false);
    }
  };

  // Handle manual payment creation
  const handleManualPaymentCreation = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/payments/admin/create', 
        {
          ...newPayment,
          amount: parseFloat(newPayment.amount)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        const invoice = generateInvoice({
          ...newPayment,
          _id: response.data.payment._id
        });
        setGeneratedInvoice(invoice);
        setPaymentStep('success');
        fetchPayments();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      alert('Error creating payment: ' + error.response?.data?.message);
    }
  };

  // Combined payment handler
  const handleCreatePayment = async (e) => {
    e.preventDefault();
    
    if (newPayment.paymentMethod === 'stripe') {
      if (newPaymentType.includes('test_')) {
        setStripeForm({
          cardNumber: '4242 4242 4242 4242',
          expiryDate: '12/34',
          cvc: '123',
          cardholderName: 'Test Customer',
          email: 'test@example.com',
          agreeToTerms: true
        });
      }
      setPaymentStep('stripe');
    } else {
      await handleManualPaymentCreation(e);
    }
  };

  // Print Invoice
  const printInvoice = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${generatedInvoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
            .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .company-info { text-align: right; }
            .invoice-details { margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .total-section { text-align: right; margin-top: 20px; }
            .payment-details { background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px; }
            .success-badge { background: #10b981; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-bottom: 20px; }
            @media print { body { margin: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="success-badge">Payment Successful ✓</div>
          <div class="invoice-header">
            <div>
              <h1>INVOICE</h1>
              <p><strong>Invoice Number:</strong> ${generatedInvoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${generatedInvoice.invoiceDate}</p>
              <p><strong>Due Date:</strong> ${generatedInvoice.dueDate}</p>
            </div>
            <div class="company-info">
              <h2>${generatedInvoice.company.name}</h2>
              <p>${generatedInvoice.company.address}</p>
              <p>Phone: ${generatedInvoice.company.phone}</p>
              <p>Email: ${generatedInvoice.company.email}</p>
              <p>Tax ID: ${generatedInvoice.company.taxId}</p>
            </div>
          </div>
          
          <div class="invoice-details">
            <h3>Bill To:</h3>
            <p><strong>${generatedInvoice.recipient.name}</strong></p>
            <p>${generatedInvoice.recipient.type}: ${generatedInvoice.recipient.id}</p>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price (LKR)</th>
                <th>Total (LKR)</th>
              </tr>
            </thead>
            <tbody>
              ${generatedInvoice.items.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.unitPrice)}</td>
                  <td>${formatCurrency(item.total)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <p><strong>Subtotal: ${formatCurrency(generatedInvoice.subtotal)}</strong></p>
            <p><strong>Tax: ${formatCurrency(generatedInvoice.tax)}</strong></p>
            <p><strong>Total Amount: ${formatCurrency(generatedInvoice.total)}</strong></p>
          </div>
          
          <div class="payment-details">
            <h3>Payment Information</h3>
            <p><strong>Payment Method:</strong> Stripe (Credit Card)</p>
            <p><strong>Transaction ID:</strong> ${generatedInvoice.paymentDetails.transactionId}</p>
            <p><strong>Cardholder:</strong> ${generatedInvoice.paymentDetails.cardholderName}</p>
            <p><strong>Email:</strong> ${generatedInvoice.paymentDetails.email}</p>
            <p><strong>Status:</strong> <span style="color: green;">${generatedInvoice.status}</span></p>
            <p><strong>Payment Date:</strong> ${generatedInvoice.paymentDate}</p>
            <p><strong>Processed At:</strong> ${generatedInvoice.paymentDetails.timestamp}</p>
          </div>
          
          <div class="no-print" style="margin-top: 30px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Invoice
            </button>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Download Invoice as PDF
  const downloadInvoice = () => {
    const invoiceContent = `
      COLOMBO CITY APARTMENTS - PAYMENT RECEIPT
      ========================================
      
      Invoice Number: ${generatedInvoice.invoiceNumber}
      Date: ${generatedInvoice.invoiceDate}
      Payment Status: SUCCESSFUL ✓
      
      COMPANY INFORMATION:
      ${generatedInvoice.company.name}
      ${generatedInvoice.company.address}
      Phone: ${generatedInvoice.company.phone}
      Email: ${generatedInvoice.company.email}
      
      BILL TO:
      ${generatedInvoice.recipient.name}
      ${generatedInvoice.recipient.type}: ${generatedInvoice.recipient.id}
      
      PAYMENT DETAILS:
      Description: ${generatedInvoice.description}
      Amount: ${formatCurrency(generatedInvoice.amount)}
      Payment Method: Stripe (Credit Card)
      Transaction ID: ${generatedInvoice.paymentDetails.transactionId}
      Cardholder: ${generatedInvoice.paymentDetails.cardholderName}
      Email: ${generatedInvoice.paymentDetails.email}
      Payment Date: ${generatedInvoice.paymentDate}
      Processed At: ${generatedInvoice.paymentDetails.timestamp}
      
      Thank you for your payment!
      This is an computer generated receipt.
    `;
    
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-receipt-${generatedInvoice.invoiceNumber}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reset and close everything
  const completePaymentProcess = () => {
    setShowNewPaymentModal(false);
    setPaymentStep('details');
    setGeneratedInvoice(null);
    resetNewPaymentForm();
  };

  // Reset new payment form
  const resetNewPaymentForm = () => {
    setNewPayment({
      type: '',
      amount: '',
      description: '',
      employeeId: '',
      maintenanceId: '',
      paymentMethod: 'bank_transfer',
      date: new Date().toISOString().split('T')[0]
    });
    setNewPaymentType('');
    setStripeForm({
      cardNumber: '4242 4242 4242 4242',
      expiryDate: '12/34',
      cvc: '123',
      cardholderName: 'John Doe',
      email: 'john.doe@example.com',
      agreeToTerms: true
    });
  };

  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    return parts.length ? parts.join(' ') : value;
  };

  // Format expiry date
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    return v;
  };

  // Format currency
  const formatCurrency = (amount, currency = 'LKR') => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Auto-fill test data for Stripe form
  const autoFillStripeTestData = () => {
    setStripeForm({
      cardNumber: '4242 4242 4242 4242',
      expiryDate: '12/34',
      cvc: '123',
      cardholderName: 'Test Customer',
      email: 'test@example.com',
      agreeToTerms: true
    });
  };

  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge color
  const getTypeBadge = (type) => {
    switch (type) {
      case 'salary': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'rent': return 'bg-purple-100 text-purple-800';
      case 'booking': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'stripe': return <CardIcon className="w-4 h-4" />;
      case 'bank_transfer': return <Banknote className="w-4 h-4" />;
      case 'cash': return <DollarSign className="w-4 h-4" />;
      case 'check': return <FileText className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Amount', 'Description', 'Status', 'Payment Method', 'Date'];
    const csvContent = [
      headers.join(','),
      ...filteredPayments.map(payment => [
        payment._id,
        payment.type,
        payment.amount,
        `"${payment.description.replace(/"/g, '""')}"`,
        payment.status,
        payment.paymentMethod,
        payment.date
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Dark mode toggle function (optional)
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters, payments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Management</h1>
              <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Manage income, expenses, and track revenue</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={exportToCSV}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700"
              >
                <DownloadCloud className="w-4 h-4 mr-2" />
                Export CSV
              </button>
              
              <button 
                onClick={generatePDFReport}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-700"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export PDF
              </button>
              
              <button 
                onClick={() => setShowNewPaymentModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Payment
              </button>

              <button 
                onClick={() => setDarkMode(!darkMode)}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  darkMode ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {darkMode ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* COMBINED VIEW - All sections displayed together */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Overview Dashboard Section */}
        <div className="mb-12">
          <h2 className={`text-xl font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <BarChart3 className="w-5 h-5 mr-2" />
            Financial Overview
          </h2>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Revenue</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(revenueData.totalRevenue)}</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Expenses</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(revenueData.totalExpenses)}</p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Net Profit</p>
                  <p className={`text-2xl font-bold ${
                    revenueData.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(revenueData.netProfit)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pending Payments</p>
                  <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{revenueData.pendingPayments}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Additional Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Payment Status Distribution */}
            <div className={`rounded-lg shadow p-6 lg:col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Completed</span>
                  <div className="flex items-center">
                    <span className={`font-medium mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{revenueData.completedPayments}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${(revenueData.completedPayments / payments.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Pending</span>
                  <div className="flex items-center">
                    <span className={`font-medium mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{revenueData.pendingPayments}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-500 h-2 rounded-full" 
                        style={{ width: `${(revenueData.pendingPayments / payments.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Failed</span>
                  <div className="flex items-center">
                    <span className={`font-medium mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{revenueData.failedPayments}</span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${(revenueData.failedPayments / payments.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods Distribution */}
            <div className={`rounded-lg shadow p-6 lg:col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Methods</h3>
              <div className="space-y-3">
                {Object.entries(revenueData.paymentMethods).map(([method, count]) => (
                  <div key={method} className="flex justify-between items-center">
                    <span className={`text-sm capitalize ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{method.replace('_', ' ')}</span>
                    <div className="flex items-center">
                      <span className={`font-medium mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{count}</span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / payments.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Payments */}
            <div className={`rounded-lg shadow p-6 lg:col-span-1 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Payments</h3>
              <div className="space-y-3">
                {filteredPayments.slice(0, 5).map(payment => (
                  <div key={payment._id} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <div>
                      <p className={`font-medium text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{payment.description}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(payment.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        payment.type === 'rent' || payment.type === 'booking' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(payment.amount)}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Revenue vs Expenses */}
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Monthly Financial Overview</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Month</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Revenue</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Expenses</th>
                    <th className={`px-4 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Profit/Loss</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                  {revenueData.monthlyData.slice(-6).map((monthData, index) => (
                    <tr key={index}>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {new Date(monthData.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">
                        {formatCurrency(monthData.revenue)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">
                        {formatCurrency(monthData.expenses)}
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${
                        monthData.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(monthData.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* All Payments Table Section */}
        <div className="mb-12">
          <h2 className={`text-xl font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <Receipt className="w-5 h-5 mr-2" />
            All Payments
          </h2>
          
          {/* Filters and Search */}
          <div className={`rounded-lg shadow mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                <div className="relative flex-1 max-w-md">
                  <Search className={`w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center px-4 py-2 border rounded-lg ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <FilterIcon className="w-4 h-4 mr-2" />
                    Filters
                  </button>
                  
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="week">Last 7 days</option>
                    <option value="month">Last 30 days</option>
                    <option value="quarter">Last 3 months</option>
                    <option value="year">Last year</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              </div>
              
              {/* Advanced Filters */}
              {showFilters && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({...prev, status: e.target.value}))}
                    className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                  
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters(prev => ({...prev, type: e.target.value}))}
                    className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    <option value="all">All Types</option>
                    <option value="salary">Salary</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="rent">Rent</option>
                    <option value="booking">Booking</option>
                  </select>
                  
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters(prev => ({...prev, dateFrom: e.target.value}))}
                    className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="From Date"
                  />
                  
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters(prev => ({...prev, dateTo: e.target.value}))}
                    className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    placeholder="To Date"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payments Table */}
          <div className={`rounded-lg shadow overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Payment Details</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Type</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Amount</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Status</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Date</th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${darkMode ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                  {(filteredPayments.length > 0 ? filteredPayments : dummyPayments.slice(0, 5)).map((payment) => (
                    <tr key={payment._id} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{payment.description}</div>
                          <div className={`text-sm flex items-center mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span className="ml-2 capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(payment.type)}`}>
                          {payment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-bold ${
                          payment.type === 'rent' || payment.type === 'booking' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPaymentModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className={`${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-900'}`}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className={`px-4 py-3 border-t ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
              <div className="flex items-center justify-between">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                  Showing <span className="font-medium">1</span> to <span className="font-medium">{filteredPayments.length}</span> of{' '}
                  <span className="font-medium">{filteredPayments.length}</span> results
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reports Section */}
        <div>
          <h2 className={`text-xl font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            <PieChart className="w-5 h-5 mr-2" />
            Financial Reports
          </h2>
          
          <div className={`rounded-lg shadow p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Income vs Expenses</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className={`text-sm font-medium text-green-600`}>Total Income</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(revenueData.totalRevenue)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(revenueData.totalRevenue / (revenueData.totalRevenue + revenueData.totalExpenses)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-red-600">Total Expenses</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(revenueData.totalExpenses)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-600 h-2 rounded-full" 
                        style={{ width: `${(revenueData.totalExpenses / (revenueData.totalRevenue + revenueData.totalExpenses)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Type Distribution</h3>
                <div className="space-y-3">
                  {['rent', 'booking', 'salary', 'maintenance'].map(type => {
                    const typePayments = payments.filter(p => p.type === type);
                    const totalAmount = typePayments.reduce((sum, p) => sum + p.amount, 0);
                    const percentage = (totalAmount / (revenueData.totalRevenue + revenueData.totalExpenses)) * 100;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <span className={`text-sm capitalize ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{type}</span>
                        <div className="flex items-center">
                          <span className={`text-sm font-medium mr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalAmount)}</span>
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>({percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className={`border-t pt-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Generate Custom Report</h3>
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={generatePDFReport}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF Report
                </button>
                <button 
                  onClick={generateDetailedPDFReport}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Detailed Report
                </button>
                <button className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Analytics Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Detail Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Details</h3>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment ID</label>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPayment._id}</p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Type</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(selectedPayment.type)}`}>
                        {selectedPayment.type}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Description</label>
                  <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Amount</label>
                    <p className={`mt-1 text-lg font-bold ${
                      selectedPayment.type === 'rent' || selectedPayment.type === 'booking' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(selectedPayment.amount)}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Status</label>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(selectedPayment.status)}`}>
                        {selectedPayment.status}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Payment Method</label>
                    <p className={`mt-1 text-sm capitalize flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                      <span className="ml-2">{selectedPayment.paymentMethod.replace('_', ' ')}</span>
                    </p>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date</label>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{new Date(selectedPayment.date).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedPayment.employeeId && (
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Employee ID</label>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.employeeId}</p>
                  </div>
                )}
                
                {selectedPayment.maintenanceId && (
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Maintenance ID</label>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.maintenanceId}</p>
                  </div>
                )}
                
                {selectedPayment.bookingId && (
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Booking ID</label>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.bookingId}</p>
                  </div>
                )}
                
                {selectedPayment.apartmentId && (
                  <div>
                    <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Apartment ID</label>
                    <p className={`mt-1 text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{selectedPayment.apartmentId}</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className={`px-4 py-2 border rounded-lg ${
                    darkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Close
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Generate Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT SUCCESS PAGE */}
      {showNewPaymentModal && paymentStep === 'success' && generatedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-8">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-green-600 mb-2">Payment Successful!</h1>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your payment has been processed successfully</p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 inline-block">
                  <p className="text-green-800 font-medium">
                    Transaction ID: {generatedInvoice.paymentDetails.transactionId}
                  </p>
                </div>
              </div>

              {/* Invoice Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Invoice Number:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{generatedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Payment Type:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{generatedInvoice.type === 'salary' ? 'Salary Payment' : generatedInvoice.type === 'maintenance' ? 'Maintenance Payment' : generatedInvoice.type === 'rent' ? 'Rent Payment' : 'Booking Payment'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Amount:</span>
                      <span className="font-bold text-green-600">{formatCurrency(generatedInvoice.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Payment Method:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Stripe (Credit Card)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Date & Time:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{generatedInvoice.paymentDetails.timestamp}</span>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-6 ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                  <h3 className={`font-bold text-lg mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Details</h3>
                  <div className="space-y-3">
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Cardholder:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{generatedInvoice.paymentDetails.cardholderName}</span>
                    </div>
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Email:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{generatedInvoice.paymentDetails.email}</span>
                    </div>
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Description:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{generatedInvoice.description}</span>
                    </div>
                    <div>
                      <span className={`block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Status:</span>
                      <span className="font-medium text-green-600">Completed ✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={printInvoice}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Printer className="w-5 h-5 mr-2" />
                  Print Invoice
                </button>
                <button
                  onClick={downloadInvoice}
                  className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Receipt
                </button>
                <button
                  onClick={completePaymentProcess}
                  className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEW PAYMENT MODAL - Details Step */}
      {showNewPaymentModal && paymentStep === 'details' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-lg font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Create New Payment</h3>
                <button
                  onClick={() => {
                    setShowNewPaymentModal(false);
                    resetNewPaymentForm();
                  }}
                  className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreatePayment} className="space-y-4">
                {/* Payment Type */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Type *
                  </label>
                  <select
                    value={newPaymentType}
                    onChange={(e) => {
                      const type = e.target.value;
                      setNewPaymentType(type);
                      setNewPayment(prev => ({
                        ...prev,
                        type: type.replace('test_', ''),
                        employeeId: type.includes('salary') ? 'EMP001' : '',
                        maintenanceId: type.includes('maintenance') ? 'MNT001' : '',
                        bookingId: type.includes('booking') ? 'BK001' : '',
                        apartmentId: type.includes('rent') ? 'APT001' : '',
                        amount: type.includes('salary') ? '45000.00' : 
                               type.includes('maintenance') ? '12500.00' :
                               type.includes('rent') ? '35000.00' : '28000.00',
                        description: type.includes('salary') 
                          ? 'Monthly Salary Payment - Test Employee' 
                          : type.includes('maintenance') 
                          ? 'Maintenance Payment - Test Service'
                          : type.includes('rent')
                          ? 'Monthly Rent Payment - Test Tenant'
                          : 'Booking Payment - Test Customer'
                      }));
                    }}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    required
                  >
                    {newPaymentTypes.map(type => (
                      <option key={type.value} value={type.value} disabled={type.disabled}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employee ID for Salary */}
                {newPaymentType.includes('salary') && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      value={newPayment.employeeId}
                      onChange={(e) => setNewPayment(prev => ({...prev, employeeId: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                )}

                {/* Maintenance ID for Maintenance */}
                {newPaymentType.includes('maintenance') && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Maintenance Request ID *
                    </label>
                    <input
                      type="text"
                      value={newPayment.maintenanceId}
                      onChange={(e) => setNewPayment(prev => ({...prev, maintenanceId: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                )}

                {/* Booking ID for Booking */}
                {newPaymentType.includes('booking') && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Booking ID *
                    </label>
                    <input
                      type="text"
                      value={newPayment.bookingId}
                      onChange={(e) => setNewPayment(prev => ({...prev, bookingId: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                )}

                {/* Apartment ID for Rent */}
                {newPaymentType.includes('rent') && (
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Apartment ID *
                    </label>
                    <input
                      type="text"
                      value={newPayment.apartmentId}
                      onChange={(e) => setNewPayment(prev => ({...prev, apartmentId: e.target.value}))}
                      className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                )}

                {/* Amount */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Amount (LKR) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment(prev => ({...prev, amount: e.target.value}))}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newPayment.description}
                    onChange={(e) => setNewPayment(prev => ({...prev, description: e.target.value}))}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    rows="3"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Payment Method *
                  </label>
                  <select
                    value={newPayment.paymentMethod}
                    onChange={(e) => setNewPayment(prev => ({...prev, paymentMethod: e.target.value}))}
                    className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                    }`}
                    required
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Action Buttons */}
                <div className={`flex justify-end space-x-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewPaymentModal(false);
                      resetNewPaymentForm();
                    }}
                    className={`px-4 py-2 border rounded-lg ${
                      darkMode 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    {newPayment.paymentMethod === 'stripe' ? (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Continue to Payment
                      </>
                    ) : (
                      'Create Payment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* STRIPE PAYMENT FORM MODAL */}
      {showNewPaymentModal && paymentStep === 'stripe' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setPaymentStep('details')}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Details
                </button>
                <div className="flex items-center text-green-600">
                  <Shield className="w-5 h-5 mr-2" />
                  <span className="font-medium">Secure payment with encrypted transaction</span>
                </div>
                <button
                  onClick={() => {
                    setShowNewPaymentModal(false);
                    resetNewPaymentForm();
                  }}
                  className={`text-2xl ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Payment Summary */}
                <div className="lg:col-span-2">
                  <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Complete Your Payment</h2>
                  
                  <div className={`rounded-lg p-6 mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Payment Type:</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{newPayment.type === 'salary' ? 'Salary Payment' : newPayment.type === 'maintenance' ? 'Maintenance Payment' : newPayment.type === 'rent' ? 'Rent Payment' : 'Booking Payment'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Description:</span>
                        <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{newPayment.description}</span>
                      </div>
                      {newPayment.employeeId && (
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Employee ID:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{newPayment.employeeId}</span>
                        </div>
                      )}
                      {newPayment.maintenanceId && (
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Maintenance ID:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{newPayment.maintenanceId}</span>
                        </div>
                      )}
                      {newPayment.bookingId && (
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Booking ID:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{newPayment.bookingId}</span>
                        </div>
                      )}
                      {newPayment.apartmentId && (
                        <div className="flex justify-between">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Apartment ID:</span>
                          <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{newPayment.apartmentId}</span>
                        </div>
                      )}
                      <div className={`border-t pt-3 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex justify-between text-lg font-bold">
                          <span className={darkMode ? 'text-white' : 'text-gray-900'}>Total Amount:</span>
                          <span className={darkMode ? 'text-white' : 'text-gray-900'}>{formatCurrency(parseFloat(newPayment.amount))}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="mb-6">
                    <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Method</h3>
                    <div className={`border rounded-lg p-4 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CreditCard className="w-6 h-6 mr-3 text-blue-600" />
                          <div>
                            <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>Credit/Debit Card</div>
                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Secure card payment with Stripe</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Recommended</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Quick Payment</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Details Form */}
                  <form onSubmit={handleStripePaymentSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Cardholder Name *
                        </label>
                        <input
                          type="text"
                          value={stripeForm.cardholderName}
                          onChange={(e) => setStripeForm(prev => ({...prev, cardholderName: e.target.value}))}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={stripeForm.email}
                          onChange={(e) => setStripeForm(prev => ({...prev, email: e.target.value}))}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="john.doe@example.com"
                          required
                        />
                      </div>

                      <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                          Card Number *
                        </label>
                        <input
                          type="text"
                          value={stripeForm.cardNumber}
                          onChange={(e) => setStripeForm(prev => ({...prev, cardNumber: formatCardNumber(e.target.value)}))}
                          className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="4242 4242 4242 4242"
                          maxLength={19}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Expiry Date *
                          </label>
                          <input
                            type="text"
                            value={stripeForm.expiryDate}
                            onChange={(e) => setStripeForm(prev => ({...prev, expiryDate: formatExpiryDate(e.target.value)}))}
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                            }`}
                            placeholder="MM/YY"
                            maxLength={5}
                            required
                          />
                        </div>
                        <div>
                          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            CVC *
                          </label>
                          <input
                            type="text"
                            value={stripeForm.cvc}
                            onChange={(e) => setStripeForm(prev => ({...prev, cvc: e.target.value.replace(/\D/g, '')}))}
                            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                            }`}
                            placeholder="123"
                            maxLength={4}
                            required
                          />
                        </div>
                      </div>

                      {/* Terms and Conditions */}
                      <div className="space-y-3">
                        <label className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={stripeForm.agreeToTerms}
                            onChange={(e) => setStripeForm(prev => ({...prev, agreeToTerms: e.target.checked}))}
                            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            required
                          />
                          <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            I agree to the Terms & Conditions and Privacy Policy. I understand that payments are processed securely through Stripe and my payment details are encrypted.
                          </span>
                        </label>
                        
                        <div className="flex items-center text-sm text-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          <span>This is a secure 256-bit SSL encrypted payment. Your financial information is never stored on our servers.</span>
                        </div>
                      </div>

                      {/* Test Data Auto-fill */}
                      {newPaymentType.includes('test_') && (
                        <button
                          type="button"
                          onClick={autoFillStripeTestData}
                          className="w-full bg-yellow-100 border border-yellow-300 text-yellow-800 py-2 rounded-lg text-sm font-medium hover:bg-yellow-200"
                        >
                          🧪 Auto-fill Test Card Data
                        </button>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={processingPayment}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {processingPayment ? (
                          <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Processing Payment...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5 mr-2" />
                            Pay {formatCurrency(parseFloat(newPayment.amount))}
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column - Security & Info */}
                <div className="lg:col-span-1">
                  <div className={`rounded-lg p-6 sticky top-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <h3 className={`font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Price Breakdown</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Base Amount:</span>
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>{formatCurrency(parseFloat(newPayment.amount))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Taxes & Fees:</span>
                        <span className={darkMode ? 'text-white' : 'text-gray-900'}>LKR 0.00</span>
                      </div>
                      <div className={`border-t pt-2 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex justify-between font-bold text-lg">
                          <span className={darkMode ? 'text-white' : 'text-gray-900'}>Total Amount:</span>
                          <span className={darkMode ? 'text-white' : 'text-gray-900'}>{formatCurrency(parseFloat(newPayment.amount))}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`border-t pt-4 ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                      <h4 className={`font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Payment Security</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-green-600" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>256-bit SSL Encryption</span>
                        </div>
                        <div className="flex items-center">
                          <Check className="w-4 h-4 mr-2 text-green-600" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>PCI DSS Compliant</span>
                        </div>
                        <div className="flex items-center">
                          <Lock className="w-4 h-4 mr-2 text-green-600" />
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Secure Stripe Gateway</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;