require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const Admin = require("./models/admins");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Test creating an admin
    const testAdmin = new Admin({
      email: "testadmin@example.com",
      password: "password123",
    });

    await testAdmin.save();
    console.log("Test admin created:", {
      _id: testAdmin._id,
      email: testAdmin.email,
      isPrimary: testAdmin.isPrimary,
    });

    // Test fetching admins
    const admins = await Admin.find({}).select("-password");
    console.log("Total admins:", admins.length);
    console.log("Admins:", admins);

    mongoose.connection.close();
  })
  .catch((error) => console.error("MongoDB connection error:", error));
