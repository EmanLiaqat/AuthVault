const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  getProfile,
  updateProfile
} = require("../controllers/profileController");

const router = express.Router();

// Get logged-in user's profile
router.get("/", protect, getProfile);

// Update logged-in user's profile
router.patch("/", protect, updateProfile);

module.exports = router;