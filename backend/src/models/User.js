import mongoose from "mongoose"

//blueprint of how user looks
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    collegeId: {
      type: String,
      unique: true, //prevents duplicate prn
      sparse: true //ignore unique if value is missing
    },

    idCardImage: {
      type: String,
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    role: {
      type: String,
      enum: ["student", "business", "admin"],
      default: null
    },

    isRoleSet: {
      type: Boolean,
      default: false
    },

    resetOtp: {
      type: String
    },

    resetOtpExpiry: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

//turns blueprint into a working object
const User = new mongoose.model("User", userSchema) //Create a model called User using this schema

export default User;