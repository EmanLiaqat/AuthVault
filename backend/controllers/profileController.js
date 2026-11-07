const User = require("../models/user");
const Activity = require("../models/activity");
const { updateProfileSchema } = require("../validators/profileValidator");

// GET PROFILE
async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error("Profile retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  }
}

// UPDATE PROFILE
async function updateProfile(req, res) {
  try {
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile information",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const updates = { ...result.data };

    if (updates.dateOfBirth !== undefined) {
      const date = updates.dateOfBirth;

      // Allow clearing the date of birth
      if (date === "") {
        updates.dateOfBirth = null;
      } else {
        updates.dateOfBirth = new Date(`${date}T00:00:00.000Z`);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      {
        returnDocument: "after",
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    await Activity.create({
      user: user._id,
      type: "profile_updated",
      description: "Profile information updated"
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        authProvider: user.authProvider,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    console.error("Profile update error:", error.message);

    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  }
}

module.exports = {
  getProfile,
  updateProfile
};