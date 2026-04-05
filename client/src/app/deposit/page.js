"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { walletAPI } from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { motion } from "framer-motion";
import Link from "next/link";
import { clonePageVaryPathWithNewSearchParams } from "next/dist/client/components/segment-cache/vary-path";

// Removed next/script since Razorpay is gone
const PAYMENT_METHODS = [
  { id: "upi", label: "UPI-QR", icon: "📱" },
  { id: "paytm", label: "Paytm", icon: "💳" },
  { id: "bank_card", label: "Bank Card", icon: "🏦" },
  { id: "usdt", label: "USDT", icon: "🪙" },
];

const PRESET_AMOUNTS = [100, 200, 300, 400, 500, 1000, 1500, 3000, 5000];

function DepositContent() {
  const { user, updateUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [method, setMethod] = useState("upi");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [depositConfig, setDepositConfig] = useState({
    qr: "",
    min: 20,
    max: 10000,
  });

  const fetchHistory = () => {
    walletAPI
      .getTransactions({ type: "deposit" })
      .then((res) => setHistory(res.data.transactions))
      .catch(() => {});
    walletAPI
      .getBalance()
      .then((res) => {
      
        setDepositConfig({
          qr: res.data.deposit_qr,
          min: res.data.min_deposit || 20,
          max: res.data.max_deposit || 10000,
          upi_id:res.data.upi_id ||""
        });
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchHistory();
  }, [user]);

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (
      !depositAmount ||
      depositAmount < depositConfig.min ||
      depositAmount > depositConfig.max
    ) {
      setError(`Amount must be ₹${depositConfig.min} - ₹${depositConfig.max}`);
      return;
    }
    if (utr.length !== 12) {
      setError("Please enter a valid 12-digit UTR/Reference number");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await walletAPI.submitManualDeposit({
        amount: depositAmount,
        utr,
        method,
      });
      setSuccess(
        res.data.message ||
          "Deposit requested successfully! Pending admin verification.",
      );
      setAmount("");
      setUtr("");
      fetchHistory();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit deposit request");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20">
      <Header
        title="Deposit"
        rightContent={
          <Link href="/activity" className="text-primary text-xs font-medium">
            Deposit history
          </Link>
        }
      />

      {/* Balance Card */}
      <div className="px-4 mt-2">
        <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <p className="text-white/70 text-xs font-medium">💰 Balance</p>
          <p className="text-white text-3xl font-extrabold mt-1">
            ₹{user.balance?.toFixed(2)}
          </p>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-8 h-1 rounded-full bg-white/20" />
            ))}
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="px-4 mt-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="grid grid-cols-4 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all ${
                  method === m.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <span className="text-2xl">{m.icon}</span>
                <span className="text-[10px] font-medium text-dark">
                  {m.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Channel Selector */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-dark text-sm font-semibold flex items-center gap-1.5">
            📡 Select channel
          </p>
          <div className="mt-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-xl p-3">
            <p className="text-primary font-bold text-sm">Phonepe_QR</p>
            <p className="text-gray-400 text-[10px]">Balance: 100 - 50K</p>
          </div>
        </div>
      </div>

      {/* Deposit Amount */}
      <div className="px-4 mt-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-dark text-sm font-semibold flex items-center gap-1.5">
            💳 Deposit amount
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {PRESET_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a.toString())}
                className={`py-2.5 rounded-xl text-center font-semibold text-sm transition-all ${
                  amount === a.toString()
                    ? "bg-gradient-to-r from-primary to-secondary text-white shadow-md"
                    : "bg-gray-50 text-primary hover:bg-primary/10"
                }`}
              >
                ₹ {a >= 1000 ? `${a / 1000}K` : a}
              </button>
            ))}
          </div>

          <div className="mt-3 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">
              ₹
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="₹100.00 - ₹50,000.00"
              className="w-full pl-8 pr-10 py-3.5 bg-gray-bg rounded-xl text-dark text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
            {amount && (
              <button
                onClick={() => setAmount("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-dark"
              >
                ✕
              </button>
            )}
          </div>

          <p className="text-dark text-sm font-semibold flex items-center gap-1.5 mt-5">
            🧾 Transfer Admin Details
          </p>
          <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center">
            {/* Replace with your actual QR code image URL later */}
            <div className="w-40 h-40 bg-white border-2 border-primary/20 rounded-xl flex items-center justify-center shadow-sm relative overflow-hidden mb-3">
              {amount >= 20 && depositConfig.qr && (
                <img
                  src={depositConfig.qr}
                  alt="Admin QR Code"
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <p className="text-xs text-gray-500 mb-1">
              Scan to pay exactly ₹{amount || "0.00"}
            </p>
            <div className="px-4 py-2 bg-white border border-gray-200 rounded-full font-mono text-sm text-dark tracking-wider font-bold">
              UPI ID: <span className="text-primary">{amount >=2 && depositConfig.upi_id}</span>
            </div>
          </div>

          <div className="mt-5">
            <label className="text-dark text-sm font-semibold flex items-center gap-1.5 mb-1.5">
              🔢 Transaction UTR / Ref No
            </label>
            <input
              type="text"
              value={utr}
              onChange={(e) =>
                setUtr(e.target.value.replace(/[^0-9]/g, "").slice(0, 12))
              }
              placeholder="Enter 12-digit UTR from receipt"
              className="w-full px-4 py-3.5 bg-gray-bg rounded-xl text-dark font-mono text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all border border-transparent focus:border-primary/20"
            />
            <p className="text-[10px] text-gray-400 mt-1">
              Must be exactly 12 digits (e.g. 3125xxxxxxxx)
            </p>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="px-4 mt-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-3">
            {error}
          </div>
        )}
        {success && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm mb-3 font-medium"
          >
            ✅ {success}
          </motion.div>
        )}
        <button
          onClick={handleDeposit}
          disabled={loading || !amount}
          className="w-full py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl shadow-lg shadow-primary/30 disabled:opacity-50 transition-all"
        >
          {loading ? "Processing..." : "Deposit Now"}
        </button>
      </div>

      {/* Recharge Instructions */}
      <div className="px-4 mt-4 mb-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-dark text-sm font-semibold flex items-center gap-1.5 mb-2">
            🔔 Recharge instructions
          </p>
          <ul className="space-y-2">
            {[
              "Step 1: Save the QR code above or copy the UPI ID.",
              "Step 2: Open your UPI app (PhonePe, GPay, Paytm) and exact transfer the amount.",
              "Step 3: Copy the 12-digit UTR (Reference Number) from your successful payment receipt.",
              "Step 4: Paste the UTR in the box above and click Deposit Now.",
              "Step 5: Your deposit will enter Pending state and will be verified manually by admin.",
            ].map((text, i) => (
              <li
                key={i}
                className="text-gray-500 text-xs flex items-start gap-1.5 leading-relaxed"
              >
                <span className="text-primary mt-0.5 font-bold">{i + 1}.</span>
                {text.replace(/^Step \d+: /, "")}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* History Section */}
      <div className="px-4 mt-6 mb-8">
        <h3 className="text-dark font-bold mb-3 flex items-center justify-between">
          <span>Recent Deposits</span>
          <button
            onClick={fetchHistory}
            className="text-xs text-primary font-medium p-1 cursor-pointer hover:bg-primary/10 rounded-lg"
          >
            Refresh
          </button>
        </h3>
        <div className="space-y-3">
          {history.length > 0 ? (
            history.map((tx) => (
              <div
                key={tx._id}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between"
              >
                <div>
                  <p className="text-dark font-bold text-sm">
                    ₹{tx.amount?.toFixed(2)}
                  </p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {new Date(tx.createdAt).toLocaleDateString()}{" "}
                    {new Date(tx.createdAt).toLocaleTimeString()}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-1 break-all">
                    UTR: {tx.accountDetails || "N/A"}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-md ${
                      tx.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : tx.status === "pending"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No recent deposits found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DepositPage() {
  return (
    <AuthGuard>
      <DepositContent />
    </AuthGuard>
  );
}
