const Task = require("../models/taskModel");

// Create
exports.createTask = async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.status(201).json(task);
};

// Read all
exports.getAllTasks = async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
};

// Read one
exports.getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) return res.status(404).json({ message: "Not found" });
  res.json(task);
};

// Update
exports.updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!task) return res.status(404).json({ message: "Not found" });
  res.json(task);
};

// Delete
exports.deleteTask = async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) return res.status(404).json({ message: "Not found" });
  res.json({ message: "Deleted", task });
};
