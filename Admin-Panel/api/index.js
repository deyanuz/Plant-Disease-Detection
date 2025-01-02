const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Product = require("./models/product");
const Admin = require("./models/admins");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
const port = 9000;

// Middleware
app.use(express.json());
app.use(cors());
const router = express.Router();
const JWT_SECRET = "af8e80f3ea01d3bfe178454c3ffa0e38f93cd977a1cfc66f0e1535a36d201384"; // Your secret key

// Connect to MongoDB
mongoose
.connect(
  "mongodb+srv://khansumzunofficial:1234@plant-disease.opjv1.mongodb.net/?retryWrites=true&w=majority&appName=plant-disease"
)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));
// Middleware for authenticating JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
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
// Get All Admins
app.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});
// Add Admin
app.post("/admins", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "Email and password are required. Password must be at least 6 characters long." });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin with this email already exists" });
    }

    const isPrimary = (await Admin.countDocuments()) === 0; // First admin is primary
    const newAdmin = new Admin({ email, password, isPrimary });

    await newAdmin.save();
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ error: "Failed to create admin" });
  }
});



// Delete Admin
app.delete("/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (admin.isPrimary) {
      return res.status(400).json({ error: "Cannot delete the primary admin" });
    }

    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete admin" });
  }
});
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Directly compare the plain-text password
    if (password !== admin.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminID: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Start the Server
app.listen(port, () => console.log(`Server running on port ${port}`));
