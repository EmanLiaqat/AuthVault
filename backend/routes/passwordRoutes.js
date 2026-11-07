const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { changePassword } = require("../controllers/passwordController");

const router = express.Router();

// Authenticated users only
router.patch("/change", protect, changePassword);

module.exports = router;