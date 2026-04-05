const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Transaction = require("./models/Transaction");
const GameResult = require("./models/GameResult");

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/gamezone",
    );
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await GameResult.deleteMany({});
    console.log("Cleared existing data");

    // Create demo user
    const demoUser = new User({
      username: "DemoPlayer",
      email: "demo@gamezone.com",
      phone: "9876543210",
      password: "demo123",
      balance: 15,
      totalDeposit: 0,
      totalBet: 0,
      totalWin: 0,
      vipLevel: 1,
      freeTrialSpins: 2,
    });
    const admin = new User({
      username: "admin",
      email: process.env.ADMIN_EMAIL,
      phone: "0000000000",
      password: process.env.ADMIN_PASSWORD,
      balance: 200,
      totalDeposit: 200,
      totalBet: 0,
      totalWin: 0,
      vipLevel: 100,
      freeTrialSpins: 100,
      role: "admin",
    });
    await demoUser.save();
    await admin.save();
    console.log("Created demo user: demo@gamezone.com / demo123");
    console.log("Created admin user");
    // Create demo transactions
    const transactions = [
      {
        userId: demoUser._id,
        type: "signup_bonus",
        amount: 15,
        balanceAfter: 15,
        description: "Welcome bonus of ₹15",
      },
      {
        userId: demoUser._id,
        type: "deposit",
        amount: 500,
        balanceAfter: 515,
        method: "upi",
        description: "Deposit via UPI",
      },
      {
        userId: demoUser._id,
        type: "bet",
        amount: -100,
        balanceAfter: 415,
        description: "Bet ₹100 on Win Go",
      },
      {
        userId: demoUser._id,
        type: "win",
        amount: 200,
        balanceAfter: 615,
        description: "Won ₹200 in Win Go",
      },
      {
        userId: demoUser._id,
        type: "bet",
        amount: -100,
        balanceAfter: 515,
        description: "Bet ₹100 on Aviator",
      },
    ];

    for (const t of transactions) {
      await new Transaction(t).save();
    }
    console.log("Created demo transactions");

    // Create demo game results
    const games = [
      {
        userId: demoUser._id,
        gameType: "wingo",
        gameName: "Win Go",
        betAmount: 100,
        outcome: "win",
        winAmount: 200,
        multiplier: 2,
        period: "202604040001",
      },
      {
        userId: demoUser._id,
        gameType: "aviator",
        gameName: "Aviator",
        betAmount: 100,
        outcome: "lose",
        winAmount: 0,
        multiplier: 0,
        period: "202604040002",
      },
    ];

    for (const g of games) {
      await new GameResult(g).save();
    }
    console.log("Created demo game results");
    console.log("\n✅ Seed complete!");
    console.log("Demo login: demo@gamezone.com / demo123");
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
