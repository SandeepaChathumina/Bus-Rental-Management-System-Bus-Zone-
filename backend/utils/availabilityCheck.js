import Schedule from '../models/schedule.js';

// Check if driver is available (excluding a specific schedule for updates)
export const isDriverAvailable = async (driverId, startTime, endTime, excludeScheduleId = null) => {
  const query = {
    driverId: driverId,
    status: { $ne: 'Cancelled' },
    $or: [
      { scheduledStartTime: { $lt: endTime }, scheduledEndTime: { $gt: startTime } },
      { scheduledStartTime: { $lt: endTime }, scheduledEndTime: { $gt: startTime } }
    ]
  };
  
  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }
  
  const conflictingSchedule = await Schedule.findOne(query);
  return !conflictingSchedule;
};

// Check if bus is available (excluding a specific schedule for updates)
export const isBusAvailable = async (busId, startTime, endTime, excludeScheduleId = null) => {
  const query = {
    busId: busId,
    status: { $ne: 'Cancelled' },
    $or: [
      { scheduledStartTime: { $lt: endTime }, scheduledEndTime: { $gt: startTime } },
      { scheduledStartTime: { $lt: endTime }, scheduledEndTime: { $gt: startTime } }
    ]
  };
  
  if (excludeScheduleId) {
    query._id = { $ne: excludeScheduleId };
  }
  
  const conflictingSchedule = await Schedule.findOne(query);
  return !conflictingSchedule;
};