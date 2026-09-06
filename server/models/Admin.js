import mongoose from 'mongoose';

// Single-document collection - one admin, no signup flow. Lives in the DB rather than env vars
// specifically so the password can be changed at runtime (PATCH /api/auth/password) without
// editing .env and restarting the server.
const adminSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Admin', adminSchema);
