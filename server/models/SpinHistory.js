const mongoose = require('mongoose');

const spinHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reward: { type: Number, required: true }, // actual reward amount
  displayReward: { type: String, required: true }, // what was shown on wheel
  rewardType: { type: String, default: 'cash' }, // cash, nothing
  isFreeTrialSpin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SpinHistory', spinHistorySchema);
