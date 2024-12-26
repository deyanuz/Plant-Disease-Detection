const express = require("express");
const mongoose = require("mongoose");
const adminAuthRoutes = require("./adminAuth"); // Admin authentication routes
const cors = require("cors");

const app = express();
const port = 9000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());



mongoose
  .connect(
    "mongodb+srv://khansumzunofficial:1234@plant-disease.opjv1.mongodb.net/plant-disease?retryWrites=true&w=majority",
    { dbName: "plant-disease" } // Explicitly define the database name
  )
  .then(() => console.log("MongoDB connected for admin"))
  .catch((error) => console.error("MongoDB connection error:", error));


// Admin Authentication Routes
app.use("/admin", adminAuthRoutes);

app.listen(port, () => console.log(`Server running on port ${port}`));
