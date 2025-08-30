import express from 'express';
import bodyparser from 'body-parser';
import mongoose  from 'mongoose';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import verifyJWT from './middleware/auth.js';

const app = express();

//mongodb+srv://admin:123@cluster0.v1eieer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

mongoose.connect('mongodb+srv://admin:123@cluster0.v1eieer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0').then(
    () => {
        console.log("Connected to the database");
    }
).catch(
    ()=>{
        console.log("Connection failed");
    }
)

app.use(bodyparser.json());

app.use(verifyJWT)

app.use("/users", userRouter);

app.use("/products", productRouter);

app.listen(3000,
    () => {
        console.log('Server is running on port 3000');
    }
);