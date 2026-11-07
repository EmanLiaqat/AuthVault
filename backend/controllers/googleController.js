const { getAuth } = require("../config/firebaseAdmin");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Activity = require("../models/activity");

async function googleAuth(req, res) {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required"
      });
    }

    // Verify the Firebase ID Token
    const decodedToken = await getAuth().verifyIdToken(idToken);
    const { uid: firebaseUid, email, name } = decodedToken;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Unable to retrieve email from Firebase account"
      });
    }

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // First-time login, create account
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        firebaseUid,
        authProvider: "google"
      });

      await Activity.create({
        user: user._id,
        type: "account_created",
        description: "Account created via Google Sign-In (Firebase)"
      });
    } else if (!user.firebaseUid) {
      // Existing local account, link Firebase UID
      user.firebaseUid = firebaseUid;
      user.authProvider = "google";
      await user.save();
    }

    // Update last login time
    user.lastLoginAt = new Date();
    await user.save();

    await Activity.create({
      user: user._id,
      type: "login",
      description: "Logged in successfully via Google (Firebase)"
    });

    // Issue our own JWT
    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        issuer: process.env.JWT_ISSUER || "authvault",
        audience: process.env.JWT_AUDIENCE || "authvault-users"
      }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        lastLoginAt: user.lastLoginAt
      }
    });
  } catch (error) {
    // This will print the REAL error in your backend terminal if it fails again
    console.error("❌ FULL GOOGLE AUTH ERROR:", error);
    
    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase token"
    });
  }
}

module.exports = { googleAuth };