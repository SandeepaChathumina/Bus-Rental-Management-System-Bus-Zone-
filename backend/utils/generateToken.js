// utils/generateToken.js
import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  // include id and role
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

export default generateToken;
