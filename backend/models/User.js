/**
 * models/User.js — Mongoose User schema (ESM)
 */

import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true },
    password: { type: String },
    clientId: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
