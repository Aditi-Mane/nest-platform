import User from "../models/User.js";
import bcrypt from "bcrypt";

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
    await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password: hashedPassword
    })

    return res.status(201).json({ //201 code for creation purposes
      message: "User created successfully"
    });


  } catch (error) {
    console.log("Signup Error:", error);
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const verifyAccount = async (req, res) =>{
  const {collegeId, idCardImage} = req.body;

  const normalizedId = collegeId.toUpperCase();
  if(!normalizedId || normalizedId.length < 9){
    return res.status(400).json({
      message: "Id must be atleast 9 characters"
    })
  }
}
