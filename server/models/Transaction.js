const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    required: true, 
    enum: ['deposit', 'withdraw', 'bet', 'win', 'spin_reward', 'signup_bonus', 'refund'] 
  },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number, required: true },
  status: { 
    type: String, 
    default: 'completed', 
    enum: ['pending', 'completed', 'failed', 'cancelled'] 
  },
  method: { type: String, default: '' }, // upi, bank_card, usdt
  accountDetails: { type: String, default: '' }, // Used for Withdraw bank/UPI id OR Deposit UTR reference
  description: { type: String, default: '' },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
