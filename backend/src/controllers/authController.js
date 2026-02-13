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
      password: hashedPassword,

      verificationStatus: "pending",
      availableRoles: [],
      activeRole: null,
      isVerified: false
    })

    return res.status(201).json({ //201 code for creation purposes
      message: "Signup successful. Please complete verification.",
      userId: user._id
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
    const {userId, collegeId} = req.body;
    const file = req.file;

    if(!userId){
      return res.status(400).json({
        message: "User Id is required"
      })
    }

    if(!collegeId){
      return res.status(400).json({
        message: "PRN is required"
      });
    }

    const normalizedId = collegeId.toUpperCase();

    if(normalizedId.length !== 9 || !/^[A-Z0-9]{8}[A-Z]$/.test(normalizedId)){
      return res.status(400).json({
        message: "PRN must have 8 numbers and end with a letter"
      })
    }

    //check duplicate prn
    const existingId = await User.findOne({collegeId: normalizedId});
    if(existingId){
      return res.status(400).json({
        message: "This PRN is already registered with another account"
      })
    }

    if(!file) {
      return res.status(400).json({
        message: "ID card image is required",
      });
    }

    const user = await User.findById(userId);

    if(!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    //prevent duplicate submission
    if (user.verificationStatus === "under_review") {
      return res.status(400).json({
        message: "Verification already submitted and under review"
      });
    }

    if (user.verificationStatus === "approved") {
      return res.status(400).json({
        message: "User already verified"
      });
    }

    user.collegeId = normalizedId;
    user.idCardImage = file.path;
    user.verificationStatus = "under_review"
    user.isVerified = false;

    await user.save();

    return res.status(200).json({
      message: "Verification submitted successfully. Await admin approval.",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Server error",
    });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check email + password provided
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password required"
      });
    }

    //find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "User does not exist"
      });
    }

    //compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    //generate token
    const token = generateToken(user._id);

    //send response
    return res.status(200).json({
      message: "Login successful",
      token
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    });
  }
};

export const forgotPassword = async (req, res) =>{
  try {
    const {email} = req.body;

    //email field check
    if(!email){
      return res.status(400).json({
        message: "Enter an email"
      })
    }
    if(!email.includes("@") || !email.includes(".")){
      return res.status(400).json({
        message: "Invalid email"
      })
    }
    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({
        message: "User not found"
      })
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    //hash the otp
    const saltRounds = 10;
    const hashedOtp = await bcrypt.hash(otp.toString(), saltRounds);

    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = otpExpiry;

    await user.save();

    console.log("RESET OTP:", otp); //temp until nodemailer connected

    return res.status(200).json({
      message: "OTP sent to email"
    });

  } catch (error) {    
    return res.status(500).json({
      message: "Server error"
    })
  }
}

export const verifyOTP = async (req, res) =>{
  try {
    const { email, otp} = req.body;
    
    if(!otp || otp.length !== 6){
      return res.status(400).json({
        message: "Enter a valid 6 digit OTP"
      })
    }

    const user = await User.findOne({email});

    if(!user || !user.resetOtp) {
      return res.status(400).json({
        message: "Invalid request"
      });
    }

    const isOtpValid = await bcrypt.compare(otp, user.resetOtp);
    if(!isOtpValid){
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    return res.status(200).json({
      message: "OTP verified"
    });    

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}

export const createNewPass = async(req, res) =>{
  try {
    const { email, pass, confirmPass} = req.body;

    if(!pass || !confirmPass){
      return res.status(400).json({
        message: "Enter password"
      })
    }

    const hasNumber = /\d/.test(pass);
    if (!pass || pass.length < 6 || !hasNumber) {
      return res.status(400).json({
        message: "Password must be at least 6 characters and contain a number"
      });
    }

    if(pass !== confirmPass){
      return res.status(400).json({
        message: "Passwords do not match"
      })
    }

    const user = await User.findOne({email});
    if(!user){
      return res.status(404).json({
        message: "User not found"
      })
    }

    const saltRounds = 10;
    const hashedPass = await bcrypt.hash(pass, saltRounds);

    user.password = hashedPass;

    await user.save();

    return res.status(200).json({
      message: "Password reset done"
    })

  } catch (error) {
    return res.status(500).json({
      message: "Server error"
    })
  }
}

