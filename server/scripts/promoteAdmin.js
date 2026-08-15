// One-off CLI helper: promotes an existing user to administrator and
// Approved status, so there's a way to create the first admin account
// (who can then approve everyone else through the API).
//
// Usage:
//   node scripts/promoteAdmin.js someone@growverdesolutions.com
import "dotenv/config";
import mongoose from "mongoose";
import { env } from "../src/config/env.js";
import { User } from "../src/models/User.js";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/promoteAdmin.js <email>");
  process.exit(1);
}

async function run() {
  await mongoose.connect(env.mongodbUri);
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    console.error(`No user found with email ${email}. Register the account first, then run this script.`);
    process.exit(1);
  }
  user.role = "administrator";
  user.status = "Approved";
  user.approvedAt = new Date();
  await user.save();
  console.log(`${user.email} is now an approved administrator.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
