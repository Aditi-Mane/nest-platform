import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) =>{
  try {
    let token;
    //check headers
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
      token = req.headers.authorization.split(" ")[1]; //"Bearer token..."
    }

    //no token
    if (!token) {
      return res.status(401).json({
        message: "Not authorized, token missing"
      });
    }

    //verify token with JWT_SECRET key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //get user from db
    req.user = await User.findById(decoded.id).select("-password"); //do not include password info

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Not authorized, token invalid"
    });
  }
}