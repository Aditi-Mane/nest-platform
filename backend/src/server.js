import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import connectDB from "./config/db.js"

dotenv.config()
connectDB()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/",(req, res)=>{
  res.send("NEST backend is currently running")
})

const PORT = process.env.PORT
app.listen(PORT,()=>{
  console.log(`Server is running on ${PORT}`);
})