import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Filter,
  Download,
  Save,
  X,
  Bus,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const BusManagement = () => {
  const [buses, setBuses] = useState([]);
  const [filteredBuses, setFilteredBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    busType: 'Standard',
    engineNumber: '',
    capacity: '',
    numberPlate: '',
    vehiclePhoto: '',
    status: 'Available'
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  useEffect(() => {
    filterBuses();
  }, [buses, searchTerm, filterStatus]);

  const fetchBuses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/buses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBuses(response.data.buses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch buses', error);
      toast.error('Failed to fetch buses');
      setLoading(false);
    }
  };

  const filterBuses = () => {
    let filtered = buses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(bus =>
        bus.numberPlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.engineNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bus.busType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(bus => bus.status === filterStatus);
    }

    setFilteredBuses(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingBus) {
        // Update existing bus
        await axios.put(`${BACKEND_URL}/api/buses/${editingBus._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Bus updated successfully');
      } else {
        // Create new bus
        await axios.post(`${BACKEND_URL}/api/buses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Bus created successfully');
      }
      
      setShowModal(false);
      setEditingBus(null);
      setFormData({
        busType: 'Standard',
        engineNumber: '',
        capacity: '',
        numberPlate: '',
        vehiclePhoto: '',
        status: 'Available'
      });
      fetchBuses();
    } catch (error) {
      console.error('Failed to save bus', error);
      toast.error(error.response?.data?.message || 'Failed to save bus');
    }
  };

  const handleEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busType: bus.busType,
      engineNumber: bus.engineNumber,
      capacity: bus.capacity,
      numberPlate: bus.numberPlate,
      vehiclePhoto: bus.vehiclePhoto || '',
      status: bus.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/buses/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Bus deleted successfully');
      fetchBuses();
    } catch (error) {
      console.error('Failed to delete bus', error);
      toast.error('Failed to delete bus');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'In Service':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'Maintenance':
        return <Wrench className="w-4 h-4 text-orange-400" />;
      case 'Retired':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-900/30 text-green-400';
      case 'In Service':
        return 'bg-blue-900/30 text-blue-400';
      case 'Maintenance':
        return 'bg-orange-900/30 text-orange-400';
      case 'Retired':
        return 'bg-red-900/30 text-red-400';
      default:
        return 'bg-gray-900/30 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">Loading buses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-white">Bus Management</h2>
          <p className="text-slate-400">Manage your fleet of buses</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Bus
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search buses by plate, engine number, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="text-slate-400 w-5 h-5" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="Available">Available</option>
            <option value="In Service">In Service</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        <button className="flex items-center px-4 py-2 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-700">
          <Download className="w-5 h-5 mr-2" />
          Export
        </button>
      </div>

      {/* Bus List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Bus ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Number Plate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Engine Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredBuses.map((bus) => (
                <tr key={bus._id} className="hover:bg-slate-750">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{bus.busId || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{bus.numberPlate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{bus.busType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{bus.engineNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">{bus.capacity} seats</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                      {getStatusIcon(bus.status)}
                      <span className="ml-1.5">{bus.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(bus)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bus._id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredBuses.length === 0 && (
          <div className="text-center py-12">
            <Bus className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-400">No buses found</h3>
            <p className="text-slate-500 mt-1">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Get started by adding your first bus'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add/Edit Bus Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay with lower z-index */}
          <div className="fixed inset-0 bg-slate-900 opacity-75 z-40" onClick={() => setShowModal(false)}></div>
          {/* Modal with higher z-index */}
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0 z-50 relative">
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-slate-800 shadow-xl rounded-2xl border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">
                  {editingBus ? 'Edit Bus' : 'Add New Bus'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingBus(null);
                    setFormData({
                      busType: 'Standard',
                      engineNumber: '',
                      capacity: '',
                      numberPlate: '',
                      vehiclePhoto: '',
                      status: 'Available'
                    });
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bus Type</label>
                  <select
                    name="busType"
                    value={formData.busType}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Standard">Standard</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Mini">Mini</option>
                    <option value="Double Decker">Double Decker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Engine Number</label>
                  <input
                    type="text"
                    name="engineNumber"
                    value={formData.engineNumber}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter engine number"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    min="10"
                    max="100"
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter seating capacity"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Number Plate</label>
                  <input
                    type="text"
                    name="numberPlate"
                    value={formData.numberPlate}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                    placeholder="Enter number plate"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="Available">Available</option>
                    <option value="In Service">In Service</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Retired">Retired</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Vehicle Photo URL (Optional)</label>
                  <input
                    type="url"
                    name="vehiclePhoto"
                    value={formData.vehiclePhoto}
                    onChange={handleInputChange}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter image URL"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingBus(null);
                      setFormData({
                        busType: 'Standard',
                        engineNumber: '',
                        capacity: '',
                        numberPlate: '',
                        vehiclePhoto: '',
                        status: 'Available'
                      });
                    }}
                    className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    {editingBus ? <Save className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    {editingBus ? 'Update Bus' : 'Add Bus'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusManagement;