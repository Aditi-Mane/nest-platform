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


    collegeName: {
      type: String,
      trim: true,
      default: "",
    },

    // Cached average rating (updated via Review post-save hook after taking review)
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    // Cached total review count (updated via Review post-save hook after taking review)
    reviewCount: {
      type: Number,
      default: 0,
    },

    // Cached sold items count (incremented when product.status → "sold")
    itemsSold: {
      type: Number,
      default: 0,
    },

    // e.g. "Within 1 hour", "Within a day" — seller can set this
    responseTime: {
      type: String,
      default: "Within a day",
      trim: true,
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