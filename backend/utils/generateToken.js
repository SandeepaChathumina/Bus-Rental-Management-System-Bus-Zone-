import jwt from 'jsonwebtoken';

const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id.toString(), 
      role: user.role,
      username: user.username 
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export default generateToken;