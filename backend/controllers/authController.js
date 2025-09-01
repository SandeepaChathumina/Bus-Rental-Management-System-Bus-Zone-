import User from './models/User.js';
import generateToken from '../utils/generateToken.js';
import { validationResult } from 'express-validator';

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { firstName, lastName, email, password, role } = req.body;
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const safeRole = (req.user && req.user.role === 'admin' && role) ? role : 'passenger';

    const user = await User.create({ firstName, lastName, email, password, role: safeRole });
    const token = generateToken(user);
    return res.status(201).json({ user: user.toJSON(), token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
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
    return res.json({ user: user.toJSON(), token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
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
    return res.json({ user: user.toJSON() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
