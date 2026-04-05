# 🎮 GameZone - Gaming Platform Walkthrough

## What Was Built

A complete gaming platform web app inspired by 91 Club, featuring:

- **Next.js 16** frontend with **TailwindCSS v4** styling
- **Express.js** backend with **MongoDB** database
- **JWT authentication** with signup/login
- **6 playable games** with real-time outcomes
- **Wallet system** with deposit/withdraw (Razorpay stub)
- **Animated spinner** with controlled rewards
- **Fake live activity feed**
- **Mobile-first responsive design** (480px max-width)

---

## Pages & Screenshots

### Login Page
Gradient header with game controller icon, clean form, demo account button.

![Login Page](/Users/arbab/.gemini/antigravity/brain/521785c0-a8c5-4329-8314-e63dcbd3fb37/login_page_1775271934608.png)

### Home Page (After Login)
Banner carousel, wallet balance (₹515.00), Wheel of Fortune quick access, game categories, recommended games grid, and live activity ticker.

![Home Page](/Users/arbab/.gemini/antigravity/brain/521785c0-a8c5-4329-8314-e63dcbd3fb37/after_login_1775271951405.png)

### Account Page
User profile with VIP badge, UID, balance card, quick actions (ARWallet, Deposit, Withdraw, VIP), history grid, menu items, and service center.

![Account Page](/Users/arbab/.gemini/antigravity/brain/521785c0-a8c5-4329-8314-e63dcbd3fb37/account_page_1775271959160.png)

### Deposit Page
Payment methods (UPI-QR, Paytm, Bank Card, USDT), channel selector, preset amounts grid (₹100 to ₹5K), custom input, recharge instructions.

![Deposit Page](/Users/arbab/.gemini/antigravity/brain/521785c0-a8c5-4329-8314-e63dcbd3fb37/deposit_page_1775271961676.png)

### Spinner / Wheel of Fortune
Animated SVG wheel with 8 segments, 2 free trial spins, cash out button, invite friends CTA, spin history.

![Spinner Page](/Users/arbab/.gemini/antigravity/brain/521785c0-a8c5-4329-8314-e63dcbd3fb37/spinner_page_1775271964137.png)

### Win Go Game
Color prediction game with Green/Violet/Red options, number picker (0-9), bet amount selector, game timer, and game history.

![Win Go Game](/Users/arbab/.gemini/antigravity/brain/521785c0-a8c5-4329-8314-e63dcbd3fb37/wingo_page_1775271967008.png)

---

## Full App Demo Recording

![Full App Demo](/Users/arbab/.gemini/antigravity/brain/521785c0-a8c5-4329-8314-e63dcbd3fb37/full_app_demo_1775271917446.webp)

---

## Project Structure

```
clientproject/
├── server/                    # Express.js Backend
│   ├── index.js               # Server entry point
│   ├── .env                   # Configuration
│   ├── seed.js                # Database seeder
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── models/
│   │   ├── User.js            # User model (balance, VIP, spins)
│   │   ├── Transaction.js     # All money movements
│   │   ├── GameResult.js      # Game play outcomes
│   │   └── SpinHistory.js     # Spinner rewards
│   └── routes/
│       ├── auth.js            # Signup/Login/Me
│       ├── wallet.js          # Deposit/Withdraw/Transactions
│       ├── games.js           # Game list & play (6 engines)
│       ├── spinner.js         # Wheel of Fortune
│       └── activity.js        # Fake live feed
│
├── client/                    # Next.js Frontend
│   ├── next.config.mjs        # API proxy
│   ├── postcss.config.mjs     # TailwindCSS v4
│   └── src/
│       ├── app/
│       │   ├── layout.js      # Root layout + BottomNav
│       │   ├── globals.css    # Tailwind + custom animations
│       │   ├── page.js        # Home page
│       │   ├── login/         # Login page
│       │   ├── signup/        # Signup page
│       │   ├── account/       # Account/Profile page
│       │   ├── deposit/       # Deposit page
│       │   ├── withdraw/      # Withdraw page
│       │   ├── spinner/       # Wheel of Fortune
│       │   ├── activity/      # Activity feed + transactions
│       │   ├── promotion/     # Promotions page
│       │   └── games/
│       │       └── [gameId]/  # Dynamic game page (6 games)
│       ├── components/
│       │   ├── BottomNav.js   # 5-tab bottom navigation
│       │   └── Header.js      # Reusable page header
│       ├── context/
│       │   └── AuthContext.js  # Auth state management
│       └── services/
│           └── api.js          # Axios API service
```

---

## The 6 Playable Games

| Game | Type | How to Win | Payout |
|------|------|------------|--------|
| 🎯 **Win Go** | Color Prediction | Pick Red/Green/Violet or number 0-9 | 2x / 4.5x / 9x |
| 🎲 **K3 Dice** | Dice Game | Big/Small, Odd/Even, or exact sum | 2x / 6x |
| 🔢 **5D Lottery** | Number Lottery | Match 1-5 numbers in positions | 2x to 100,000x |
| 💎 **Mines** | Grid Game | Reveal gems, avoid mines, cash out | 1.2x per gem |
| ✈️ **Aviator** | Crash Game | Cash out before the plane crashes | Variable |
| 🏍️ **Moto Racing** | Betting | Pick the winning racer | 3.5x |

---

## How to Run

### Prerequisites
- Node.js 18+
- Docker (for MongoDB)

### Start Everything
```bash
# 1. Start MongoDB
docker run -d --name gamezone-mongo -p 27017:27017 mongo:7

# 2. Start Backend
cd server
npm install
node seed.js          # Seed demo data
node index.js         # Starts on port 5001

# 3. Start Frontend (new terminal)
cd client
npm install
npm run dev           # Starts on port 3000
```

### Demo Account
- **Email:** demo@gamezone.com
- **Password:** demo123
- **Balance:** ₹515.00

---

## Key Configuration (server/.env)

| Setting | Value |
|---------|-------|
| Signup Bonus | ₹15 |
| Min Deposit | ₹20 |
| Max Deposit | ₹10,000 |
| Min Withdrawal | ₹200 |
| Max Withdrawal | ₹5,000 |
| Game Entry Fee | ₹100 |
| Spinner Max Win | ₹5 (actual) |
| Spinner Free Trials | 2 |
| Spinner Daily Limit | 1/day |

---

## Razorpay Integration

Currently stubbed with simulated payments. To activate real payments:

1. Get Razorpay API keys from [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Update `server/.env`:
   ```
   RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
   RAZORPAY_KEY_SECRET=YOUR_SECRET
   ```
3. Uncomment the Razorpay order creation code in `server/routes/wallet.js`
