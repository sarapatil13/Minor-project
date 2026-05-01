const mongoose = require("mongoose");

const AchievementSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true // Index for faster student-based queries
  },
  type: {
    type: String,
    enum: ["paper", "event"],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: 2100,
    index: true // Index for chronological sorting/filtering
  },
  status: {
    type: String,
    enum: ["approved", "pending"],
    default: "pending"
  }
}, {
  timestamps: true // Optional improvement: tracks creation and update times
});

// Compound index for frequent queries fetching approved achievements by year
AchievementSchema.index({ studentId: 1, status: 1, year: -1 });

module.exports = mongoose.model("Achievement", AchievementSchema);