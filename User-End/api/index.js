const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const tf = require("@tensorflow/tfjs-node");
const { FIREBASE_AUTH } = require("../auth/FirebaseConfig");
const User = require("./models/user");
const Detection = require("./models/detection");
const crypto = require("crypto");
const Product = require("./models/product");
const { HfInference } = require("@huggingface/inference");

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const Stripe = require("stripe");
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
const hf = new HfInference("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");
//stripe
const stripe = Stripe(
  "sk_test_51P9ieEFzDwwNH06pKTBJMPBXnwuX0DALPs5qwKe1REnFgNlrGfcfYzjGBapYinKyXVqujQkHNPxgyDHN3Q8btgPC00uSAdffOw"
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

const storage = multer.memoryStorage();

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
    const token = jwt.sign(
      {
        userID: newUser._id,
        image: newUser.image,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
      secretKey
    );
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

    const imageBuffer = req.file.buffer;
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
        image: resizedBuffer,
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

    // Fetch detections filtered by userID
    const detections = await Detection.find({ userID });

    if (!detections || detections.length === 0) {
      return res.json({ message: "No detections yet" });
    }

    // Transform detections to include Base64-encoded images
    const detectionsWithImages = detections.map((detection) => {
      return {
        _id: detection._id,
        userID: detection.userID,
        predictionClass: detection.predictionClass,
        confidence: detection.confidence,
        image: detection.image
          ? `data:image/jpeg;base64,${detection.image.toString("base64")}` // Adjust MIME type if needed
          : null,
        createdAt: detection.createdAt,
        updatedAt: detection.updatedAt,
      };
    });

    return res.json(detectionsWithImages);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
});

//delete history
app.delete("/:userID/detections/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete detections for the specified userID
    const result = await Detection.deleteOne({ _id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No detections found to delete" });
    }

    return res.status(200).json({ message: "Detection deleted successfully" });
  } catch (error) {
    console.error("Error deleting history:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Endpoint to Create Payment Intent
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body; // Amount in cents (e.g., 2000 = $20.00)

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd", // Replace with your currency (e.g., "usd", "inr", etc.)
      payment_method_types: ["card"],
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({ error: "Error creating payment intent" });
  }
});

//getallproduct
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    console.log(products);
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});
//get single product by id
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error.message);
    res.status(500).json({ error: "Failed to fetch product" });
  }
});
//update product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true, // Returns the updated document
      runValidators: true, // Validates the updates against the schema
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});
//delete product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true, // Returns the updated document
      runValidators: true, // Validates the updates against the schema
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error.message);
    res.status(500).json({ error: "Failed to update product" });
  }
});

app.post("/chatbot", async (req, res) => {
  const { question } = req.body;
  console.log(question);
  try {
    const response = await hf.textGeneration({
      model: "facebook/blenderbot-400M-distill",
      inputs: question,
      parameters: {
        max_length: 100,
        min_length: 10,
        temperature: 0.7,
        top_k: 50,
        top_p: 0.9,
        repetition_penalty: 1.2,
      },
    });

    res.json({ response: response.generated_text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
