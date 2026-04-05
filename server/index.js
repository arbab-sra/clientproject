const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const gameRoutes = require('./routes/games');
const spinnerRoutes = require('./routes/spinner');
const activityRoutes = require('./routes/activity');
const referralRoutes = require('./routes/referral');
const adminRoutes = require('./routes/admin');
const app = express();
// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/spinner', spinnerRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/referral', referralRoutes);
app.use('/api/admin', adminRoutes);
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return; // already connected, skip

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log("✅ Connected to MongoDB");

    const SystemSettings = require("./models/SystemSettings");
    const settingsCount = await SystemSettings.countDocuments();
    if (settingsCount === 0) {
      await new SystemSettings({}).save();
      console.log("⚙️ Default System Settings initialized.");
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err; // production mein bhi throw karo!
  }
};
app.use(async (req, res, next) => {
  try {
    await connectDB(); // har request pe check karo — already connected hai toh skip
    next();
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;



connectDB();

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}

module.exports = app;
