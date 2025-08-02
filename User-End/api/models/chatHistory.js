const mongoose = require("mongoose");

const chatHistorySchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    sessionId: {
      type: String,
      default: () => Date.now().toString(),
    },
  },
  {
    timestamps: true,
  }
);

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
module.exports = ChatHistory;
