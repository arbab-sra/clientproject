const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/gamezone').then(async () => {
  const admin = await User.findOne({ email: 'demo@gamezone.com' });
  if (admin) {
    admin.password = 'admin123';
    await admin.save();
    console.log("Password reset successfully");
  }
  process.exit(0);
});
