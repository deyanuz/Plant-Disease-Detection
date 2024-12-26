const mongoose = require("mongoose");
const Admin = require("./models/admin");

mongoose
  .connect(
    "mongodb+srv://khansumzunofficial:1234@plant-disease.opjv1.mongodb.net/plant-disease?retryWrites=true&w=majority",
    { dbName: "plant-disease" }
  )
  .then(async () => {
    console.log("MongoDB connected");

    const admin = new Admin({
      email: "admin@example.com", // Set desired admin email
      password: "password123",    // Set desired admin password
    });

    await admin.save();
    console.log("Admin user created");
    mongoose.connection.close();
  })
  .catch((error) => console.error("MongoDB connection error:", error));
