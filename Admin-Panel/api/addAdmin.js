require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const Admin = require("./models/admin");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    const admin = new Admin({
      email: "admin@example.com", // Set desired admin email
      password: "password123", // Set desired admin password
    });

    await admin.save();
    console.log("Admin user created");
    mongoose.connection.close();
  })
  .catch((error) => console.error("MongoDB connection error:", error));
