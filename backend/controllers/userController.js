import User from '../models/user.js';
import DriverProfile from '../models/driverProfile.js';
import StaffProfile from '../models/staffProfile.js';
import generateToken from '../utils/generateToken.js';

// ==================== REGISTER USER ====================
const registerUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      nic,
      address,
      role,
      licenseNumber,
      licenseExpiry,
      emergencyContact,
      staffRole,
      employeeId
    } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }, { nic }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 🚨 Prevent self-registering as admin
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot be self-registered' });
    }

    // 🚨 Staff & drivers require admin
    if ((role === 'staff' || role === 'driver') && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ message: 'Only admins can create staff and drivers' });
    }

    const user = await User.create({
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      nic,
      address,
      role: role || 'passenger'
    });

    // Create driver profile if admin creates driver
    if (role === 'driver') {
      if (!licenseNumber || !licenseExpiry) {
        return res.status(400).json({ message: 'Driver must have licenseNumber and licenseExpiry' });
      }
      await DriverProfile.create({
        user: user._id,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        emergencyContact
      });
    }

    // Create staff profile if admin creates staff
    if (role === 'staff') {
      if (!staffRole || !employeeId) {
        return res.status(400).json({ message: 'Staff must have staffRole and employeeId' });
      }
      await StaffProfile.create({
        user: user._id,
        staffRole,
        employeeId
      });
    }

    let userWithProfile = user.toJSON();
    if (role === 'driver') {
      userWithProfile.driverProfile = await DriverProfile.findOne({ user: user._id });
    } else if (role === 'staff') {
      userWithProfile.staffProfile = await StaffProfile.findOne({ user: user._id });
    }

    res.status(201).json({
      ...userWithProfile,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== LOGIN ====================
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    let userData = user.toJSON();

    if (user.role === 'driver') {
      userData.driverProfile = await DriverProfile.findOne({ user: user._id });
    } else if (user.role === 'staff') {
      userData.staffProfile = await StaffProfile.findOne({ user: user._id });
    }

    res.json({
      ...userData,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== GET ALL USERS ====================
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    const usersWithProfiles = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject();
        if (user.role === 'driver') {
          userObj.driverProfile = await DriverProfile.findOne({ user: user._id });
        } else if (user.role === 'staff') {
          userObj.staffProfile = await StaffProfile.findOne({ user: user._id });
        }
        return userObj;
      })
    );

    res.json(usersWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== GET USER BY ID ====================
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🚨 Allow only self or admin to view
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this account' });
    }

    const userObj = user.toObject();
    if (user.role === 'driver') {
      userObj.driverProfile = await DriverProfile.findOne({ user: user._id });
    } else if (user.role === 'staff') {
      userObj.staffProfile = await StaffProfile.findOne({ user: user._id });
    }

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== UPDATE USER ====================
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 🚨 Authorization check
    if (req.user.role !== 'admin' && req.user._id.toString() !== user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this account' });
    }

    // 🚨 Admin cannot change passenger details (only deactivate)
    if (req.user.role === 'admin' && user.role === 'passenger') {
      if (Object.keys(req.body).some(field => field !== 'isActive')) {
        return res.status(403).json({ message: 'Admins cannot modify passenger details' });
      }
    }

    const updatableFields = [
      'username',
      'email',
      'firstName',
      'lastName',
      'phone',
      'nic',
      'address',
      'role',
      'isActive'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    if (user.role === 'driver' && req.body.driverProfile) {
      await DriverProfile.findOneAndUpdate(
        { user: user._id },
        { ...req.body.driverProfile },
        { upsert: true, new: true }
      );
    } else if (user.role === 'staff' && req.body.staffProfile) {
      await StaffProfile.findOneAndUpdate(
        { user: user._id },
        { ...req.body.staffProfile },
        { upsert: true, new: true }
      );
    }

    const userObj = updatedUser.toObject();
    if (user.role === 'driver') {
      userObj.driverProfile = await DriverProfile.findOne({ user: user._id });
    } else if (user.role === 'staff') {
      userObj.staffProfile = await StaffProfile.findOne({ user: user._id });
    }

    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== DELETE / DEACTIVATE ====================
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admin can deactivate
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to deactivate users' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== REPORT ====================
const getUserReport = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    const report = {
      totalUsers: users.length,
      byRole: {
        admin: users.filter((u) => u.role === 'admin').length,
        driver: users.filter((u) => u.role === 'driver').length,
        staff: users.filter((u) => u.role === 'staff').length,
        passenger: users.filter((u) => u.role === 'passenger').length
      },
      activeUsers: users.filter((u) => u.isActive).length,
      users: await Promise.all(
        users.map(async (user) => {
          const userObj = user.toObject();
          if (user.role === 'driver') {
            userObj.driverProfile = await DriverProfile.findOne({ user: user._id });
          } else if (user.role === 'staff') {
            userObj.staffProfile = await StaffProfile.findOne({ user: user._id });
          }
          return userObj;
        })
      )
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CHECK USERNAME AVAILABILITY ====================
const checkUsernameAvailability = async (req, res) => {
  try {
    const { username } = req.query;
    
    if (!username) {
      return res.status(400).json({ message: 'Username parameter is required' });
    }
    
    const existingUser = await User.findOne({ username });
    
    return res.json({ available: !existingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CHECK EMAIL AVAILABILITY ====================
const checkEmailAvailability = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    
    const existingUser = await User.findOne({ email });
    
    return res.json({ available: !existingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CHECK PHONE AVAILABILITY ====================
const checkPhoneAvailability = async (req, res) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({ message: 'Phone parameter is required' });
    }
    
    // If phone is empty string, consider it available (since it's optional)
    if (phone === '') {
      return res.json({ available: true });
    }
    
    const existingUser = await User.findOne({ phone });
    
    return res.json({ available: !existingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== CHECK NIC AVAILABILITY ====================
const checkNICAvailability = async (req, res) => {
  try {
    const { nic } = req.query;
    
    if (!nic) {
      return res.status(400).json({ message: 'NIC parameter is required' });
    }
    
    const existingUser = await User.findOne({ nic });
    
    return res.json({ available: !existingUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==================== ACTIVATE USER ====================
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admin can activate
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to activate users' });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: 'User activated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  activateUser, // Add this line
  getUserReport,
  checkUsernameAvailability,
  checkEmailAvailability,
  checkPhoneAvailability,
  checkNICAvailability
};
