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
  "sk_test_51RrapwF3HAo508cL8jqApLDRKeGo5j7PWkpyvPGiod6QiHUuHuSc5XYi2ESqQd5diyb7zSulAPMgdoh7ATVwyDvg002dMXj9Xr"
);
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
const ChatHistory = require("./models/chatHistory");

const app = express();
const port = 8000;
const hf = new HfInference("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");

// JWT Secret Key - Use a consistent secret key
const JWT_SECRET = "plant-disease-detection-secret-key-2024";

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

app.listen(port, "0.0.0.0", () => console.log("Server runing on port 8000"));

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
      JWT_SECRET
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
      JWT_SECRET
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
    const forceDetection = req.body.forceDetection === "true";
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
    console.log(predictions_leaf_clf.arraySync());

    // If not a leaf and force detection is not enabled, return early
    if (predictedClass_leaf_clf !== "Leaf" && !forceDetection) {
      return res.status(201).json({
        predictedClass: "Not a leaf",
        confidence: confidence_leaf_clf,
        leafClassifierResult: predictedClass_leaf_clf,
        leafClassifierConfidence: confidence_leaf_clf,
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
    console.log(predictedClass_leaf_clf);

    const response = {
      predictedClass: predictedClass,
      confidence: confidence,
    };

    // Include leaf classifier info if force detection was used
    if (forceDetection && predictedClass_leaf_clf !== "Leaf") {
      response.leafClassifierResult = predictedClass_leaf_clf;
      response.leafClassifierConfidence = confidence_leaf_clf;
      response.forceDetectionUsed = true;
    }

    return res.json(response);
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
      contactNumber: order.contactNumber,
      shippingAddress: order.shippingAddress,
      paymentStatus: order.paymentStatus,
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
    const {
      amount,
      currency = "usd",
      paymentMethodTypes = ["card"],
    } = req.body;
    console.log("Received payment request:", {
      amount,
      currency,
      paymentMethodTypes,
    });

    // Validate amount
    if (!amount || amount <= 0) {
      console.error("Invalid amount received:", amount);
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be greater than 0",
      });
    }

    // Validate currency
    const validCurrencies = ["usd", "eur", "gbp", "cad", "aud"];
    if (!validCurrencies.includes(currency.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid currency",
        message: "Currency not supported",
      });
    }

    // Create payment intent with simplified configuration
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      payment_method_types: paymentMethodTypes,
      metadata: {
        source: "plant_disease_app",
        timestamp: new Date().toISOString(),
      },
      description: `Plant Disease Store - Order Payment`,
    });

    console.log("Payment intent created successfully:", {
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);

    // Handle specific Stripe errors
    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).json({
        error: "Invalid payment request",
        message: error.message,
      });
    }

    if (error.type === "StripeAuthenticationError") {
      return res.status(500).json({
        error: "Payment service authentication failed",
        message: "Please try again later",
      });
    }

    res.status(500).json({
      error: "Payment initialization failed",
      message: "Unable to process payment request. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Payment confirmation endpoint
app.post("/confirm-payment", async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({
        error: "Payment intent ID is required",
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === "succeeded") {
      res.json({
        success: true,
        paymentIntent: paymentIntent,
        message: "Payment confirmed successfully",
      });
    } else {
      res.json({
        success: false,
        status: paymentIntent.status,
        message: "Payment not completed",
      });
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).json({
      error: "Payment confirmation failed",
      message: "Unable to confirm payment status",
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
  const { question, userID } = req.body;
  console.log("Chatbot question:", question);
  console.log("User ID:", userID);

  try {
    // Using Google Gemini API
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    // Initialize Gemini (you'll need to set your API key)
    const genAI = new GoogleGenerativeAI(
      "AIzaSyBH6s86iQs4RMWQHTwT4UGa-eSBD8hDz3I"
    );

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create a context for plant disease detection
    const context = `You are a helpful AI assistant specializing in plant disease detection and agricultural advice. 
    Your expertise includes identifying and providing information about various plant diseases such as: 
          - Cercospora Leaf Spot  
          - Corn (maize) – Common Rust  
          - Corn (maize) – Northern Leaf Blight  
          - Corn (maize) – Healthy  
          - Golden Mosaic  
          - Healthy Jute Leaf  
          - Healthy Rice  
          - Leaf Blast  
          - Rice Hispa

    When a plant image or disease name is provided, respond with a concise yet informative summary including:
          - Common symptoms  
          - Likely cause(s)  
          - Preventive measures  
          - Recommended treatments or remedies
    If the plant is healthy, confirm that and optionally offer general care tips.
    Keep responses brief but useful for farmers, agronomists, or agricultural app users.`;

    // Generate response
    const result = await model.generateContent([context, question]);
    const response = await result.response;
    const text = response.text();

    console.log("Gemini response:", text);

    // Save chat history to MongoDB
    if (userID) {
      try {
        const chatEntry = new ChatHistory({
          userID: userID,
          question: question,
          answer: text,
        });
        await chatEntry.save();
        console.log("Chat history saved successfully");
      } catch (saveError) {
        console.error("Error saving chat history:", saveError);
        // Don't fail the request if saving chat history fails
      }
    }

    return res.json({ response: text });
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({
      error: "Failed to generate response",
      details: err.message,
    });
  }
});

// Get chat history for a user
app.get("/chat-history/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const skip = (page - 1) * limit;

    const chatHistory = await ChatHistory.find({ userID })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalCount = await ChatHistory.countDocuments({ userID });

    res.json({
      chatHistory,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
});

// Delete specific chat entry
app.delete("/chat-history/:entryId", async (req, res) => {
  try {
    const { entryId } = req.params;
    const deletedEntry = await ChatHistory.findByIdAndDelete(entryId);

    if (!deletedEntry) {
      return res.status(404).json({ error: "Chat entry not found" });
    }

    res.json({ message: "Chat entry deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat entry:", error);
    res.status(500).json({ error: "Failed to delete chat entry" });
  }
});

// Delete all chat history for a user
app.delete("/chat-history/user/:userID", async (req, res) => {
  try {
    const { userID } = req.params;
    const result = await ChatHistory.deleteMany({ userID });

    res.json({
      message: "All chat history deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting user chat history:", error);
    res.status(500).json({ error: "Failed to delete chat history" });
  }
});

app.post("/orders", async (req, res) => {
  try {
    const {
      userID,
      products,
      totalAmount,
      paymentStatus,
      contactNumber,
      shippingAddress,
      status,
    } = req.body;

    // Validate required fields
    if (!userID || !products || !totalAmount) {
      return res.status(400).json({
        error: "Missing required fields",
        message: "userID, products, and totalAmount are required",
      });
    }

    // Validate shipping information
    if (!contactNumber || !shippingAddress) {
      return res.status(400).json({
        error: "Missing shipping information",
        message: "contactNumber and shippingAddress are required",
      });
    }

    const order = new Order({
      userID,
      products,
      totalAmount,
      paymentStatus: paymentStatus || "pending",
      contactNumber,
      shippingAddress,
      status,
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

// Test endpoint
app.get("/test", (req, res) => {
  res.json({ message: "API server is running!", timestamp: new Date().toISOString() });
});

// Update user profile endpoint
app.put("/update-profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "No token provided" });
    }

    console.log("Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userID;
    console.log("Token verified for user:", userId);

    const { firstName, lastName, email, phone, dateOfBirth } = req.body;
    console.log("Received profile data:", { firstName, lastName, email, phone, dateOfBirth });

    // Validate required fields
    if (!firstName || !email) {
      console.log("Missing required fields");
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "firstName and email are required" 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await User.findOne({ 
      email: email, 
      _id: { $ne: userId } 
    });
    
    if (existingUser) {
      console.log("Email already exists:", email);
      return res.status(400).json({ 
        error: "Email already exists",
        message: "This email is already registered by another user" 
      });
    }

    console.log("Updating user in database...");
    // Update user in MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        firstName,
        lastName,
        email,
        phone: phone || "",
        dateOfBirth: dateOfBirth || "",
      },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User updated successfully:", updatedUser._id);

    // Generate new token with updated information
    const newToken = jwt.sign(
      {
        userID: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        image: updatedUser.image,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("New token generated");

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        phone: updatedUser.phone,
        dateOfBirth: updatedUser.dateOfBirth,
        image: updatedUser.image,
      },
      token: newToken,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Upload profile image endpoint
app.post("/upload-profile-image", upload.single("image"), async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      console.log("No token provided for image upload");
      return res.status(401).json({ error: "No token provided" });
    }

    console.log("Verifying token for image upload...");
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userID;
    console.log("Token verified for user:", userId);

    if (!req.file) {
      console.log("No image file provided");
      return res.status(400).json({ error: "No image file provided" });
    }

    console.log("Processing image...");
    // Process the image with sharp
    const processedImageBuffer = await sharp(req.file.buffer)
      .resize(300, 300, { fit: "cover" })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const filename = `profile-${userId}-${Date.now()}.jpg`;
    const uploadPath = path.join(__dirname, "uploads", filename);
    console.log("Saving image to:", uploadPath);

    // Save the processed image
    await fs.promises.writeFile(uploadPath, processedImageBuffer);
    console.log("Image saved successfully");

    // Update user's image in database
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    console.log("Image URL:", imageUrl);
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { image: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      console.log("User not found for image update:", userId);
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User image updated successfully");

    // Generate new token with updated image
    const newToken = jwt.sign(
      {
        userID: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        image: updatedUser.image,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("New token generated for image update");

    res.json({
      message: "Profile image updated successfully",
      imageUrl: updatedUser.image,
      token: newToken,
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    res.status(500).json({ error: "Failed to upload profile image" });
  }
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
