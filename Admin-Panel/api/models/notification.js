const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['product', 'order', 'admin'],
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  forAdmin: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification; 