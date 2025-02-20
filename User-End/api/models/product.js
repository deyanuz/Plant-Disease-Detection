const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Product name is required"],
    trim: true,
    minlength: [2, "Product name must be at least 2 characters long"]
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    min: [0, "Price cannot be negative"]
  },
  image: {
    type: String,
    default: "https://via.placeholder.com/150"
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: {
      values: ["Jute", "Tomato", "Strawberry", "Potato", "Other"],
      message: "Invalid category. Must be one of: Jute, Tomato, Strawberry, Potato, Other"
    }
  },
  stock: {
    type: Number,
    required: true,
    min: [0, "Stock cannot be negative"],
    default: 0
  }
}, {
  timestamps: true
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
