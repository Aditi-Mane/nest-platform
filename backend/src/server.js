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
import ventureRoutes from "./routes/ventureRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";   
import notificationRoutes from "./routes/notificationRoutes.js";
import salesPredictionRoutes from "./routes/salesPredictionRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";
 

// connectDB()
const PORT = process.env.PORT || 5000;

const app = express()

const allowedOrigins = [
  "http://localhost:5173",
  "https://main.d2s3j9j85nw93c.amplifyapp.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); 
    } else {
      return callback(null, false);
    }
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

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
app.use("/api/ventures",      ventureRoutes);
app.use("/api/applications",  applicationRoutes);   // separate prefix — fixes the /mine bug
app.use("/api/notifications", notificationRoutes);
app.use("/api/sales-analytics", salesPredictionRoutes);
app.use("/api/complaints", complaintRoutes);

app.get("/",(req, res)=>{
  res.send("NEST backend is currently running")
})

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const start = async () => {
  try {
    await connectDB(); 

    const server = app.listen(PORT, () => {
      console.log(`Server running on ${PORT}`);
    });

    initSocket(server);

  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

start(); 

export default app;