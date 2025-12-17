require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');

(async () => {
  try {
    await connectDB();
    const adminEmail = process.env.ADMIN_EMAIL;
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
})();
