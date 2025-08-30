import express from 'express';
import { loginUser, saveUser } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post("/", saveUser);
userRouter.post("/login", loginUser);

export default userRouter;