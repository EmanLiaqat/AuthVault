const express = require("express");
const { googleAuth } = require("../controllers/googleController");
const {
  register,
  login,
  logout
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/google", googleAuth);

module.exports = router;