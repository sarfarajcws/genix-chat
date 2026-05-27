import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import authMiddleware from "./middleware/authMiddleware.js";
import roomRoutes from "./routes/roomRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.send("WeChat API Running");
});

app.use("/api/auth", authRoutes);

app.get(
  "/api/protected",
  authMiddleware,
  (req, res) => {

    res.json({
      message: "Protected route accessed",
      user: req.user,
    });

  }
);

app.use("/api/rooms", roomRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running");
});


export default app;