const Activity = require("../models/activity");

// GET ACTIVITY HISTORY
async function getActivities(req, res) {
  try {
    const activities = await Activity.find({
      user: req.user.id
    })
      .select("type description createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return res.status(200).json({
      success: true,
      message: "Activity history retrieved successfully",
      activities
    });
  } catch (error) {
    console.error("Activity retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  }
}

module.exports = {
  getActivities
};