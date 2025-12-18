import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
