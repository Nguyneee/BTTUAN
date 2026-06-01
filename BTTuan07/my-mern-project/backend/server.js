const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const { errorHandler } = require("./middleware/error.middleware");

// Load environment variables
dotenv.config();

const app = express();

// ---------- Security & Logging ----------
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ---------- Routes ----------
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/categories", require("./routes/categoryRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "TechStore API is running 🚀", env: process.env.NODE_ENV });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: `Route ${req.originalUrl} not found` } });
});

// ---------- Global Error Handler (must be last) ----------
app.use(errorHandler);

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  // Start auto-confirm job for pending orders
  const { startAutoConfirmJob } = require('./jobs/autoConfirmOrders');
  startAutoConfirmJob();

  app.listen(PORT, () => {
    console.log(`🚀 TechStore API running on http://localhost:${PORT}`);
  });
});

