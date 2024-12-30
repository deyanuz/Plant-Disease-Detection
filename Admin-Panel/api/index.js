const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/product");

const app = express();
const port = 9000;

// Middleware
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
.connect(
  "mongodb+srv://khansumzunofficial:1234@plant-disease.opjv1.mongodb.net/?retryWrites=true&w=majority&appName=plant-disease"
)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes

// Create a Product
app.post("/products", async (req, res) => {
  try {
    const { name, description, price, image, category, stock } = req.body;

    // Ensure required fields are provided
    if (!name || !price || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      image,
      category,
      stock,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch All Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Fetch a Single Product by ID
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

// Update a Product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true, // Return updated document
      runValidators: true, // Validate updates
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Delete a Product
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// Start the Server
app.listen(port, () => console.log(`Server running on port ${port}`));
