const express = require("express");
const mongoose = require("mongoose");
const { FIREBASE_AUTH } = require("./auth/FirebaseConfig");
const User = require("./models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");

const app = express();
const port = 8000;

app.use(express.json());

mongoose
  .connect(
    "mongodb+srv://zunayedkhanofficial:1234@plant-disease-detection.ccxba.mongodb.net/?retryWrites=true&w=majority&appName=plant-disease-detection"
  )
  .then(() => console.log("connected"))
  .catch((e) => console.error(e.message));

app.listen(port, () => console.log("Server runing on port 8000"));

//endpoints for user creation
app.post("/register", async (req, res) => {
  try {
    const userData = req.body;
    console.log(userData);
    const response = await createUserWithEmailAndPassword(
      FIREBASE_AUTH,
      userData.email,
      userData.password
    );
    const firebaseUID = response.user.uid;
    const newUser = new User({
      // Setting Firebase UID as MongoDB ID
      _id: firebaseUID,
      ...userData,
    });
    await newUser.save();
    const secretKey = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign({ userID: newUser._id }, secretKey);
    res.status(200).json(token);
  } catch (error) {
    console.error(error);
    res.status(401).json({ error: "server error" });
  }
});
