import Maintenance from '../models/maintenance.js';
import User from '../models/user.js';
import Bus from '../models/bus.js';
import StaffProfile from '../models/staffProfile.js';

// Create new maintenance request
export const createMaintenance = async (req, res) => {
  try {
    console.log('Create maintenance request body:', req.body); // Debug line
    console.log('User from request:', req.user); // Debug line
    
    const { 
      user, 
      bus, 
      description, 
      priority, 
      estimatedCost,
      estimatedCompletionDate,
      actualCompletionDate,
      status
    } = req.body;

    // Check if all required fields are provided
    if (!user || !bus || !description || estimatedCost === undefined) {
      console.log('Missing required fields:', { user, bus, description, estimatedCost }); // Debug line
      return res.status(400).json({
        message: 'Please provide all required fields: user, bus, description, estimatedCost'
      });
    }

    // Check if user exists and is a staff member
    const userDoc = await User.findById(user);
    if (!userDoc) {
      return res.status(404).json({ 
        message: 'User not found. Please provide a valid user ID.' 
      });
    }

    // Check if user has staff role
    if (userDoc.role !== 'staff') {
      return res.status(400).json({ 
        message: 'Only staff members can create maintenance requests.' 
      });
    }

    // Check if staff profile exists for this user
    const staffProfile = await StaffProfile.findOne({ user: user });
    if (!staffProfile) {
      return res.status(400).json({ 
        message: 'Staff profile not found for this user.' 
      });
    }

    // Check if bus exists
    const busDoc = await Bus.findById(bus);
    if (!busDoc) {
      return res.status(404).json({ 
        message: 'Bus not found. Please provide a valid bus ID.' 
      });
    }

    // Check if bus is active
    if (!busDoc.isActive || busDoc.status === 'Retired') {
      return res.status(400).json({ 
        message: 'Cannot create maintenance request for inactive or retired bus.' 
      });
    }

    // Validate estimated completion date
    if (estimatedCompletionDate) {
      const estDate = new Date(estimatedCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (estDate < today) {
        return res.status(400).json({
          message: 'Estimated completion date cannot be in the past'
        });
      }
    }

    // Validate actual completion date if provided
    if (actualCompletionDate) {
      const actualDate = new Date(actualCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (actualDate > today) {
        return res.status(400).json({
          message: 'Actual completion date cannot be in the future'
        });
      }
    }

    const maintenance = new Maintenance({
      user: user,
      bus: bus,
      description,
      priority: priority || 'Medium',
      estimatedCost,
      estimatedCompletionDate: estimatedCompletionDate || null,
      status: status || 'Pending'
    });

    const savedMaintenance = await maintenance.save();
    
    // Populate user and bus details
    const populatedMaintenance = await Maintenance.findById(savedMaintenance._id)
      .populate('user', 'firstName lastName email phone role')
      .populate('bus', 'busId busType brand numberPlate capacity status');

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
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: errors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Duplicate maintenance request found'
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
    const { status, priority, page, limit } = req.query;
    let filter = {};
    
    if (status) {
      filter.status = status;
    }
    
    if (priority) {
      filter.priority = priority;
    }

    let query = Maintenance.find(filter)
      .populate('user', 'firstName lastName email phone role')
      .populate('bus', 'busId busType brand numberPlate capacity status')
      .sort({ createdAt: -1 });

    // Apply pagination only if page and limit are provided
    if (page && limit) {
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      query = query.limit(limitNum).skip((pageNum - 1) * limitNum);
    }

    const maintenances = await query;

    // Only calculate pagination info if pagination is used
    let response = { maintenances };
    if (page && limit) {
      const total = await Maintenance.countDocuments(filter);
      response = {
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        maintenances
      };
    }

    res.json(response);
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
      .populate('bus', 'busId busType brand numberPlate capacity status');

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

// Update maintenance request
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

    // Validate estimated completion date
    if (estimatedCompletionDate) {
      const estDate = new Date(estimatedCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (estDate < today) {
        return res.status(400).json({
          message: 'Estimated completion date cannot be in the past'
        });
      }
    }

    // Validate actual completion date
    if (actualCompletionDate) {
      const actualDate = new Date(actualCompletionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (actualDate > today) {
        return res.status(400).json({
          message: 'Actual completion date cannot be in the future'
        });
      }
    }

    // Validate completed status requirements
    if (status === 'Completed') {
      if (!actualCompletionDate) {
        return res.status(400).json({
          message: 'Actual completion date is required for completed requests'
        });
      }
      if (!actualCost || actualCost <= 0) {
        return res.status(400).json({
          message: 'Valid actual cost is required for completed requests'
        });
      }
    }

    const updateData = {
      ...(status && { status }),
      ...(priority && { priority }),
      ...(description && { description }),
      ...(estimatedCompletionDate && { estimatedCompletionDate }),
      ...(actualCompletionDate && { actualCompletionDate }),
      ...(estimatedCost !== undefined && { estimatedCost }),
      ...(actualCost !== undefined && { actualCost })
    };

    // If status is being updated to "Completed" and no actual completion date provided, set it to today
    if (status === 'Completed' && !actualCompletionDate) {
      updateData.actualCompletionDate = new Date();
    }

    const updatedMaintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('user', 'firstName lastName email phone role')
    .populate('bus', 'busId busType brand numberPlate capacity status');

    if (!updatedMaintenance) {
      return res.status(404).json({ message: 'Maintenance request not found' });
    }

    res.json({
      message: 'Maintenance request updated successfully',
      maintenance: updatedMaintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'Invalid ID format provided'
      });
    }
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation error',
        errors: errors
      });
    }
    
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
    .select('busId busType brand numberPlate capacity status')
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
      .populate('bus', 'busId busType brand numberPlate capacity status')
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
      .populate('bus', 'busId busType brand numberPlate capacity status')
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