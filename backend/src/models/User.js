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

    avatar: {
      type: String,
      default: ""
    },

    collegeId: {
      type: String,
      unique: true, //prevents duplicate prn
      sparse: true //ignore unique if value is missing
    },

    idCardImage: {
      type: String,
    },

    //verification Lifecycle
    verificationStatus: {
      type: String,
      enum: ["email_verified","pending", "under_review", "approved", "rejected"],
      default: "pending"
    },

    //roles user has access to
    availableRoles: {
      type: [String],
      enum: ["buyer", "seller", "admin"],
      default: []
    },

    //currently active role
    activeRole: {
      type: String,
      enum: ["buyer", "seller", "admin"],
      default: null
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    sellerStatus: {
      type: String,
      enum: ["none", "pending", "active"],
      default: "none",
    },

    //seller Info
    storeName: { type: String, trim: true },
    storeDescription: { type: String, trim: true },
    storeLogo: { type: String },
    storeLocation: { type: String, trim: true },
    payoutUPI: { type: String, trim: true },

    verificationOtp: {
      type: String
    },

    verificationOtpExpiry: {
      type: Date
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