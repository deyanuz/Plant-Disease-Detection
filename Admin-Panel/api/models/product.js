const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Ensure non-negative price
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/150", // Default image URL
  },
  category: {
    type: String,
    required: true,
    enum: ["Jute", "Tomato", "Strawberry", "Potato", "Other"], // Allowed categories
    default: "Other",
  },
  stock: {
    type: Number,
    required: true,
    min: 0, // Ensure non-negative stock
    default: 0,
  },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
