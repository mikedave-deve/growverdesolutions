// One-off CLI helper: sets a new password for an existing user, for
// cases where they've lost access and there's no self-service reset
// flow yet. Give them the new password out of band and have them
// change it once they're signed in.
//
// Usage:
//   node scripts/resetPassword.js someone@growverdesolutions.com NewTempPass123
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { User } from "../src/models/User.js";

const SALT_ROUNDS = 12;

const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
  console.error("Usage: node scripts/resetPassword.js <email> <newPassword>");
  process.exit(1);
}
if (newPassword.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

async function run() {
  await mongoose.connect(env.mongodbUri);
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`No user found with email ${email}.`);
    process.exit(1);
  }
  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await user.save();
  console.log(`Password reset for ${user.email}.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
