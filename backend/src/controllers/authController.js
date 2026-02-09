import User from "../models/User.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const {name, email, password} = req.body;

    const trimmedName = name?.trim();
    const normalizedEmail = email?.toLowerCase();

    //name
    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters"
      });
    }

    //email
    if (!normalizedEmail || !normalizedEmail.includes("@") || !normalizedEmail.includes(".")) {
      return res.status(400).json({
        message: "Invalid email"
      });
    }

    //password
    const hasNumber = /\d/.test(password);
    if (!password || password.length < 6 || !hasNumber) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and contain a number"
      });
    }

    //check if user email already exists
    const existingUser = await User.findOne({email: normalizedEmail});

    if(existingUser){
      return res.status(400).json({
        message: "Email already registered"
      })
    }

    //hash the password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //user creation
    const user = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword
    })

    const token = generateToken(user._id);

    return res.status(201).json({ //201 code for creation purposes
      message: "User created successfully",
      token
    });


  } catch (error) {
    console.log("Signup Error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const verifyAccount = async (req, res) =>{
  try {
    const {collegeId, email} = req.body;
    const file = req.file;

    if(!collegeId || collegeId.length !== 9 || !/[a-zA-Z]$/.test(collegeId)){
      return res.status(400).json({
        message: "PRN must be 9 characters and end with a letter"
      })
    }
    const normalizedId = collegeId.toUpperCase();

    if(!file) {
      return res.status(400).json({
        message: "ID card image is required",
      });
    }
    
    const user = req.user;

    if(!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.collegeId = normalizedId;
    user.idCardImage = file.path;
    user.isVerified = false;

    await user.save();

    return res.status(200).json({
      message: "Verification submitted successfully. Await admin approval.",
    });
  } catch (error) {
    
    return res.status(500).json({
      message: "Server error",
    });
  }
}
