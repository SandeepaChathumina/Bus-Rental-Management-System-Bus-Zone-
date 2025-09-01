import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRouter from './routes/userRouter.js';
import authRouter from './routes/authRouter.js';
import bookingRouter from './routes/bookingRouter.js';
import busRouter from './routes/busRouter.js';
import notificationRouter from './routes/notificationRouter.js';

dotenv.config();

console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Loaded' : 'Not loaded');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not loaded');
console.log('PORT:', process.env.PORT);

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/bookings', bookingRouter);
app.use('/api/buses', busRouter);
app.use('/api/notifications', notificationRouter);

app.get('/', (req, res) => {
  res.send('Bus Rental Management System API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running on port ${PORT}`));




