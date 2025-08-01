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
const Order = require("./models/order");
const stripe = require("stripe")(
  "sk_test_51P9ieEFzDwwNH06pKTBJMPBXnwuX0DALPs5qwKe1REnFgNlrGfcfYzjGBapYinKyXVqujQkHNPxgyDHN3Q8btgPC00uSAdffOw"
);

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
  sendPasswordResetEmail,
} = require("firebase/auth");
const { default: axios } = require("axios");

const app = express();
const port = 8000;
const hf = new HfInference("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");

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
let leafClf;
(async function loadLeafClf() {
  const modelPath = "file://./leafClf/model.json"; // Path to model.json
  leafClf = await tf.loadGraphModel(modelPath);
  console.log("Leaf Clf Model loaded successfully!");
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

    // Remove password from userData before saving to MongoDB
    const { password, ...userDataWithoutPassword } = userData;

    const newUser = new User({
      // Setting Firebase UID as MongoDB ID
      _id: firebaseUID,
      ...userDataWithoutPassword,
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
  let decodedImageLeaf,
    inputTensorLeaf,
    decodedImageDisease,
    inputTensorDisease;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file uploaded" });
    }
    const userID = req.body.userID;
    if (!userID) {
      return res.status(400).json({ error: "userID is required" });
    }
    const imageBuffer = req.file.buffer;

    // 1. Leaf classifier: resize to 224x224
    const resizedBufferLeaf = await sharp(imageBuffer)
      .resize(224, 224)
      .toBuffer();
    decodedImageLeaf = tf.node.decodeImage(resizedBufferLeaf, 3);
    inputTensorLeaf = decodedImageLeaf.expandDims(0).toFloat();

    // Check if models are loaded
    if (!leafClf || !model) {
      return res.status(503).json({ error: "Models not loaded yet" });
    }

    // 2. Run leaf classifier
    const CLASS_NAMES_LEAF_CLF = ["Leaf", "Not Leaf"];
    const predictions_leaf_clf = leafClf.predict(inputTensorLeaf);
    const outputData_leaf_clf = predictions_leaf_clf.arraySync()[0];
    const maxIndex_leaf_clf = outputData_leaf_clf.indexOf(
      Math.max(...outputData_leaf_clf)
    );
    const confidence_leaf_clf = parseFloat(
      (outputData_leaf_clf[maxIndex_leaf_clf] * 100).toFixed(3)
    );
    const predictedClass_leaf_clf = CLASS_NAMES_LEAF_CLF[maxIndex_leaf_clf];
    console.log(predictedClass_leaf_clf);

    if (predictedClass_leaf_clf !== "Leaf") {
      return res.status(201).json({
        predictedClass: "Not a leaf",
        confidence: confidence_leaf_clf,
      });
    }

    // 3. Disease classifier: resize to 256x256
    const resizedBufferDisease = await sharp(imageBuffer)
      .resize(256, 256)
      .toBuffer();
    decodedImageDisease = tf.node.decodeImage(resizedBufferDisease, 3);
    inputTensorDisease = decodedImageDisease.expandDims(0).toFloat();

    // 4. Run disease classifier
    const CLASS_NAMES = [
      "Cescospora Leaf Spot",
      "Corn_(maize)___Common_rust_",
      "Corn_(maize)___Northern_Leaf_Blight",
      "Corn_(maize)___healthy",
      "Golden Mosaic",
      "Healthy Jute Leaf",
      "healthy rice",
      "leaf_blast",
      "rice_hispa",
    ];
    const predictions = model.predict(inputTensorDisease);
    const outputData = predictions.arraySync()[0];
    console.log(outputData);
    const maxIndex = outputData.indexOf(Math.max(...outputData));
    const predictedClass = CLASS_NAMES[maxIndex];
    const confidence = parseFloat((outputData[maxIndex] * 100).toFixed(3));

    // Save prediction
    try {
      const detection = new Detection({
        userID: userID,
        image: resizedBufferDisease,
        predictionClass: predictedClass,
        confidence: confidence,
      });
      const savedDetection = await detection.save();
      console.log("Detection saved:", savedDetection);
    } catch (error) {
      console.error("Error saving detection:", error);
      return res.status(500).json({ error: "Failed to save detection" });
    }

    // Return the class name and confidence
    console.log(predictedClass);
    return res.json({ predictedClass: predictedClass, confidence: confidence });
  } catch (error) {
    console.error("Error during file upload:", error);
    res.status(500).json({ error: "Server error" });
  } finally {
    // Clean up tensors to prevent memory leaks
    if (decodedImageLeaf) decodedImageLeaf.dispose();
    if (inputTensorLeaf) inputTensorLeaf.dispose();
    if (decodedImageDisease) decodedImageDisease.dispose();
    if (inputTensorDisease) inputTensorDisease.dispose();
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

app.get("/:userID/orders", async (req, res) => {
  try {
    const { userID } = req.params;

    // Fetch detections filtered by userID
    const orders = await Order.find({ userID });

    if (!orders || orders.length === 0) {
      return res.json({ message: "No orders yet" });
    }

    // Transform orders to include necessary attributes based on schema
    const ordersWithDetails = orders.map((order) => ({
      _id: order._id,
      userID: order.userID,
      products: order.products.map((product) => ({
        productId: product.productId,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
      })),
      totalAmount: order.totalAmount,
      status: order.status,
      orderDate: order.orderDate,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    return res.json(ordersWithDetails);
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

// Create Payment Intent endpoint
app.post("/create-payment-intent", async (req, res) => {
  try {
    const { amount } = req.body;
    console.log("Received amount:", amount);

    if (!amount || amount <= 0) {
      console.error("Invalid amount received:", amount);
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Create payment intent with simplified configuration
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: "usd",
      payment_method_types: ["card"],
    });

    console.log("Payment intent created:", paymentIntent.id);

    res.json({
      paymentIntent: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).json({
      error: "Payment initialization failed",
      details: error.message,
    });
  }
});

//getallproduct
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
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

app.post("/orders", async (req, res) => {
  try {
    const { userID, products, totalAmount, paymentStatus } = req.body;

    const order = new Order({
      userID,
      products,
      totalAmount,
      paymentStatus: paymentStatus || "pending",
    });

    const savedOrder = await order.save();
    console.log("Order created:", savedOrder._id);
    res.status(200).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Reset password endpoint
app.post("/reset-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    await sendPasswordResetEmail(FIREBASE_AUTH, email);

    return res
      .status(200)
      .json({ message: "Password reset email sent successfully" });
  } catch (error) {
    console.error("Error sending password reset email:", error);
    return res
      .status(500)
      .json({ error: "Failed to send password reset email" });
  }
});
