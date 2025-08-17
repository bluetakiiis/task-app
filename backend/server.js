const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const taskRoutes = require("./routes/taskRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());

// Serve static frontend files (both legacy root and /static to avoid breaking links)
app.use(express.static(path.join(__dirname, "../docs")));
app.use("/static", express.static(path.join(__dirname, "../docs")));

// Show configured DB URL
console.log(process.env.MONGODB_URL);

// Connect to MongoDB (keep fallback for local dev)
mongoose
  .connect(process.env.MONGODB_URL || "mongodb://localhost:27017/Tasks")
  .then(async () => {
    console.log("Connected to tasks database");
    // Seed default categories if not present
    try {
      const Category = require("./models/categoryModel");
      const defaultCategories = ["Personal", "Work"];
      for (const name of defaultCategories) {
        const exists = await Category.findOne({ name });
        if (!exists) {
          await Category.create({ name });
        }
      }
    } catch (err) {
      console.error("Error during category seeding:", err);
    }
  })
  .catch((err) => console.error("Mongodb connection error:", err));

// Serve index.html for root path
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/index.html"));
});

// Legacy login route (kept for frontend compatibility)
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "Rupika" && password === "rd123") {
    return res.status(200).json({ message: "Login successful" });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
});

// API routes
app.use("/api/tasks", taskRoutes);
app.use("/api/categories", categoryRoutes);
const deleteAccountRouter = require("./routes/deleteAccount");
app.use("/api/deleteAccount", deleteAccountRouter);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
