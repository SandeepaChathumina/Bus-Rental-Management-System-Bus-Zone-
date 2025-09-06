import React, { useState, useEffect } from 'react';

// Mock data for initial state
const initialBuses = [
  {
    id: 1,
    busId: 'BUS001',
    busType: 'Luxury',
    engineNumber: 'ENG35554',
    numberPlate: '44545',
    capacity: 45,
    status: 'Available',
    vehiclePhoto: null,
    isActive: true
  },
  {
    id: 2,
    busId: 'BUS002',
    busType: 'Standard',
    engineNumber: 'ENG27891',
    numberPlate: '38902',
    capacity: 35,
    status: 'Maintenance',
    vehiclePhoto: null,
    isActive: true
  },
  {
    id: 3,
    busId: 'BUS003',
    busType: 'Mini',
    engineNumber: 'ENG11223',
    numberPlate: '55667',
    capacity: 20,
    status: 'Retired',
    vehiclePhoto: null,
    isActive: false
  }
];

const BusManagement = () => {
  const [buses, setBuses] = useState(initialBuses);
  const [filteredBuses, setFilteredBuses] = useState(initialBuses);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBus, setCurrentBus] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    busType: '',
    engineNumber: '',
    capacity: '',
    numberPlate: '',
    vehiclePhoto: null,
    status: 'Available'
  });

  // Filter buses based on search and status
  useEffect(() => {
    let result = buses;
    
    if (searchQuery) {
      result = result.filter(bus => 
        bus.busId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.numberPlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.engineNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bus.busType.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(bus => bus.status === statusFilter);
    }
    
    setFilteredBuses(result);
  }, [searchQuery, statusFilter, buses]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        vehiclePhoto: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      busType: '',
      engineNumber: '',
      capacity: '',
      numberPlate: '',
      vehiclePhoto: null,
      status: 'Available'
    });
    setImagePreview(null);
    setCurrentBus(null);
    setIsEditing(false);
  };

  const openCreateForm = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const openEditForm = (bus) => {
    setFormData({
      busType: bus.busType,
      engineNumber: bus.engineNumber,
      capacity: bus.capacity,
      numberPlate: bus.numberPlate,
      vehiclePhoto: null,
      status: bus.status
    });
    setImagePreview(bus.vehiclePhoto || null);
    setCurrentBus(bus);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setTimeout(resetForm, 300);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      // Update existing bus
      const updatedBuses = buses.map(bus => 
        bus.id === currentBus.id 
          ? { 
              ...bus, 
              ...formData,
              busId: currentBus.busId, // Keep original busId
              id: currentBus.id // Keep original id
            }
          : bus
      );
      
      setBuses(updatedBuses);
      alert('Bus updated successfully!');
    } else {
      // Create new bus
      const newBus = {
        id: Math.max(...buses.map(b => b.id), 0) + 1,
        busId: `BUS${String(Math.max(...buses.map(b => parseInt(b.busId.replace('BUS', '')), 0)) + 1).padStart(3, '0')}`,
        ...formData,
        isActive: true
      };
      
      setBuses([...buses, newBus]);
      alert('Bus created successfully!');
    }
    
    closeForm();
  };

  const handleDelete = (bus) => {
    if (window.confirm(`Are you sure you want to ${bus.isActive ? 'deactivate' : 'activate'} bus ${bus.busId}?`)) {
      // Toggle isActive status
      const updatedBuses = buses.map(b => 
        b.id === bus.id 
          ? { ...b, isActive: !b.isActive, status: !b.isActive ? 'Available' : 'Retired' }
          : b
      );
      
      setBuses(updatedBuses);
      alert(`Bus ${bus.isActive ? 'deactivated' : 'activated'} successfully!`);
    }
  };

  const StatusBadge = ({ status }) => {
    const colors = {
      Available: 'bg-green-100 text-green-800 border border-green-200',
      Maintenance: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'In Service': 'bg-blue-100 text-blue-800 border border-blue-200',
      Retired: 'bg-red-100 text-red-800 border border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
        {status}
      </span>
    );
  };

  const ActiveBadge = ({ isActive }) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive 
        ? 'bg-green-100 text-green-800 border border-green-200' 
        : 'bg-red-100 text-red-800 border border-red-200'
    }`}>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );

  const BusCard = ({ bus }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden bus-card">
      <div className="h-40 bg-gray-200 flex items-center justify-center">
        {bus.vehiclePhoto ? (
          <img src={bus.vehiclePhoto} alt={`Bus ${bus.busId}`} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
          </svg>
        )}
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-gray-800">{bus.busId}</h3>
            <p className="text-gray-600 capitalize">{bus.busType}</p>
          </div>
          <StatusBadge status={bus.status} />
        </div>
        <div className="space-y-2 mb-6">
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{bus.engineNumber}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 极速快3 10.07 21h7.86a2 2 0 001.664-.89l.812-1.22A2 2 0 0120.07 7H21a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span>Plate: {bus.numberPlate}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 极速快3 3 3 0 01-6 0 3 3 0 013-3 3 3 0 013 3zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 极速快3 2 0 014 0z" />
            </svg>
            <span>Capacity: {bus.capacity} seats</span>
          </div>
          <div className="flex items-center text-gray-600">
            <ActiveBadge isActive={bus.isActive} />
          </div>
        </div>
        <div className="flex justify-between">
          <button 
            onClick={() => openEditForm(bus)}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button 
            onClick={() => handleDelete(bus)}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {bus.isActive ? 'Deactivate' : 'Activate'}
          </button>
        </div>
      </div>
    </div>
  );

  const BusForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEditing ? `Edit Bus ${currentBus.busId}` : 'Add New Bus'}
          </h3>
          <button 
            onClick={closeForm}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bus Type *</label>
              <select
                name="busType"
                value={formData.busType}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Type</option>
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Luxury">Luxury</option>
                <option value="Mini">Mini</option>
                <option value="Double Decker">Double Decker</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Engine Number *</label>
              <input
                type="text"
                name="engineNumber"
                value={formData.engineNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., ENG35554"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                min="10"
                max="100"
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="Number of seats"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number Plate *</label>
              <input
                type="text"
                name="numberPlate"
                value={formData.numberPlate}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4 py-2 uppercase focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., 44545"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border border-gray-300 text-gray-900 rounded-lg px-4极速快3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="Available">Available</option>
                <option value="Maintenance">Maintenance</option>
                <option value="In Service">In Service</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Photo</label>
              <div className="flex items-center space-x-4">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {isEditing ? 'Update Bus' : 'Add Bus'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Management System</h1>
          <p className="text-gray-600">Manage your fleet of buses with this comprehensive CRUD interface</p>
        </header>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">{buses.length}</div>
            <div className="text-gray-600">Total Buses</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-green-600">{buses.filter(b => b.status === 'Available').length}</div>
            <div className="text-gray-600">Available</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-yellow-600">{buses.filter(b => b.status === 'Maintenance').length}</div>
            <div className="text-gray-600">Maintenance</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-2xl font-bold text-red-600">{buses.filter(b => b.status === 'Retired').length}</div>
            <div className="text-gray-600">Retired</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full md:w-1/2 mb-4 md:mb-0">
            <div className="relative">
              <svg className="absolute left-3 top-3 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search buses..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={statusFilter}
              onChange={handleStatusFilterChange}
            >
              <option value="all">All Status</option>
              <option value="Available">Available</option>
              <option value="Maintenance">Maintenance</option>
              <option value="In Service">In Service</option>
              <option value="Retired">Retired</option>
            </select>
            <button 
              onClick={openCreateForm}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Bus
            </button>
          </div>
        </div>

        {/* Bus List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map(bus => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>

        {filteredBuses.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No buses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </div>

      {isFormOpen && <BusForm />}
    </div>
  );
};

export default BusManagement;