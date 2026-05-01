require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// PORT CONFIG
const PORT = process.env.PORT || 5000;

// PRE-FLIGHT ENVIRONMENT CHECKS
if (!process.env.MONGO_URI) {
  console.error("CRITICAL ERROR: MONGO_URI is missing from .env file.");
  console.error("Please add MONGO_URI to your .env file and restart the server.");
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.warn("WARNING: OPENAI_API_KEY is missing from .env file.");
  console.warn("The system will use the local fallback engine for AI enhancements.");
}

// DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB successfully connected"))
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("Please verify your MONGO_URI and ensure your IP is whitelisted.");
    process.exit(1); // Exit if DB connection fails
  });

// API ROUTES
app.use("/portfolio", require("./routes/portfolio"));

// HEALTH CHECK ROUTE
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Smart Portfolio Maker API is running.",
    timestamp: new Date().toISOString()
  });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});