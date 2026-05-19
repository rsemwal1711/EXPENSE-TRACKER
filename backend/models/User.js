// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  googleId: String,
  provider: { type: String, default: 'local' },
  profilePicture: String,
  xp: { type: Number, default: 0 },
  expenses: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', userSchema);