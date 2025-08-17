const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");

// Create
router.post("/", taskController.createTask);

// Read all
router.get("/", taskController.getAllTasks);

// Read one by ID
router.get("/:id", taskController.getTaskById);

// Update
router.put("/:id", taskController.updateTask);

// Delete
router.delete("/:id", taskController.deleteTask);

module.exports = router;
