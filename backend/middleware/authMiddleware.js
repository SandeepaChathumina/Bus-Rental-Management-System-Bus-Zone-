import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const protect = async (req, res, next) => {
  try {
    let token;
    console.log('Auth headers:', req.headers.authorization); // Debug line

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        console.log('Token extracted:', token ? 'Yes' : 'No'); // Debug line
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded:', decoded); // Debug line
        
        req.user = await User.findById(decoded.id).select('-password');
        console.log('User found:', req.user ? 'Yes' : 'No'); // Debug line
        
        next();
      } catch (error) {
        console.error('Token verification error:', error); // Debug line
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    } else {
      console.log('No authorization header found'); // Debug line
      res.status(401).json({ message: 'Not authorized, no token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error); // Debug line
    res.status(500).json({ message: error.message });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};

export { protect, admin };