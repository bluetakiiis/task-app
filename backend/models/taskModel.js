const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  dueTime: String,
  priority: String,
  category: String,
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "completed"],
  },
});

module.exports = mongoose.model("Task", taskSchema);
