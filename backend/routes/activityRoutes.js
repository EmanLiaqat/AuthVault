const express = require("express");

const { protect } = require("../middleware/authMiddleware");
const {
  getActivities
} = require("../controllers/activityController");

const router = express.Router();

// Get the authenticated user's activity history
router.get("/", protect, getActivities);

module.exports = router;