import User from '../models/user.js';
import DriverProfile from '../models/driverProfile.js';
import StaffProfile from '../models/staffProfile.js';
import generateToken from '../utils/generateToken.js';

const registerUser = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, phone, nic, address, role, 
            licenseNumber, licenseExpiry, emergencyContact, staffRole, employeeId } = req.body;

    const userExists = await User.findOne({ $or: [{ email }, { username }, { nic }] });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
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

    if (role === 'driver' && licenseNumber && licenseExpiry) {
      await DriverProfile.create({
        user: user._id,
        licenseNumber,
        licenseExpiry: new Date(licenseExpiry),
        emergencyContact
      });
    }

    if (role === 'staff' && staffRole && employeeId) {
      await StaffProfile.create({
        user: user._id,
        staffRole,
        employeeId
      });
    }

    if (user) {
      let userWithProfile = user.toJSON();
      
      if (role === 'driver') {
        const driverProfile = await DriverProfile.findOne({ user: user._id });
        userWithProfile.driverProfile = driverProfile;
      } else if (role === 'staff') {
        const staffProfile = await StaffProfile.findOne({ user: user._id });
        userWithProfile.staffProfile = staffProfile;
      }

      res.status(201).json({
        ...userWithProfile,
        token: generateToken(user)
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
      const driverProfile = await DriverProfile.findOne({ user: user._id });
      userData.driverProfile = driverProfile;
    } else if (user.role === 'staff') {
      const staffProfile = await StaffProfile.findOne({ user: user._id });
      userData.staffProfile = staffProfile;
    }

    res.json({
      ...userData,
      token: generateToken(user)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');

    const usersWithProfiles = await Promise.all(users.map(async (user) => {
      const userObj = user.toObject();
      
      if (user.role === 'driver') {
        userObj.driverProfile = await DriverProfile.findOne({ user: user._id });
      } else if (user.role === 'staff') {
        userObj.staffProfile = await StaffProfile.findOne({ user: user._id });
      }
      
      return userObj;
    }));

    res.json(usersWithProfiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
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

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updatableFields = ['username', 'email', 'firstName', 'lastName', 'phone', 'nic', 'address', 'role', 'isActive'];
    updatableFields.forEach(field => {
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

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = false;
    await user.save();
    
    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserReport = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    const report = {
      totalUsers: users.length,
      byRole: {
        admin: users.filter(u => u.role === 'admin').length,
        driver: users.filter(u => u.role === 'driver').length,
        staff: users.filter(u => u.role === 'staff').length,
        passenger: users.filter(u => u.role === 'passenger').length
      },
      activeUsers: users.filter(u => u.isActive).length,
      users: await Promise.all(users.map(async (user) => {
        const userObj = user.toObject();
        if (user.role === 'driver') {
          userObj.driverProfile = await DriverProfile.findOne({ user: user._id });
        } else if (user.role === 'staff') {
          userObj.staffProfile = await StaffProfile.findOne({ user: user._id });
        }
        return userObj;
      }))
    };
    
    res.json(report);
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
  getUserReport
};