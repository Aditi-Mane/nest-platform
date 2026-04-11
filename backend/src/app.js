import express from "express";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  req.user = { _id: "123", availableRoles: ["buyer"] };
  next();
});
// routes
app.use("/api/users", userRoutes);

export default app;