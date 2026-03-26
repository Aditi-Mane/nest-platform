import dotenv from "dotenv"
dotenv.config()

import path from "path"
import express from "express"
import cors from "cors"
import connectDB from "./config/db.js"

import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import productRoutes from "./routes/productRoutes.js"
import sellerRoutes from "./routes/sellerRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import cartRoutes from "./routes/cartRoutes.js"
import wishlistRoutes from "./routes/wishlistRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import orderRoutes from "./routes/orderRoutes.js"
import analyticsRoutes from "./routes/analyticsRoutes.js"
import { initSocket } from "./config/socket.js"

connectDB()

const app = express()

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/seller", sellerRoutes)
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

app.get("/",(req, res)=>{
  res.send("NEST backend is currently running")
})

const PORT = process.env.PORT
const server = app.listen(PORT,()=>{
  console.log(`Server is running on ${PORT}`);
  
  
})

initSocket(server);

