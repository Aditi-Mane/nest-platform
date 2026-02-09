import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId }, //payload: data stored, backend later extracts it
    process.env.JWT_SECRET, //secret: for secure sign in
    {
      expiresIn: process.env.JWT_EXPIRE //header: expiry date of token
    }
  );
};
