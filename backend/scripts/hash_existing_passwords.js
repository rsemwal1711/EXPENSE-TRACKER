import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  provider: { type: String, default: 'local' },
  profilePicture: String,
  expenses: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

const MONGO_URI = process.env.MONGO_URI;

async function hashAllPlainPasswords() {
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI in environment variables');
    process.exit(1);
  }
  await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 30000, socketTimeoutMS: 45000 });
  const users = await User.find({});
  let updated = 0;
  for (const user of users) {
    // If password is already a bcrypt hash, skip
    if (user.password && user.password.startsWith('$2a$')) continue;
    if (user.password) {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(user.password, salt);
      user.password = hashed;
      await user.save();
      updated++;
      console.log(`Updated user: ${user.email}`);
    }
  }
  console.log(`Done. Updated ${updated} users.`);
  mongoose.disconnect();
}

hashAllPlainPasswords();
