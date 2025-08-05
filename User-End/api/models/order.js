const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
<<<<<<< HEAD
      enum: ["Paid", "Delivered", "Cancelled", "Shipped", "Processing"],
=======
      enum: ["Paid", "Delivered", "Processing", "Cancelled", "Shipped"],
>>>>>>> 4e784bf24f6a9d9dea49d6c9ec32615b7e14a77e
      default: "Paid",
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
