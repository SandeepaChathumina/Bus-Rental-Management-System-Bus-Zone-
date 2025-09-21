import Bus from "../models/bus.js";

// Create new bus
export const createBus = async (req, res) => {
  try {
    const { busType, engineNumber, capacity, numberPlate, vehiclePhoto, status } = req.body;

    // Check if bus already exists with same engine number or number plate
    const existingBus = await Bus.findOne({
      $or: [
        { engineNumber },
        { numberPlate }
      ]
    });

    if (existingBus) {
      return res.status(400).json({
        message: 'Bus already exists with same engine number or number plate'
      });
    }

    const bus = new Bus({
      busType,
      engineNumber,
      capacity,
      numberPlate,
      vehiclePhoto: vehiclePhoto || '',
      status: status || 'Available'
    });

    const savedBus = await bus.save();
    
    res.status(201).json({
      message: 'Bus created successfully',
      bus: savedBus
    });
  } catch (error) {
    console.error('Create bus error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get all buses
export const getBuses = async (req, res) => {
  try {
    const buses = await Bus.find().sort({ busId: 1 });
    res.json({
      count: buses.length,
      buses
    });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get single bus by ID
export const getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json(bus);
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Update bus
export const updateBus = async (req, res) => {
  try {
    const { busType, engineNumber, capacity, numberPlate, vehiclePhoto, status, isActive } = req.body;

    // Check for duplicate engine number or number plate excluding current bus
    const existingBus = await Bus.findOne({
      $and: [
        { _id: { $ne: req.params.id } },
        { $or: [{ engineNumber }, { numberPlate }] }
      ]
    });

    if (existingBus) {
      return res.status(400).json({
        message: 'Another bus already exists with same engine number or number plate'
      });
    }

    const updatedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      {
        busType,
        engineNumber,
        capacity,
        numberPlate,
        vehiclePhoto,
        status,
        isActive
      },
      { new: true, runValidators: true }
    );

    if (!updatedBus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json({
      message: 'Bus updated successfully',
      bus: updatedBus
    });
  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete bus (soft delete)
export const deleteBus = async (req, res) => {
  try {
    const deletedBus = await Bus.findByIdAndUpdate(
      req.params.id,
      { isActive: false, status: 'Retired' },
      { new: true }
    );

    if (!deletedBus) {
      return res.status(404).json({ message: 'Bus not found' });
    }

    res.json({ message: 'Bus deactivated successfully' });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get bus statistics for dashboard
export const getBusStats = async (req, res) => {
  try {
    const totalBuses = await Bus.countDocuments();
    const availableBuses = await Bus.countDocuments({ status: 'Available' });
    const inServiceBuses = await Bus.countDocuments({ status: 'In Service' });
    const maintenanceBuses = await Bus.countDocuments({ status: 'Maintenance' });
    
    res.json({
      totalBuses,
      availableBuses,
      inServiceBuses,
      maintenanceBuses
    });
  } catch (error) {
    console.error('Get bus stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Get buses by status
export const getBusesByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const buses = await Bus.find({ status });
    res.json({
      count: buses.length,
      buses
    });
  } catch (error) {
    console.error('Get buses by status error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// Reactivate bus (undo soft delete)
export const reactivateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      { isActive: true, status: 'Available' },
      { new: true }
    );
    if (!bus) {
      return res.status(404).json({ message: 'Bus not found' });
    }
    res.json({ message: 'Bus reactivated successfully', bus });
  } catch (error) {
    console.error('Reactivate bus error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};