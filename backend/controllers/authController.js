// controllers/authController.js
import User from '../models/user.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { firstName, lastName, email, password, role, username, phone, nic, address } = req.body;
    
    // Check required fields
    if (!firstName || !lastName || !email || !password || !username) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email or username' });
    }

    // Set default role to passenger if not provided or if user is not admin
    const safeRole = (req.user && req.user.role === 'admin' && role) ? role : 'passenger';

    // Create user
    const user = await User.create({ 
      firstName, 
      lastName, 
      email, 
      username,
      password, 
      phone,
      nic,
      address,
      role: safeRole 
    });

    // Generate token
    const token = generateToken(user);
    
    // Return user data without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.status(201).json({ 
      user: userResponse, 
      token 
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user);
    
    // Return user data without password
    const userResponse = user.toJSON();
    delete userResponse.password;

    return res.json({ 
      user: userResponse, 
      token 
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

export const updateMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatable = ['firstName', 'lastName', 'phone', 'password'];
    updatable.forEach(field => {
      if (req.body[field]) user[field] = req.body[field];
    });

    await user.save(); 
    
    // Return user data without password
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    return res.json({ user: userResponse });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};