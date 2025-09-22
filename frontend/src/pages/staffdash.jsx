import React, { useState, useEffect } from 'react';

const BusZoneDashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulate fetching notifications
    const mockNotifications = [
      { id: 1, message: 'Bus #BZ-102 requires maintenance', time: '10 mins ago', read: false, priority: 'high' },
      { id: 2, message: 'New booking confirmed for Friday', time: '1 hour ago', read: false, priority: 'medium' },
      { id: 3, message: 'Payment received from customer #2894', time: '2 hours ago', read: true, priority: 'low' },
      { id: 4, message: 'Driver assignment needed for trip #4821', time: '5 hours ago', read: true, priority: 'high' },
    ];

    // Simulate fetching maintenance data
    const mockMaintenanceData = [
      { id: 1, busId: 'BZ-101', type: 'Routine Service', status: 'Completed', date: '2023-06-15', dueIn: '0 days' },
      { id: 2, busId: 'BZ-102', type: 'Engine Repair', status: 'In Progress', date: '2023-06-18', dueIn: '2 days' },
      { id: 3, busId: 'BZ-105', type: 'Tire Replacement', status: 'Scheduled', date: '2023-06-20', dueIn: '5 days' },
      { id: 4, busId: 'BZ-108', type: 'Brake Inspection', status: 'Pending', date: '2023-06-22', dueIn: '7 days' },
    ];

    setNotifications(mockNotifications);
    setMaintenanceData(mockMaintenanceData);
  }, []);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    
    // Mark notifications as read when opening
    if (!showNotifications) {
      const updatedNotifications = notifications.map(notif => ({ ...notif, read: true }));
      setNotifications(updatedNotifications);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'status-badge status-completed';
      case 'In Progress': return 'status-badge status-in-progress';
      case 'Scheduled': return 'status-badge status-scheduled';
      case 'Pending': return 'status-badge status-pending';
      default: return 'status-badge';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '';
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">🚌</span>
            <h1>BusZone+</h1>
          </div>
          <nav className="main-nav">
            <a href="#" className="nav-link active">Dashboard</a>
            <a href="#" className="nav-link">Bookings</a>
            <a href="#" className="nav-link">Fleet</a>
            <a href="#" className="nav-link">Maintenance</a>
            <a href="#" className="nav-link">Reports</a>
          </nav>
        </div>
        
        <div className="header-controls">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <span className="search-icon">🔍</span>
          </div>
          
          <div className="notifications-wrapper">
            <button 
              className="notifications-btn"
              onClick={toggleNotifications}
            >
              <span className="bell-icon">🔔</span>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                  <span className="close-btn" onClick={() => setShowNotifications(false)}>×</span>
                </div>
                <div className="notifications-list">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`notification-item ${notif.read ? '' : 'unread'} ${notif.priority}`}
                      >
                        <div className="notification-priority">
                          {getPriorityIcon(notif.priority)}
                        </div>
                        <div className="notification-content">
                          <p>{notif.message}</p>
                          <span className="notification-time">{notif.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-notifications">No notifications</p>
                  )}
                </div>
                <div className="notifications-footer">
                  <a href="#">View all notifications</a>
                </div>
              </div>
            )}
          </div>
          
          <div className="user-profile">
            <div className="user-info">
              <span className="user-name">Staff User</span>
              <span className="user-role">Administrator</span>
            </div>
            <div className="avatar">SU</div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="dashboard-main">
        {/* Stats Overview */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon booking">📋</div>
            <div className="stat-content">
              <h3>Active Bookings</h3>
              <p className="stat-number">24</p>
              <span className="stat-trend up">+12% from last week</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon bus">🚌</div>
            <div className="stat-content">
              <h3>Available Buses</h3>
              <p className="stat-number">18</p>
              <span className="stat-trend down">-3% from last week</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon maintenance">🔧</div>
            <div className="stat-content">
              <h3>Maintenance Due</h3>
              <p className="stat-number">5</p>
              <span className="stat-trend">No change</span>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon revenue">💰</div>
            <div className="stat-content">
              <h3>Revenue This Month</h3>
              <p className="stat-number">$12,580</p>
              <span className="stat-trend up">+8% from last month</span>
            </div>
          </div>
        </div>

        {/* Maintenance Section */}
        <section className="maintenance-section">
          <div className="section-header">
            <h2>Maintenance Overview</h2>
            <button className="btn-primary">
              <span className="btn-icon">+</span>
              Schedule Maintenance
            </button>
          </div>
          
          <div className="table-container">
            <div className="table-header">
              <span>Bus ID</span>
              <span>Maintenance Type</span>
              <span>Status</span>
              <span>Scheduled Date</span>
              <span>Due In</span>
              <span>Action</span>
            </div>
            <div className="table-body">
              {maintenanceData.map(item => (
                <div key={item.id} className="table-row">
                  <span className="bus-id">{item.busId}</span>
                  <span>{item.type}</span>
                  <span>
                    <span className={getStatusClass(item.status)}>
                      {item.status}
                    </span>
                  </span>
                  <span>{item.date}</span>
                  <span className="due-date">{item.dueIn}</span>
                  <span>
                    <button className="btn-sm">View Details</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <style jsx>{`
        /* Global Styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #333;
          background-color: #f5f7f9;
        }
        
        /* Dashboard Container */
        .dashboard-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        /* Header Styles */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.8rem 2rem;
          background: linear-gradient(135deg, #0a1929 0%, #1a3a5f 100%);
          color: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        
        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .logo-icon {
          font-size: 1.8rem;
        }
        
        .logo h1 {
          font-weight: 700;
          font-size: 1.5rem;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .main-nav {
          display: flex;
          gap: 1.5rem;
        }
        
        .nav-link {
          color: rgba(255, 255, 255, 0.8);
          text-decoration: none;
          font-weight: 500;
          padding: 0.5rem 0;
          position: relative;
          transition: color 0.3s;
        }
        
        .nav-link:hover, .nav-link.active {
          color: white;
        }
        
        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 2px;
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
        }
        
        .header-controls {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .search-bar {
          position: relative;
        }
        
        .search-bar input {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border-radius: 20px;
          border: none;
          background: rgba(255, 255, 255, 0.1);
          color: white;
          outline: none;
          transition: background 0.3s;
        }
        
        .search-bar input:focus {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .search-bar input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
        
        .search-icon {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 0.9rem;
        }
        
        /* Notifications */
        .notifications-wrapper {
          position: relative;
        }
        
        .notifications-btn {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.5rem;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          transition: background 0.3s;
        }
        
        .notifications-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #e74c3c;
          color: white;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          font-size: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        .notifications-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 380px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.15);
          z-index: 1000;
          margin-top: 0.8rem;
          color: #333;
          overflow: hidden;
        }
        
        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.2rem;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }
        
        .notifications-header h3 {
          font-size: 1.1rem;
          color: #2c3e50;
        }
        
        .close-btn {
          cursor: pointer;
          font-size: 1.5rem;
          line-height: 1;
          color: #6c757d;
        }
        
        .notifications-list {
          max-height: 350px;
          overflow-y: auto;
        }
        
        .notification-item {
          display: flex;
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
          gap: 0.8rem;
        }
        
        .notification-item.unread {
          background: #f8f9fa;
        }
        
        .notification-item.high {
          border-left: 3px solid #e74c3c;
        }
        
        .notification-item.medium {
          border-left: 3px solid #f39c12;
        }
        
        .notification-item.low {
          border-left: 3px solid #3498db;
        }
        
        .notification-priority {
          font-size: 0.8rem;
          padding-top: 0.2rem;
        }
        
        .notification-content p {
          margin-bottom: 0.3rem;
          font-size: 0.95rem;
        }
        
        .notification-time {
          font-size: 0.8rem;
          color: #6c757d;
        }
        
        .no-notifications {
          padding: 1.5rem;
          text-align: center;
          color: #6c757d;
        }
        
        .notifications-footer {
          padding: 0.8rem;
          text-align: center;
          border-top: 1px solid #eee;
        }
        
        .notifications-footer a {
          color: #3498db;
          text-decoration: none;
          font-size: 0.9rem;
        }
        
        /* User Profile */
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }
        
        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }
        
        .user-name {
          font-weight: 600;
        }
        
        .user-role {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        
        /* Main Content */
        .dashboard-main {
          padding: 2rem;
          flex: 1;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
        }
        
        .stat-icon.booking {
          background: rgba(52, 152, 219, 0.1);
          color: #3498db;
        }
        
        .stat-icon.bus {
          background: rgba(46, 204, 113, 0.1);
          color: #2ecc71;
        }
        
        .stat-icon.maintenance {
          background: rgba(243, 156, 18, 0.1);
          color: #f39c12;
        }
        
        .stat-icon.revenue {
          background: rgba(155, 89, 182, 0.1);
          color: #9b59b6;
        }
        
        .stat-content h3 {
          font-size: 0.9rem;
          color: #6c757d;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }
        
        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2c3e50;
          margin-bottom: 0.3rem;
        }
        
        .stat-trend {
          font-size: 0.85rem;
          font-weight: 500;
        }
        
        .stat-trend.up {
          color: #27ae60;
        }
        
        .stat-trend.down {
          color: #e74c3c;
        }
        
        /* Maintenance Section */
        .maintenance-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #eee;
          background: linear-gradient(90deg, #0a1929 0%, #1a3a5f 100%);
          color: white;
        }
        
        .section-header h2 {
          font-size: 1.4rem;
          font-weight: 600;
        }
        
        .btn-primary {
          background: linear-gradient(90deg, #4facfe 0%, #00f2fe 100%);
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: opacity 0.3s;
        }
        
        .btn-primary:hover {
          opacity: 0.9;
        }
        
        .btn-icon {
          font-weight: bold;
        }
        
        /* Table Styles */
        .table-container {
          overflow-x: auto;
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr 1fr 0.8fr 1fr;
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.9rem;
        }
        
        .table-body {
          display: flex;
          flex-direction: column;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 1fr 1.5fr 1fr 1fr 0.8fr 1fr;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
          transition: background 0.2s;
        }
        
        .table-row:hover {
          background: #f8f9fa;
        }
        
        .bus-id {
          font-weight: 600;
          color: #2c3e50;
        }
        
        .due-date {
          font-weight: 500;
        }
        
        .status-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          display: inline-block;
        }
        
        .status-completed {
          background: #e8f5e9;
          color: #2e7d32;
        }
        
        .status-in-progress {
          background: #e3f2fd;
          color: #1565c0;
        }
        
        .status-scheduled {
          background: #fff3e0;
          color: #ef6c00;
        }
        
        .status-pending {
          background: #ffebee;
          color: #c62828;
        }
        
        .btn-sm {
          background: white;
          border: 1px solid #ddd;
          padding: 0.4rem 0.8rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.85rem;
          transition: background 0.2s;
        }
        
        .btn-sm:hover {
          background: #f8f9fa;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            padding: 1rem;
          }
          
          .header-left {
            width: 100%;
            justify-content: space-between;
          }
          
          .header-controls {
            width: 100%;
            justify-content: space-between;
          }
        }
        
        @media (max-width: 768px) {
          .main-nav {
            display: none;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }
          
          .table-header, .table-row {
            grid-template-columns: 1fr 1fr;
            gap: 0.5rem;
          }
          
          .notifications-dropdown {
            width: 300px;
            right: -50px;
          }
        }
      `}</style>
    </div>
  );
};

export default BusZoneDashboard;