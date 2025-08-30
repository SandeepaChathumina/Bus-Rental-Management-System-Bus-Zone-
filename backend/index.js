import express from 'express';
import bodyparser from 'body-parser';
import mongoose  from 'mongoose';
import userRouter from './routes/userRouter.js';
import jwt from 'jsonwebtoken';

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

app.use(
    (req, res, next) => {
        const header = req.header("Authorization");
        if (header != null) {
            const token = header.replace("Bearer ", "");
            jwt.verify(token, "random456", (err, decoded) => {
                console.log(decoded);
                if(decoded != null){
                    req.user = decoded;
                }
            });
        }
        next();
    }
)

app.use("/users", userRouter);

app.listen(3000,
    () => {
        console.log('Server is running on port 3000');
    }
);