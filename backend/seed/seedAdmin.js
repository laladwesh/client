import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const run = async () => {
  try {
    // await connectDB();
    mongoose.connect(process.env.MONGO_URI || "mongodb+srv://testgupta85_db_user:ihHPU0cMvhMOPe9Z@iitgplacement.kfx3vn1.mongodb.net/adminjs-cloud?retryWrites=true&w=majority", {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
    const adminEmail = process.env.ADMIN_EMAIL || 'guptaavinash302@gmail.com';
    if (!adminEmail) {
      console.error('Please set ADMIN_EMAIL in .env');
      process.exit(1);
    }
    let user = await User.findOne({ email: adminEmail });
    if (!user) {
      user = await User.create({ googleId: 'seed-admin-' + Date.now(), name: 'Admin', email: adminEmail, role: 'admin' });
      console.log('Admin user created:', user.email);
    } else {
      user.role = 'admin';
      await user.save();
      console.log('Admin user updated:', user.email);
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

run();
