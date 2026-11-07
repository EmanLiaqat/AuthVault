const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Basic account information
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254
    },

    // Authentication information
    passwordHash: {
      type: String,
      select: false
    },

   firebaseUid: {
      type: String,
      default: null,
      index: true
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    },

    // Editable personal information
    phone: {
      type: String,
      trim: true,
      maxlength: 20,
      default: ""
    },

    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: ""
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 300,
      default: ""
    },

    dateOfBirth: {
      type: Date,
      default: null
    },

    // Account information
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("User", userSchema);