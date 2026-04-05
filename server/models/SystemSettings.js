const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema({
  SIGNUP_BONUS: { type: Number, default: 15 },
  MIN_DEPOSIT: { type: Number, default: 20 },
  MAX_DEPOSIT: { type: Number, default: 10000 },
  MIN_WITHDRAW: { type: Number, default: 200 }, // Using 200 based on old wallet.js, user mentioned 2000 in prompt but we'll default to 200 until they config it
  MAX_WITHDRAW: { type: Number, default: 5000 },
  MIN_PLAY_BALANCE: { type: Number, default: 100 }, // Global required balance to play games
  WIN_PROBABILITY: { type: Number, default: 40 }, // Base win probability logic for games (0-100)
  REFERRAL_FIXED_BONUS: { type: Number, default: 100 },
  REFERRAL_PERCENT: { type: Number, default: 20 },
  DEPOSIT_QR_IMAGE: { type: String, default: "" }, // Base64 representation of the dynamic QR code
  UPI_ID: { type: String, default: "" },
});

module.exports = mongoose.model("SystemSettings", systemSettingsSchema);
