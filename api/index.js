const express = require("express");
const mongoose = require("mongoose");
const tf = require("@tensorflow/tfjs-node");
const { FIREBASE_AUTH } = require("../auth/FirebaseConfig");
const User = require("./models/user");
const Detection = require("./models/detection");
const crypto = require("crypto");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");

const jwt = require("jsonwebtoken");
const {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  deleteUser,
} = require("firebase/auth");
const { default: axios } = require("axios");

const app = express();
const port = 8000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Load model once at startup
let model;
(async function loadModel() {
  const modelPath = "file://./tfjs_model/model.json"; // Path to model.json
  model = await tf.loadGraphModel(modelPath);
  console.log("Model loaded successfully!");
})();

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
    const user = response.user;

    // Send email verification

    await sendEmailVerification(user);
    const firebaseUID = response.user.uid;
    const newUser = new User({
      // Setting Firebase UID as MongoDB ID
      _id: firebaseUID,
      ...userData,
    });
    try {
      await newUser.save();
    } catch (error) {
      console.error(error);
      await deleteUser(user);
      return res.status(401).json({ message: "server error" });
    }
    const secretKey = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign({ userID: newUser._id }, secretKey);
    return res.status(200).json(token);
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "server error" });
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

    const user = await User.findOne({ _id: firebaseUser.uid });
    if (!user) {
      return res.status(401).json({ message: "user not found" });
    }
    const secretKey = crypto.randomBytes(32).toString("hex");
    const token = jwt.sign(
      {
        userID: user._id,
        image: user.image,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      secretKey
    );
    return res.status(200).json(token);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: "login error" });
  }
});

//endpoint for disease detection
app.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const userID = req.body.userID;

    // Move the uploaded file to the corresponding userID folder
    const tempFilePath = req.file.path;
    const newFolder = `uploads/${userID}`;
    const newFilePath = `${newFolder}/${req.file.filename}`;
    if (!fs.existsSync(newFolder)) {
      fs.mkdirSync(newFolder, { recursive: true });
    }

    console.log(tempFilePath);

    await fs.promises.rename(tempFilePath, newFilePath),
      (err) => {
        if (err) {
          console.error("Error moving file:", err);
        }
      };
    const imageBuffer = fs.readFileSync(newFilePath);
    const resizedBuffer = await sharp(imageBuffer).resize(224, 224).toBuffer();

    // Decode the resized image
    const decodedImage = tf.node.decodeImage(resizedBuffer, 3); // Decode to RGB

    // Normalize the image and add batch dimension
    const inputTensor = decodedImage.expandDims(0).toFloat().div(255.0);

    // Step 3: Make predictions
    const CLASS_NAMES = [
      "Cescospora Leaf Spot",
      "Golden Mosaic",
      "Healthy Leaf",
    ];

    const predictions = model.predict(inputTensor);

    // Step 4: Get class with the highest confidence
    const outputData = predictions.arraySync()[0];
    console.log(outputData);
    const maxIndex = outputData.indexOf(Math.max(...outputData));
    const predictedClass = CLASS_NAMES[maxIndex];
    const confidence = parseFloat((outputData[maxIndex] * 100).toFixed(3));

    //save prediction
    try {
      const detection = new Detection({
        userID: userID,
        imagePath: newFilePath,
        predictionClass: predictedClass,
        confidence: confidence,
      });

      const savedDetection = await detection.save();
      console.log("Detection saved:", savedDetection);
    } catch (error) {
      console.error("Error saving detection:", error);
      return res.status(500).json({ error: "Server error" });
    }

    // Return the class name and confidence
    console.log(predictedClass);
    return res.json({ predictedClass: predictedClass, confidence: confidence });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/:userID/detections", async (req, res) => {
  try {
    const { userID } = req.params;
    const detections = await Detection.find({ userID }); // Filter by userID
    console.log(`Detections for userID ${userID}:`, detections);

    if (!detections) {
      return res.status(400).json({ message: "No detections yet" });
    }
    return res.json(detections);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error });
  }
});
