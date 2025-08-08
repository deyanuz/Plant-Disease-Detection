require("dotenv").config({ path: "../../.env" });
const mongoose = require("mongoose");
const User = require("./models/user");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("MongoDB connected");

    // Test creating a user
    const testUser = new User({
      email: "test@example.com",
      password: "password123",
      firstName: "Test",
      lastName: "User",
      image: "https://cdn-icons-png.flaticon.com/128/16683/16683439.png",
    });

    await testUser.save();
    console.log("Test user created");

    // Test fetching users
    const users = await User.find({}).select("-password");
    console.log("Total users:", users.length);
    console.log("Users:", users);

    mongoose.connection.close();
  })
  .catch((error) => console.error("MongoDB connection error:", error));
