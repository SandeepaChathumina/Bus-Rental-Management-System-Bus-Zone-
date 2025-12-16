import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Bus,
  CreditCard,
  Calendar,
  Star,
  DollarSign,
  Activity,
  RefreshCw,
  Download,
  Filter,
  Eye
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  
  // Analytics data state
  const [analyticsData, setAnalyticsData] = useState({
    bookings: {
      total: 0,
      confirmed: 0,
      pending: 0,
      cancelled: 0,
      revenue: 0,
      monthlyTrend: []
    },
    buses: {
      total: 0,
      available: 0,
      inService: 0,
      maintenance: 0,
      fleetValue: 0
    },
    users: {
      total: 0,
      newThisMonth: 0
    },
    maintenance: {
      totalSpent: 0,
      activeRequests: 0
    },
    feedback: {
      total: 0,
      averageRating: 0,
      positive: 0,
      negative: 0
    }
  });

  // Chart data for visualizations
  const [chartData, setChartData] = useState({
    revenueChart: [],
    bookingStatusChart: [],
    busStatusChart: [],
    monthlyBookings: []
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [dateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch all analytics data in parallel
      const [
        bookingStats,
        busStats,
        userStats,
        maintenanceStats,
        feedbackStats
      ] = await Promise.all([
        fetchBookingStats(token),
        fetchBusStats(token),
        fetchUserStats(token),
        fetchMaintenanceStats(token),
        fetchFeedbackStats(token)
      ]);

      setAnalyticsData({
        bookings: bookingStats,
        buses: busStats,
        users: userStats,
        maintenance: maintenanceStats,
        feedback: feedbackStats
      });

      // Prepare chart data
      prepareChartData(bookingStats, busStats);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingStats = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/bookings/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        return {
          total: response.data.stats.totalBookings || 0,
          confirmed: response.data.stats.confirmedBookings || 0,
          pending: response.data.stats.pendingBookings || 0,
          cancelled: response.data.stats.cancelledBookings || 0,
          revenue: response.data.stats.totalRevenue || 0,
          monthlyTrend: response.data.stats.monthlyTrend || []
        };
      }
    } catch (error) {
      console.error('Error fetching booking stats:', error);
    }
    return { total: 0, confirmed: 0, pending: 0, cancelled: 0, revenue: 0, monthlyTrend: [] };
  };

  const fetchBusStats = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/buses/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        total: response.data.totalBuses || 0,
        available: response.data.availableBuses || 0,
        inService: response.data.inServiceBuses || 0,
        maintenance: response.data.maintenanceBuses || 0,
        fleetValue: response.data.totalFleetValue || 0
      };
    } catch (error) {
      console.error('Error fetching bus stats:', error);
      return { total: 0, available: 0, inService: 0, maintenance: 0, fleetValue: 0 };
    }
  };

  const fetchUserStats = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const users = response.data || [];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const newThisMonth = users.filter(user => {
        const userDate = new Date(user.createdAt);
        return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
      }).length;

      return {
        total: users.length,
        newThisMonth
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { total: 0, newThisMonth: 0 };
    }
  };

  const fetchMaintenanceStats = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/maintenance/cost-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return {
        totalSpent: response.data.overall?.totalSpent || 0,
        activeRequests: response.data.overall?.activeRequests || 0
      };
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
      return { totalSpent: 0, activeRequests: 0 };
    }
  };

  const fetchFeedbackStats = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/feedbacks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const feedbacks = response.data || [];
      const ratings = feedbacks.filter(f => f.rating).map(f => f.rating);
      const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      
      return {
        total: feedbacks.length,
        averageRating: Math.round(averageRating * 10) / 10,
        positive: feedbacks.filter(f => f.rating >= 4).length,
        negative: feedbacks.filter(f => f.rating < 3).length
      };
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      return { total: 0, averageRating: 0, positive: 0, negative: 0 };
    }
  };

  const prepareChartData = (bookingStats, busStats) => {
    // Revenue chart data (last 6 months)
    const revenueChart = bookingStats.monthlyTrend.slice(-6).map(item => ({
      month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
      revenue: item.revenue,
      bookings: item.bookings
    }));

    // Booking status pie chart data
    const bookingStatusChart = [
      { name: 'Confirmed', value: bookingStats.confirmed, color: '#10B981' },
      { name: 'Pending', value: bookingStats.pending, color: '#F59E0B' },
      { name: 'Cancelled', value: bookingStats.cancelled, color: '#EF4444' }
    ];

    // Bus status pie chart data
    const busStatusChart = [
      { name: 'Available', value: busStats.available, color: '#10B981' },
      { name: 'In Service', value: busStats.inService, color: '#3B82F6' },
      { name: 'Maintenance', value: busStats.maintenance, color: '#F59E0B' }
    ];

    setChartData({
      revenueChart,
      bookingStatusChart,
      busStatusChart,
      monthlyBookings: revenueChart
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
    toast.success('Analytics data refreshed');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Custom chart components
  const BarChart = ({ data, title, color = '#3B82F6' }) => {
    const maxValue = Math.max(...data.map(item => item.revenue || item.bookings));
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = ((item.revenue || item.bookings) / maxValue) * 100;
            return (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-16 text-sm text-gray-600">{item.month}</div>
                <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                  <div
                    className="bg-blue-500 h-6 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                    {formatNumber(item.revenue || item.bookings)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const PieChart = ({ data, title, size = 200 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center">
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90">
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const startAngle = cumulativePercentage * 3.6;
                const endAngle = (cumulativePercentage + percentage) * 3.6;
                cumulativePercentage += percentage;

                const radius = size / 2 - 10;
                const x1 = size / 2 + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = size / 2 + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = size / 2 + radius * Math.cos((endAngle * Math.PI) / 180);
                const y2 = size / 2 + radius * Math.sin((endAngle * Math.PI) / 180);
                const largeArcFlag = percentage > 50 ? 1 : 0;

                const pathData = [
                  `M ${size / 2} ${size / 2}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z'
                ].join(' ');

                return (
                  <path
                    key={index}
                    d={pathData}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {item.value} ({((item.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = 'blue', isCurrency = false }) => {
    const formatValue = isCurrency ? formatCurrency : formatNumber;
    
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatValue(value)}
            </p>
            {trend && (
              <div className={`flex items-center mt-2 text-sm ${
                trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {trend > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : 
                 trend < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                {Math.abs(trend)}%
              </div>
            )}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into your bus rental business</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-blue-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={analyticsData.bookings.revenue}
          icon={DollarSign}
          color="green"
          isCurrency={true}
        />
        <MetricCard
          title="Total Bookings"
          value={analyticsData.bookings.total}
          icon={Calendar}
          color="blue"
        />
        <MetricCard
          title="Active Users"
          value={analyticsData.users.total}
          icon={Users}
          color="purple"
        />
        <MetricCard
          title="Fleet Value"
          value={analyticsData.buses.fleetValue}
          icon={Bus}
          color="indigo"
          isCurrency={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BarChart
          data={chartData.revenueChart}
          title="Monthly Revenue Trend"
        />
        <PieChart
          data={chartData.bookingStatusChart}
          title="Booking Status Distribution"
        />
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PieChart
          data={chartData.busStatusChart}
          title="Bus Status Distribution"
        />
        <BarChart
          data={chartData.monthlyBookings}
          title="Monthly Bookings"
        />
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Confirmed</span>
              <span className="font-medium">{analyticsData.bookings.confirmed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Pending</span>
              <span className="font-medium">{analyticsData.bookings.pending}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-medium">{analyticsData.bookings.cancelled}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-3">
              <span className="text-gray-600 font-medium">Total</span>
              <span className="font-bold text-lg">{analyticsData.bookings.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fleet Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Available</span>
              <span className="font-medium text-green-600">{analyticsData.buses.available}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">In Service</span>
              <span className="font-medium text-blue-600">{analyticsData.buses.inService}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Maintenance</span>
              <span className="font-medium text-orange-600">{analyticsData.buses.maintenance}</span>
            </div>
            <div className="flex justify-between border-t border-blue-200 pt-3">
              <span className="text-gray-600 font-medium">Total Fleet</span>
              <span className="font-bold text-lg">{analyticsData.buses.total}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Feedback</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Reviews</span>
              <span className="font-medium">{analyticsData.feedback.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Average Rating</span>
              <span className="font-medium flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                {analyticsData.feedback.averageRating}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Positive (4+ stars)</span>
              <span className="font-medium text-green-600">{analyticsData.feedback.positive}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Negative (&lt;3 stars)</span>
              <span className="font-medium text-red-600">{analyticsData.feedback.negative}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(analyticsData.bookings.revenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(analyticsData.maintenance.totalSpent)}
            </div>
            <div className="text-sm text-gray-600">Maintenance Costs</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {formatCurrency(analyticsData.bookings.revenue - analyticsData.maintenance.totalSpent)}
            </div>
            <div className="text-sm text-gray-600">Net Profit</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
