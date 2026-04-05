

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const generateToken = (id, role) =>{

    return jwt.sign({id, role}, process.env.JWT_SECRET, {expiresIn: "30d"

    });
}

export const registerUser = async (req,res)=>{
    try {
        
        const {name, email, password, role} = req.body;

        const userExists = await User.findOne({email});

        if(userExists){
            return res.status(400).json({success: false, message: "User already exists"});
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "Viewer"
        });

        res.status(201).json({
            success: true,
            user:{
                id : user._id,
                name : user.name,
                email : user.email,
                role : user.role,
            },

            token: generateToken(user._id, user.role),
        });

    } catch (error) {
        res.status(500).json({success: false, message: "Server Error"});
    }
};


export const loginUser = async(req, res)=>{

    try{

        const {email, password} = req.body;
        const user = await User.findOne({email}).select("+password");

        if(!user){
            return res.status(401).json({success: false, message: "Invalid credentials"});
        }

        if(user.status === "Inactive"){
            res.status(403).json({success: false, message: "Account is inactive. Please contact admin."});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(401).json({success: false, message: "Invalid credentials"});
        }

        res.status(200).json({
            success: true,
            user:{
                id:user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token: generateToken(user._id, user.role),
        });
    }catch(error){
        res.status(500).json({success: false, message: "Server Error"});
    }
}