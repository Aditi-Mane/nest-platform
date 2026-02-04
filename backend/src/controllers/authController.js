import User from "../models/User.js";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
  try {
    const {name, email, password} = req.body;

    //name
    if (!name || name.length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters"
      });
    }

    //email
    if (!email || !email.includes("@") || !email.includes(".")) {
      return res.status(400).json({
        message: "Invalid email"
      });
    }

    //password
    if (!password || password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    //check if user email already exists
    const existingUser = await User.findOne({email});

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
      name,
      email,
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
