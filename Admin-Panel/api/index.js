const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("./models/product");
const Admin = require("./models/admins");
const Order = require("./models/order");
const Notification = require("./models/notification");
const User = require("./models/user");
const Detection = require("./models/detection");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const app = express();
const port = 9000;

// Middleware
app.use(express.json());
app.use(cors());
const router = express.Router();
const JWT_SECRET =
  "af8e80f3ea01d3bfe178454c3ffa0e38f93cd977a1cfc66f0e1535a36d201384"; // Your secret key

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// Serve static files from uploads directory
app.use("/uploads", express.static(uploadsDir));

// Order status constants
const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://khansumzunofficial:1234@plant-disease.opjv1.mongodb.net/?retryWrites=true&w=majority&appName=plant-disease"
  )
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection error:", error));
// Middleware for authenticating JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(403).json({ message: "Token required" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};
// Routes

// Upload Image
app.post("/upload-image", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Read the file and convert to buffer
    const imageBuffer = fs.readFileSync(req.file.path);
    const contentType = req.file.mimetype;

    // Delete the temporary file
    fs.unlinkSync(req.file.path);

    console.log("Image processed successfully");
    res.status(200).json({
      success: true,
      imageBuffer: imageBuffer.toString("base64"),
      contentType: contentType,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Serve product image
app.get("/product-image/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.image || !product.image.data) {
      return res.status(404).json({ error: "Image not found" });
    }

    res.set("Content-Type", product.image.contentType);
    res.send(product.image.data);
  } catch (error) {
    console.error("Error serving product image:", error);
    res.status(500).json({ error: "Failed to serve image" });
  }
});

// Create a Product
app.post("/products", async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      stock,
      imageBuffer,
      contentType,
    } = req.body;

    // Enhanced validation
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Valid product name is required" });
    }

    if (!price || isNaN(price) || price < 0) {
      return res.status(400).json({ error: "Valid price is required" });
    }

    if (
      !category ||
      typeof category !== "string" ||
      category.trim().length === 0
    ) {
      return res.status(400).json({ error: "Valid category is required" });
    }

    // Validate against allowed categories
    const allowedCategories = ["Jute", "Corn", "Rice", "Other"];
    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        error:
          "Invalid category. Allowed categories: " +
          allowedCategories.join(", "),
      });
    }

    // Validate image data
    if (!imageBuffer || !contentType) {
      return res.status(400).json({ error: "Image data is required" });
    }

    // Convert base64 string back to buffer
    const imageData = Buffer.from(imageBuffer, "base64");

    // Create new product with sanitized data
    const newProduct = new Product({
      name: name.trim(),
      description: description ? description.trim() : "",
      price: parseFloat(price),
      category: category.trim(),
      stock: parseInt(stock) || 0,
      image: {
        data: imageData,
        contentType: contentType,
      },
    });

    console.log("Attempting to save product:", newProduct);
    const savedProduct = await newProduct.save();
    console.log("Product saved successfully:", savedProduct);

    // Add notification for admin
    await createNotification(
      "🆕 New Product Added",
      `${savedProduct.name} has been added to the store - $${savedProduct.price}`,
      "product",
      true
    );

    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Server error creating product:", error);

    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    // Handle other errors
    res.status(500).json({
      error: "Failed to create product",
      details: error.message,
    });
  }
});

// Fetch All Products
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error.message);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// Fetch a Single Product by ID
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

// Update a Product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true, // Return updated document
      runValidators: true, // Validate updates
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

// Delete a Product
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ error: "Failed to delete product" });
  }
});
// Get All Admins
app.get("/admins", async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ error: "Failed to fetch admins" });
  }
});
// Add Admin
app.post("/admins", async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Received admin creation request:", {
      email,
      password: password ? "***" : "undefined",
    });

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid email address." });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ error: "Admin with this email already exists" });
    }

    const isPrimary = (await Admin.countDocuments()) === 0; // First admin is primary
    const newAdmin = new Admin({
      email: email.toLowerCase().trim(),
      password,
      isPrimary,
    });

    console.log("Attempting to save admin:", {
      email: newAdmin.email,
      isPrimary: newAdmin.isPrimary,
    });
    await newAdmin.save();

    // Don't send password in response
    const adminResponse = {
      _id: newAdmin._id,
      email: newAdmin.email,
      isPrimary: newAdmin.isPrimary,
      createdAt: newAdmin.createdAt,
    };

    console.log("Admin created successfully:", adminResponse);
    res.status(201).json(adminResponse);
  } catch (error) {
    console.error("Error creating admin:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Validation error",
        details: Object.values(error.errors).map((err) => err.message),
      });
    }

    res
      .status(500)
      .json({ error: "Failed to create admin", details: error.message });
  }
});

// Delete Admin
app.delete("/admins/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await Admin.findById(id);

    if (admin.isPrimary) {
      return res.status(400).json({ error: "Cannot delete the primary admin" });
    }

    await Admin.findByIdAndDelete(id);
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete admin" });
  }
});
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    console.log(admin.password);
    console.log(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminID: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all orders with user information
app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });

    // Get user information for each order
    const ordersWithUserInfo = await Promise.all(
      orders.map(async (order) => {
        try {
          const user = await User.findById(order.userID);
          return {
            ...order.toObject(),
            customerName: user
              ? `${user.firstName} ${user.lastName}`.trim()
              : "Unknown User",
            customerEmail: user ? user.email : "N/A",
            customerImage: user ? user.image : null,
          };
        } catch (error) {
          console.error(`Error fetching user for order ${order._id}:`, error);
          return {
            ...order.toObject(),
            customerName: "Unknown User",
            customerEmail: "N/A",
            customerImage: null,
          };
        }
      })
    );

    res.json(ordersWithUserInfo);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Update order status with notification
app.put("/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Get user information for notification
    const user = await User.findById(updatedOrder.userID);
    const customerName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "Unknown Customer";

    // Create notification for admin
    await createNotification(
      `📦 Order Status Updated`,
      `Order #${updatedOrder._id
        .toString()
        .slice(-6)} from ${customerName} is now ${status}`,
      "order",
      true
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Get order by ID
app.get("/orders/:id", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

// Add this new endpoint
app.get("/dashboard/stats", async (req, res) => {
  try {
    const [
      totalAdmins,
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      notifications,
    ] = await Promise.all([
      Admin.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Order.countDocuments({ status: "Paid" }), // Changed from 'Pending' to 'Paid' to match our status
      Notification.countDocuments({ forAdmin: true, isRead: false }),
    ]);

    res.json({
      totalAdmins,
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      notifications,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard stats" });
  }
});

// Get all users with detection and order counts
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({})
      .select("-password") // Exclude password from response
      .sort({ createdAt: -1 });

    // Get detection and order counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const userId = user._id || user.id;
        const detectionCount = await Detection.countDocuments({
          userID: userId,
        });
        const orderCount = await Order.countDocuments({ userID: userId });

        return {
          ...user.toObject(),
          detectionCount,
          orderCount,
        };
      })
    );

    res.json({
      success: true,
      users: usersWithStats,
      total: usersWithStats.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});

// Add new user registration notification endpoint
app.post("/api/user-registered", async (req, res) => {
  try {
    const { userID, firstName, lastName, email } = req.body;

    // Create notification for admin
    await createNotification(
      "👤 New User Registered",
      `${firstName} ${lastName} (${email}) has joined the platform`,
      "admin",
      true
    );

    res.json({ success: true, message: "Notification created" });
  } catch (error) {
    console.error("Error creating user registration notification:", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// Get notifications
app.get("/notifications", async (req, res) => {
  try {
    const notifications = await Notification.find({ forAdmin: true }).sort({
      createdAt: -1,
    });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
app.put("/notifications/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    res.json(notification);
  } catch (error) {
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// Create notification helper function
const createNotification = async (title, message, type, forAdmin = false) => {
  try {
    const notification = new Notification({
      title,
      message,
      type,
      forAdmin,
    });
    await notification.save();
    console.log(`✅ Notification created: ${title} - ${message}`);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
  }
};

// Create Order endpoint with notification
app.post("/orders", async (req, res) => {
  try {
    const { userID, products, totalAmount, shippingAddress, contactNumber } =
      req.body;

    // Validate required fields
    if (
      !userID ||
      !products ||
      !totalAmount ||
      !shippingAddress ||
      !contactNumber
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Create new order
    const order = new Order({
      userID,
      products,
      totalAmount,
      shippingAddress,
      contactNumber,
      status: "Paid", // Default status
    });

    const savedOrder = await order.save();

    // Get user information for notification
    const user = await User.findById(userID);
    const customerName = user
      ? `${user.firstName} ${user.lastName}`.trim()
      : "Unknown Customer";

    // Create notification for admin
    await createNotification(
      "🛒 New Order Received",
      `Order #${savedOrder._id.slice(
        -6
      )} from ${customerName} - $${totalAmount.toFixed(2)}`,
      "order",
      true
    );

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Start the Server
app.listen(port, () => console.log(`Server running on port ${port}`));
