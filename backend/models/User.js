/**
 * models/User.js — Mongoose User schema
 * Optional: enables personalized bookmark storage
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    // Unique display name for the user
    username: { type: String, required: true, unique: true, trim: true },
    // Used for login (optional auth extension)
    email:    { type: String, required: true, unique: true, lowercase: true },
    // Hashed password (extend with bcrypt if adding auth)
    password: { type: String },
    // Anonymous client ID (for users without accounts)
    clientId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
