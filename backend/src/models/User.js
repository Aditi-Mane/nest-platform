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
      required: true
    },

    collegeId: {
      type: String,
      required: true,
      unique: true
    },

    idCardImage: {
      type: String,
      required: true
    },

    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

//turns blueprint into a working object
const User = new mongoose.model("User", userSchema) //Create a model called User using this schema

export default User;