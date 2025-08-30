import User from '../models/user.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export function saveUser(req, res) {

    if(req.body.role == "admin" ){
        if(req.user == null){
            res.status(403).json({message: "Please login as admin to create another admin user"});
            return;
        }
        if(req.user != "admin"){
            res.status(403).json({message: "Only admin can create another admin user"});
            return;
        }
    } 
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    const user = new User({
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        password: hashedPassword,
        role: req.body.role,
    });

    user.save().then(
        ()=>{
            res.json({message: "User added successfully"});
        }
      ).catch(
        ()=>{
            res.status(500).json({message: "Error occured while adding user", error: error});
        }
      )
}

export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.findOne({
        email: email
    }).then(
        (user)=>{ 
            if(user == null) {
                res.status(404).json({message: "User not found"});
            }else{
                const isPasswordValid = bcrypt.compareSync(password, user.password);
                if(isPasswordValid) {
                    const userData = {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        phone: user.phone,
                        isDisabled: user.isDisabled,
                        isEmailVerified: user.isEmailVerified
                    };

                    const token = jwt.sign(userData,"random456")
                    res.json({message: "Login successful", token: token});

                    
                }else{
                    res.status(403).json({message: "Invalid password"});
                }
            }
    })
}