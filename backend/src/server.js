import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import productRoutes from "./routes/productRoutes.js"
// import sellerProductRoutes from "./routes/sellerproductRoutes.js"

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/products", productRoutes);



app.get("/",(req, res)=>{
  res.send("NEST backend is currently running")
})

const PORT = process.env.PORT
app.listen(PORT,()=>{
  console.log(`Server is running on ${PORT}`);
})
