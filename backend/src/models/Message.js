const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    taskId: String,
    senderId: String,
    text: String,
    time: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);