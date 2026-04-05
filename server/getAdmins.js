const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/gamezone').then(async () => {
  const admins = await User.find({ role: 'admin' }).select('email phone username password');
  console.log("Found admins: ", admins);
  process.exit(0);
}).catch(err => {
  console.log(err);
  process.exit(1);
});
