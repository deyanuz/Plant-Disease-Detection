const mongoose = require("mongoose");

// Define the schema for detections
const detectionSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    imagePath: {
      type: String,
      required: true,
    },
    predictionClass: {
      type: String,
      required: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const Detection = mongoose.model("Detection", detectionSchema);

module.exports = Detection;
