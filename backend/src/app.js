import express from "express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  if (req.headers["x-test-user"]) {
    req.user = JSON.parse(req.headers["x-test-user"]);
  } else {
    req.user = { _id: "123", availableRoles: ["buyer"] };
  }
  next();
});
// routes
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/auth", authRoutes); 

export default app;