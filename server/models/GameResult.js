const mongoose = require('mongoose');

const gameResultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  gameType: { 
    type: String, 
    required: true, 
    enum: ['wingo', 'k3', '5d', 'mines', 'aviator', 'racing'] 
  },
  gameName: { type: String, required: true },
  betAmount: { type: Number, required: true },
  outcome: { type: String, required: true, enum: ['win', 'lose'] },
  winAmount: { type: Number, default: 0 },
  multiplier: { type: Number, default: 1 },
  gameData: { type: mongoose.Schema.Types.Mixed, default: {} }, // game-specific data
  period: { type: String, default: '' }, // game round/period identifier
  createdAt: { type: Date, default: Date.now }
});

gameResultSchema.index({ createdAt: -1 });

module.exports = mongoose.model('GameResult', gameResultSchema);
