const bcrypt = require("bcrypt");
const User = require("../models/user");
const Activity = require("../models/activity");
const { changePasswordSchema } = require("../validators/passwordValidator");

async function changePassword(req, res) {
  try {
    const result = changePasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid password data",
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message
        }))
      });
    }

    const { currentPassword, newPassword } = result.data;

    // Get user with passwordHash
    const user = await User.findById(req.user.id).select("+passwordHash");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    // Prevent Google-only users from using this (they have no local password)
    if (user.authProvider === "google" && !user.passwordHash) {
      return res.status(400).json({
        success: false,
        message: "Your account uses Google Sign-In. You cannot set a password here."
      });
    }

    // Verify current password matches
    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect current password"
      });
    }

    // Hash new password and save
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    user.passwordHash = newPasswordHash;
    await user.save();

    // Log activity
    await Activity.create({
      user: user._id,
      type: "profile_updated", // Reusing existing type to avoid DB schema changes
      description: "Password changed successfully"
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error) {
    console.error("Password change error:", error.message);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred"
    });
  }
}

module.exports = { changePassword };