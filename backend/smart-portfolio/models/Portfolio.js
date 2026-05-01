const mongoose = require("mongoose");

const PortfolioSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Portfolio", PortfolioSchema);