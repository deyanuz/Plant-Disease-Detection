const express = require("express");
const mongoose = require("mongoose");
const { FIREBASE_AUTH } = require("../auth/FirebaseConfig");
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
    "mongodb+srv://khansumzunofficial:1234@plant-disease.opjv1.mongodb.net/?retryWrites=true&w=majority&appName=plant-disease"
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

//endpoints for login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await signInWithEmailAndPassword(
      FIREBASE_AUTH,
      email,
      password
    );
    const firebaseUser = response.user;
    console.log(firebaseUser);

    const user = await User.findOne({ _id: firebaseUser.uid });
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    const secretKey = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign({ userID: user._id }, secretKey);
    return res.status(200).json(token);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "login error" });
  }
});
