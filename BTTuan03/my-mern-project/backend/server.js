const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./db");
const productRoutes = require("./routes/productRoutes");

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// ---------- Middleware ----------
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse incoming JSON request bodies

// ---------- Routes ----------
app.use("/api/products", productRoutes);

// Health-check endpoint
app.get("/", (req, res) => {
  res.json({ message: "Product Management API is running 🚀" });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
});
