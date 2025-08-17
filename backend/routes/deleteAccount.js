const express = require("express");
const router = express.Router();
const Task = require("../models/taskModel");
const Category = require("../models/categoryModel"); 

// POST /api/deleteAccount
router.post("/", async (req, res) => {
  try {
    // Delete all tasks
    await Task.deleteMany({});
    // Delete all categories except 'Personal' and 'Work'
    await Category.deleteMany({ name: { $nin: ["Personal", "Work"] } });
    res.json({ message: "Account deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting account" });
  }
});

module.exports = router;
