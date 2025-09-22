import React, { useState, useEffect } from 'react';

const MaintenanceManagement = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [stats, setStats] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState(null);
  const [filter, setFilter] = useState({ status: '', priority: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    busNumberPlate: '',
    description: '',
    priority: 'Medium',
    estimatedCost: '',
    estimatedCompletionDate: ''
  });

  // API base URL - update this to match your backend
  const API_BASE_URL = 'http://localhost:5000/api';

  // API helper function
  const apiRequest = async (url, options = {}) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setError(err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMaintenances();
    fetchStats();
  }, [currentPage, filter]);

  const fetchMaintenances = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(filter.status && { status: filter.status }),
        ...(filter.priority && { priority: filter.priority }),
      });

      const data = await apiRequest(`/maintenance?${params}`);
      setMaintenances(data.maintenances);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching maintenances:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await apiRequest('/maintenance/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateMaintenance = async (e) => {
    e.preventDefault();
    try {
      await apiRequest('/maintenance', {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setShowCreateForm(false);
      setFormData({
        userId: '',
        busNumberPlate: '',
        description: '',
        priority: 'Medium',
        estimatedCost: '',
        estimatedCompletionDate: ''
      });
      fetchMaintenances();
      fetchStats();
    } catch (error) {
      console.error('Error creating maintenance:', error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await apiRequest(`/maintenance/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchMaintenances();
      if (selectedMaintenance && selectedMaintenance._id === id) {
        setSelectedMaintenance({ ...selectedMaintenance, status });
      }
    } catch (error) {
      console.error('Error updating maintenance:', error);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#d4edda', color: '#155724', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'In Progress':
        return { backgroundColor: '#d1ecf1', color: '#0c5460', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'Pending':
        return { backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      case 'Cancelled':
        return { backgroundColor: '#f8d7da', color: '#721c24', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
      default:
        return { padding: '4px 8px', borderRadius: '12px', fontSize: '12px' };
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'Critical':
        return { color: '#dc3545', fontWeight: 'bold' };
      case 'High':
        return { color: '#fd7e14', fontWeight: 'bold' };
      case 'Medium':
        return { color: '#ffc107', fontWeight: 'bold' };
      case 'Low':
        return { color: '#28a745', fontWeight: 'bold' };
      default:
        return {};
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter(prev => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const viewDetails = (maintenance) => {
    setSelectedMaintenance(maintenance);
    setShowDetails(true);
  };

  // Styles
  const styles = {
    container: {
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
    },
    header: {
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    section: {
      backgroundColor: 'white',
      borderRadius: '10px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px',
      marginBottom: '20px',
    },
    statCard: {
      backgroundColor: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      textAlign: 'center',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    statNumber: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#2c3e50',
      margin: '10px 0',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '15px',
    },
    tableHeader: {
      backgroundColor: '#2c3e50',
      color: 'white',
    },
    tableHeaderCell: {
      padding: '15px',
      textAlign: 'left',
      fontWeight: '600',
    },
    tableRow: {
      borderBottom: '1px solid #e0e0e0',
      transition: 'background-color 0.2s',
    },
    tableRowHover: {
      backgroundColor: '#f8f9fa',
    },
    tableCell: {
      padding: '15px',
    },
    btnPrimary: {
      backgroundColor: '#2c3e50',
      color: 'white',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'background-color 0.2s',
    },
    btnPrimaryHover: {
      backgroundColor: '#1a252f',
    },
    btnSecondary: {
      backgroundColor: '#6c757d',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '8px',
      transition: 'background-color 0.2s',
    },
    btnSuccess: {
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      padding: '8px 12px',
      borderRadius: '4px',
      cursor: 'pointer',
      marginRight: '8px',
      transition: 'background-color 0.2s',
    },
    formGroup: {
      marginBottom: '20px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '600',
      color: '#2c3e50',
    },
    input: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #ced4da',
      fontSize: '16px',
      transition: 'border-color 0.2s',
    },
    inputFocus: {
      borderColor: '#2c3e50',
      outline: 'none',
    },
    select: {
      width: '100%',
      padding: '12px',
      borderRadius: '6px',
      border: '1px solid #ced4da',
      fontSize: '16px',
      backgroundColor: 'white',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '10px',
      width: '90%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflowY: 'auto',
      boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    },
    filterBar: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      flexWrap: 'wrap',
    },
    pagination: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: '30px',
      gap: '10px',
    },
    pageButton: {
      padding: '8px 15px',
      border: '1px solid #2c3e50',
      borderRadius: '6px',
      backgroundColor: 'transparent',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    activePage: {
      padding: '8px 15px',
      border: '1px solid #2c3e50',
      borderRadius: '6px',
      backgroundColor: '#2c3e50',
      color: 'white',
      cursor: 'pointer',
    },
    error: {
      color: '#721c24',
      padding: '12px',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
      borderRadius: '6px',
      marginBottom: '20px',
    },
    loading: {
      textAlign: 'center',
      padding: '30px',
      color: '#6c757d',
    },
    actionButtons: {
      display: 'flex',
      gap: '10px',
      justifyContent: 'flex-end',
      marginTop: '20px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ margin: 0 }}>BusZone+ Maintenance Management</h1>
        <button 
          style={styles.btnPrimary}
          onMouseOver={(e) => e.target.style.backgroundColor = styles.btnPrimaryHover.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = styles.btnPrimary.backgroundColor}
          onClick={() => setShowCreateForm(true)}
        >
          Create Maintenance Request
        </button>
      </div>

      {error && (
        <div style={styles.error}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {loading && (
        <div style={styles.loading}>
          <p>Loading maintenance data...</p>
        </div>
      )}

      {/* Stats Overview */}
      <div style={styles.section}>
        <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Maintenance Overview</h2>
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <h3>Total Requests</h3>
            <p style={styles.statNumber}>{stats.total || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Pending</h3>
            <p style={styles.statNumber}>{stats.summary?.pending || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>In Progress</h3>
            <p style={styles.statNumber}>{stats.summary?.inProgress || 0}</p>
          </div>
          <div style={styles.statCard}>
            <h3>Completed</h3>
            <p style={styles.statNumber}>{stats.summary?.completed || 0}</p>
          </div>
        </div>
      </div>

      {/* Maintenance List */}
      <div style={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>Maintenance Requests</h2>
          <div style={styles.filterBar}>
            <select 
              name="status" 
              value={filter.status} 
              onChange={handleFilterChange}
              style={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <select 
              name="priority" 
              value={filter.priority} 
              onChange={handleFilterChange}
              style={styles.select}
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <table style={styles.table}>
          <thead style={styles.tableHeader}>
            <tr>
              <th style={styles.tableHeaderCell}>ID</th>
              <th style={styles.tableHeaderCell}>Bus Plate</th>
              <th style={styles.tableHeaderCell}>Description</th>
              <th style={styles.tableHeaderCell}>Priority</th>
              <th style={styles.tableHeaderCell}>Status</th>
              <th style={styles.tableHeaderCell}>Est. Cost</th>
              <th style={styles.tableHeaderCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {maintenances.map((maintenance) => (
              <tr 
                key={maintenance._id} 
                style={styles.tableRow}
                onMouseOver={(e) => e.target.parentNode.style.backgroundColor = styles.tableRowHover.backgroundColor}
                onMouseOut={(e) => e.target.parentNode.style.backgroundColor = 'transparent'}
              >
                <td style={styles.tableCell}>{maintenance.maintenanceId}</td>
                <td style={styles.tableCell}>
                  {maintenance.bus?.numberPlate}
                </td>
                <td style={styles.tableCell}>{maintenance.description}</td>
                <td style={{...styles.tableCell, ...getPriorityStyle(maintenance.priority)}}>
                  {maintenance.priority}
                </td>
                <td style={styles.tableCell}>
                  <span style={getStatusStyle(maintenance.status)}>
                    {maintenance.status}
                  </span>
                </td>
                <td style={styles.tableCell}>${maintenance.estimatedCost}</td>
                <td style={styles.tableCell}>
                  <button 
                    style={styles.btnSecondary}
                    onClick={() => viewDetails(maintenance)}
                  >
                    View
                  </button>
                  {maintenance.status !== 'Completed' && maintenance.status !== 'Cancelled' && (
                    <button 
                      style={styles.btnSuccess}
                      onClick={() => handleUpdateStatus(maintenance._id, 'Completed')}
                    >
                      Complete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {maintenances.length === 0 && !loading && (
          <p style={{ textAlign: 'center', padding: '30px', color: '#6c757d' }}>
            No maintenance requests found.
          </p>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={styles.pagination}>
            <button 
              style={styles.pageButton}
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                style={page === currentPage ? styles.activePage : styles.pageButton}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              style={styles.pageButton}
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Create Maintenance Modal */}
      {showCreateForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Create Maintenance Request</h2>
            <form onSubmit={handleCreateMaintenance}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Staff ID</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  placeholder="Enter Staff ID"
                  required
                  onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
                  onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Bus Number Plate</label>
                <input
                  type="text"
                  style={styles.input}
                  value={formData.busNumberPlate}
                  onChange={(e) => setFormData({ ...formData, busNumberPlate: e.target.value })}
                  placeholder="Enter Bus Number Plate"
                  required
                  onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
                  onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  style={{...styles.input, minHeight: '100px'}}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
                  onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <select 
                  style={styles.select}
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Cost ($)</label>
                <input
                  type="number"
                  style={styles.input}
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  min="0"
                  step="0.01"
                  required
                  onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
                  onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Completion Date</label>
                <input
                  type="date"
                  style={styles.input}
                  value={formData.estimatedCompletionDate}
                  onChange={(e) => setFormData({ ...formData, estimatedCompletionDate: e.target.value })}
                  onFocus={(e) => e.target.style.borderColor = styles.inputFocus.borderColor}
                  onBlur={(e) => e.target.style.borderColor = styles.input.borderColor}
                />
              </div>

              <div style={styles.actionButtons}>
                <button 
                  type="button" 
                  style={styles.btnSecondary}
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" style={styles.btnPrimary}>
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Maintenance Details Modal */}
      {showDetails && selectedMaintenance && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h2 style={{ color: '#2c3e50', marginTop: 0 }}>Maintenance Request Details</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Maintenance ID</label>
                <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  {selectedMaintenance.maintenanceId}
                </p>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <p style={{ margin: 0 }}>
                  <span style={getStatusStyle(selectedMaintenance.status)}>
                    {selectedMaintenance.status}
                  </span>
                </p>
              </div>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Bus Number Plate</label>
              <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                {selectedMaintenance.bus?.numberPlate}
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Staff ID</label>
              <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                {selectedMaintenance.user?._id}
              </p>
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Description</label>
              <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', minHeight: '60px' }}>
                {selectedMaintenance.description}
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Priority</label>
                <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px', ...getPriorityStyle(selectedMaintenance.priority) }}>
                  {selectedMaintenance.priority}
                </p>
              </div>
              
              <div style={styles.formGroup}>
                <label style={styles.label}>Estimated Cost</label>
                <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  ${selectedMaintenance.estimatedCost}
                </p>
              </div>
            </div>
            
            {selectedMaintenance.actualCost > 0 && (
              <div style={styles.formGroup}>
                <label style={styles.label}>Actual Cost</label>
                <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                  ${selectedMaintenance.actualCost}
                </p>
              </div>
            )}
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {selectedMaintenance.estimatedCompletionDate && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Estimated Completion</label>
                  <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    {new Date(selectedMaintenance.estimatedCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {selectedMaintenance.actualCompletionDate && (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Actual Completion</label>
                  <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    {new Date(selectedMaintenance.actualCompletionDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
            
            <div style={styles.formGroup}>
              <label style={styles.label}>Created At</label>
              <p style={{ margin: 0, padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                {new Date(selectedMaintenance.createdAt).toLocaleDateString()}
              </p>
            </div>

            <div style={styles.actionButtons}>
              <button 
                style={styles.btnSecondary}
                onClick={() => setShowDetails(false)}
              >
                Close
              </button>
              
              {selectedMaintenance.status !== 'Completed' && selectedMaintenance.status !== 'Cancelled' && (
                <button 
                  style={styles.btnSuccess}
                  onClick={() => {
                    handleUpdateStatus(selectedMaintenance._id, 'Completed');
                    setShowDetails(false);
                  }}
                >
                  Mark as Completed
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceManagement;