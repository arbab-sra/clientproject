const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  balance: { type: Number, default: 15 },
  totalDeposit: { type: Number, default: 0 },
  totalWithdraw: { type: Number, default: 0 },
  totalBet: { type: Number, default: 0 },
  totalWin: { type: Number, default: 0 },
  vipLevel: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  uid: { type: String, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  // Referral system
  referralCode: { type: String, unique: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  referralEarnings: { type: Number, default: 0 },
  referralCount: { type: Number, default: 0 },
  // Spinner
  spinsUsed: { type: Number, default: 0 },
  lastSpinDate: { type: Date, default: null },
  freeTrialSpins: { type: Number, default: 2 },
  // Settings
  language: { type: String, default: 'English' },
  notifications: { type: Boolean, default: true },
  lastLogin: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Generate UID and referral code before save
userSchema.pre('save', function(next) {
  if (!this.uid) {
    this.uid = Math.floor(10000000 + Math.random() * 90000000).toString();
  }
  if (!this.referralCode) {
    this.referralCode = 'GZ' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
