import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  console.log('MongoDB URI:', uri);
  try {
    await mongoose.connect(uri, {
      // mongoose v7 no longer needs these options, but keep for compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
