const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Admin Schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Enforce a minimum password length
  },
  isPrimary: {
    type: Boolean,
    default: false, // Only the first admin will have this set to true
  },
});

// Hash the password before saving the admin
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // Skip if password is not modified
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Create the model with the name "admins"
const Admin = mongoose.model("admins", adminSchema);
module.exports = Admin;
