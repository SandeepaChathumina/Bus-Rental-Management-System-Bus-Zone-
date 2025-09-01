import Maintenance from '../models/maintenance.js';
import User from '../models/user.js';
import Bus from '../models/bus.js';
import StaffProfile from '../models/staffProfile.js';

// Create new maintenance request (simplified)
export const createMaintenance = async (req, res) => {
  try {
    const { 
      userId, 
      busId, 
      description, 
      priority, 
      estimatedCost,
      estimatedCompletionDate
    } = req.body;

    // Check if all required fields are provided
    if (!userId || !busId || !description || estimatedCost === undefined) {
      return res.status(400).json({
        message: 'Please provide all required fields: userId, busId, description, estimatedCost'
      });
    }

    // Check if user exists and is a staff member
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        message: 'User not found. Please provide a valid user ID.' 
      });
    }

    // Check if user has staff role
    if (user.role !== 'staff') {
      return res.status(400).json({ 
        message: 'Only staff members can create maintenance requests.' 
      });
    }

    // Check if staff profile exists for this user
    const staffProfile = await StaffProfile.findOne({ user: userId });
    if (!staffProfile) {
      return res.status(400).json({ 
        message: 'Staff profile not found for this user.' 
      });
    }

    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ 
        message: 'Bus not found. Please provide a valid bus ID.' 
      });
    }

    // Check if bus is active
    if (!bus.isActive || bus.status === 'Retired') {
      return res.status(400).json({ 
        message: 'Cannot create maintenance request for inactive or retired bus.' 
      });
    }

    const maintenance = new Maintenance({
      user: userId,
      bus: busId,
      description,
      priority: priority || 'Medium',
      estimatedCost,
      estimatedCompletionDate: estimatedCompletionDate || null
    });

    const savedMaintenance = await maintenance.save();
    
    // Populate user and bus details
    const populatedMaintenance = await Maintenance.findById(savedMaintenance._id)
      .populate('user', 'firstName lastName email phone role')
      .populate('bus', 'busId busType numberPlate capacity status');

    res.status(201).json({
      message: 'Maintenance request created successfully',
      maintenance: populatedMaintenance
    });
  } catch (error) {
    console.error('Create maintenance error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid ID format provided'
      });
    }
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all maintenance requests
export const getMaintenances = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    const maintenances = await Maintenance.find(filter)
      .populate('user', 'firstName lastName email phone role')
      .populate('bus', 'busId busType numberPlate capacity status')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Maintenance.countDocuments(filter);

    res.json({
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      maintenances
    });
  } catch (error) {
    console.error('Get maintenances error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single maintenance by ID
export const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('user', 'firstName lastName email phone role')
      .populate('bus', 'busId busType numberPlate capacity status');

    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }
    res.json(maintenance);
  } catch (error) {
    console.error('Get maintenance error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update maintenance request (simplified)
export const updateMaintenance = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      description, 
      estimatedCompletionDate, 
      actualCompletionDate,
      estimatedCost,
      actualCost
    } = req.body;

    const updateData = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(description && { description }),
      ...(estimatedCompletionDate && { estimatedCompletionDate }),
      ...(actualCompletionDate && { actualCompletionDate }),
      ...(estimatedCost !== undefined && { estimatedCost }),
      ...(actualCost !== undefined && { actualCost })
    };

    // If status is being updated to "Completed", set actual completion date
    if (status === 'Completed' && !actualCompletionDate) {
      updateData.actualCompletionDate = new Date();
    }

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email phone role')
    .populate('bus', 'busId busType numberPlate capacity status');

    if (!updatedMaintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json({
      message: 'Maintenance request updated successfully',
      maintenance: updatedMaintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete maintenance request
export const deleteMaintenance = async (req, res) => {
  try {
    const deletedMaintenance = await Maintenance.findByIdAndDelete(req.params.id);

    if (!deletedMaintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json({ message: 'Maintenance request deleted successfully' });
  } catch (error) {
    console.error('Delete maintenance error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get maintenance statistics
export const getMaintenanceStats = async (req, res) => {
  try {
    const statusStats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Maintenance.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const total = await Maintenance.countDocuments();
    const pending = await Maintenance.countDocuments({ status: 'Pending' });
    const inProgress = await Maintenance.countDocuments({ status: 'In Progress' });
    const completed = await Maintenance.countDocuments({ status: 'Completed' });
    
    res.json({
      total,
      byStatus: statusStats,
      byPriority: priorityStats,
      summary: {
        pending,
        inProgress,
        completed
      }
    });
  } catch (error) {
    console.error('Get maintenance stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get active staff users for dropdown
export const getStaffUsers = async (req, res) => {
  try {
    const staffUsers = await User.find({ 
      role: 'staff', 
      isActive: true 
    })
    .populate('staffProfile', 'employeeId department')
    .select('firstName lastName email phone staffProfile')
    .sort({ firstName: 1 });

    res.json(staffUsers);
  } catch (error) {
    console.error('Get staff users error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get active buses for dropdown
export const getActiveBuses = async (req, res) => {
  try {
    const buses = await Bus.find({ 
      isActive: true, 
      status: { $ne: 'Retired' } 
    })
    .select('busId busType numberPlate capacity status')
    .sort({ busId: 1 });

    res.json(buses);
  } catch (error) {
    console.error('Get active buses error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get maintenance requests by user ID
export const getMaintenanceByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const maintenances = await Maintenance.find({ user: userId })
      .populate('user', 'firstName lastName email phone role')
      .populate('bus', 'busId busType numberPlate capacity status')
      .sort({ createdAt: -1 });

    res.json({
      user: {
        id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role
      },
      count: maintenances.length,
      maintenances
    });
  } catch (error) {
    console.error('Get maintenance by user error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get maintenance requests by bus ID
export const getMaintenanceByBus = async (req, res) => {
  try {
    const { busId } = req.params;
    
    // Check if bus exists
    const bus = await Bus.findById(busId);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    const maintenances = await Maintenance.find({ bus: busId })
      .populate('user', 'firstName lastName email phone role')
      .populate('bus', 'busId busType numberPlate capacity status')
      .sort({ createdAt: -1 });

    res.json({
      bus: {
        id: bus._id,
        busId: bus.busId,
        numberPlate: bus.numberPlate,
        busType: bus.busType,
        status: bus.status
      },
      count: maintenances.length,
      maintenances
    });
  } catch (error) {
    console.error('Get maintenance by bus error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get maintenance cost statistics
export const getMaintenanceCostStats = async (req, res) => {
  try {
    const costStats = await Maintenance.aggregate([
      {
        $match: {
          status: 'Completed',
          actualCost: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$actualCost' },
          averageCost: { $avg: '$actualCost' },
          totalRequests: { $sum: 1 },
          minCost: { $min: '$actualCost' },
          maxCost: { $max: '$actualCost' }
        }
      }
    ]);

    const monthlyCosts = await Maintenance.aggregate([
      {
        $match: {
          status: 'Completed',
          actualCost: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$actualCompletionDate' },
            month: { $month: '$actualCompletionDate' }
          },
          totalCost: { $sum: '$actualCost' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const costByPriority = await Maintenance.aggregate([
      {
        $match: {
          status: 'Completed',
          actualCost: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: '$priority',
          totalCost: { $sum: '$actualCost' },
          averageCost: { $avg: '$actualCost' },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      overall: costStats[0] || {
        totalSpent: 0,
        averageCost: 0,
        totalRequests: 0,
        minCost: 0,
        maxCost: 0
      },
      monthly: monthlyCosts,
      byPriority: costByPriority
    });
  } catch (error) {
    console.error('Get cost stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};