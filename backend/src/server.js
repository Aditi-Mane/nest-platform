import dotenv from "dotenv"
dotenv.config()

import express from "express"
import cors from "cors"
import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"

connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);


app.get("/",(req, res)=>{
  res.send("NEST backend is currently running")
})

const PORT = process.env.PORT
app.listen(PORT,()=>{
  console.log(`Server is running on ${PORT}`);
})