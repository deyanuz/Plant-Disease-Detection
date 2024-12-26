const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const Admin = require("./models/admin"); // Admin model

const router = express.Router();
const JWT_SECRET = "af8e80f3ea01d3bfe178454c3ffa0e38f93cd977a1cfc66f0e1535a36d201384"; // Your secret key

// Admin Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { adminID: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Protected Route Example
router.get("/dashboard", (req, res) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.status(200).json({ message: "Welcome to the Admin Dashboard", admin: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
