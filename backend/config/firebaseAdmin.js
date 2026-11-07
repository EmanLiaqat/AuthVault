const { initializeApp, cert, getApps } = require("firebase-admin/app");

try {
  // Check if variables exist
  if (
    !process.env.FIREBASE_PROJECT_ID ||
    !process.env.FIREBASE_CLIENT_EMAIL ||
    !process.env.FIREBASE_PRIVATE_KEY
  ) {
    throw new Error(
      "Missing Firebase environment variables in .env file. Check your .env file."
    );
  }

  // Only initialize if no apps are currently running
  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Safely replace \n with actual line breaks
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("✅ Firebase Admin initialized successfully");
  }
} catch (error) {
  console.error("❌ Firebase Admin initialization error:", error.message);
}

// Export the modular functions you need for your controller
const { getAuth } = require("firebase-admin/auth");
module.exports = { getAuth };