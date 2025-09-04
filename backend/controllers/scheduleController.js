import Schedule from '../models/schedule.js';
import { isDriverAvailable, isBusAvailable } from '../utils/availabilityCheck.js';

// Create new schedule
export const createSchedule = async (req, res) => {
  try {
    const { bookingId, busId, driverId, startLocation, destination, scheduledStartTime, scheduledEndTime } = req.body;

    // Check driver availability
    const driverFree = await isDriverAvailable(driverId, scheduledStartTime, scheduledEndTime);
    if (!driverFree) {
      return res.status(400).json({ message: 'Driver is not available in this time slot' });
    }

    // Check bus availability
    const busFree = await isBusAvailable(busId, scheduledStartTime, scheduledEndTime);
    if (!busFree) {
      return res.status(400).json({ message: 'Bus is not available in this time slot' });
    }

    // Create schedule
    const schedule = new Schedule({
      bookingId,
      busId,
      driverId,
      startLocation,
      destination,
      scheduledStartTime,
      scheduledEndTime
    });

    const savedSchedule = await schedule.save();
    res.status(201).json({ message: 'Schedule created successfully', schedule: savedSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all schedules (for admin)
export const getSchedules = async (req, res) => {
  try {
    const { driverId, date, status } = req.query;
    let filter = {};

    if (driverId) filter.driverId = driverId;
    if (status) filter.status = status;
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.scheduledStartTime = { $gte: startOfDay, $lte: endOfDay };
    }

    const schedules = await Schedule.find(filter)
      .populate('bookingId', 'bookingId travelDate')
      .populate('busId', 'busId numberPlate busType')
      .populate('driverId', 'firstName lastName')
      .sort({ scheduledStartTime: 1 });

    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get driver's own schedule
export const getDriverSchedule = async (req, res) => {
  try {
    const driverId = req.user._id;
    const schedules = await Schedule.find({ driverId })
      .populate('bookingId', 'bookingId travelDate')
      .populate('busId', 'busId numberPlate')
      .sort({ scheduledStartTime: 1 });

    res.json({ schedules });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update schedule
export const updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // If changing time, driver, or bus, check availability
    if (updates.scheduledStartTime || updates.scheduledEndTime || updates.driverId || updates.busId) {
      const startTime = updates.scheduledStartTime || schedule.scheduledStartTime;
      const endTime = updates.scheduledEndTime || schedule.scheduledEndTime;
      const driverId = updates.driverId || schedule.driverId;
      const busId = updates.busId || schedule.busId;

      // Check driver availability (excluding current schedule)
      if (updates.driverId || updates.scheduledStartTime || updates.scheduledEndTime) {
        const driverFree = await isDriverAvailable(driverId, startTime, endTime, id);
        if (!driverFree) {
          return res.status(400).json({ message: 'Driver is not available in this time slot' });
        }
      }

      // Check bus availability (excluding current schedule)
      if (updates.busId || updates.scheduledStartTime || updates.scheduledEndTime) {
        const busFree = await isBusAvailable(busId, startTime, endTime, id);
        if (!busFree) {
          return res.status(400).json({ message: 'Bus is not available in this time slot' });
        }
      }
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(id, updates, { new: true });
    res.json({ message: 'Schedule updated successfully', schedule: updatedSchedule });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel schedule
export const cancelSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const schedule = await Schedule.findById(id);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    schedule.status = 'Cancelled';
    await schedule.save();

    res.json({ message: 'Schedule cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};