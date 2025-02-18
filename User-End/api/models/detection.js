const mongoose = require("mongoose");

// Define the schema for detections
const detectionSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    image: {
      type: Buffer, // Use Buffer for binary image data
      required: false, // Set to false if it's optional
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
