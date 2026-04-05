"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { adminAPI } from "@/services/api";
import AuthGuard from "@/components/AuthGuard";
import Header from "@/components/Header";
import { motion, number } from "framer-motion";

function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("deposits");
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSettings();
      setSettings(res.data);
    } catch (err) {
      setError("Failed to fetch settings");
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch (err) {
      setError("Failed to fetch users");
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    setActionLoading("settings");
    try {
      await adminAPI.updateSettings(settings);
      setSuccess("Settings updated globally!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update settings");
    }
    setActionLoading(null);
  };

  // Protect route
  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-bg flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
          <div className="text-red-500 text-5xl mb-4">🚫</div>
          <h1 className="text-xl font-bold text-dark mb-2">Access Denied</h1>
          <p className="text-gray-500 mb-4">
            You do not have permission to view the admin dashboard.
          </p>
          <button
            onClick={() => (window.location.href = "/account")}
            className="bg-primary text-white px-6 py-2 rounded-xl font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const fetchTransactions = async (type) => {
    setLoading(true);
    try {
      // Fetch specifically 'deposit' or 'withdraw'
      const typeStr = type === "deposits" ? "deposit" : "withdraw";
      const res = await adminAPI.getPending(typeStr);
      setTransactions(res.data);
    } catch (err) {
      setError("Failed to fetch transactions");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeTab === "settings") {
      fetchSettings();
    } else if (activeTab === "users") {
      fetchUsers();
    } else {
      fetchTransactions(activeTab);
    }
  }, [activeTab]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    setError("");
    try {
      if (action === "approve") {
        await adminAPI.approve(id);
        setSuccess("Transaction approved successfully!");
      } else {
        await adminAPI.reject(id);
        setSuccess("Transaction rejected.");
      }
      // Re-fetch list
      fetchTransactions(activeTab);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} transaction`);
    }
    setActionLoading(null);
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-20">
      <Header title="Admin Dashboard" showBack={true} />

      {/* Tabs */}
      <div className="bg-white px-4 pt-2 shadow-sm sticky top-[56px] z-30">
        <div className="flex gap-4 border-b border-gray-100 overflow-x-auto no-scrollbar">
          {["deposits", "withdrawals", "users", "settings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-2 text-sm font-semibold capitalize relative transition-colors ${
                activeTab === tab
                  ? "text-primary"
                  : "text-gray-500 hover:text-dark"
              }`}
            >
              Pending {tab}
              {activeTab === tab && (
                <motion.div
                  layoutId="adminTab"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm mb-4 border border-red-100">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl text-sm mb-4 border border-green-100">
            {success}
          </div>
        )}

        {activeTab === "settings" ? (
          loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : settings ? (
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h2 className="text-dark font-bold text-lg mb-4">
                Global App Settings
              </h2>

              <div className="space-y-4">
                {[
                  { key: "SIGNUP_BONUS", label: "Signup Bonus (₹)" },
                  { key: "MIN_DEPOSIT", label: "Minimum Deposit (₹)" },
                  { key: "MAX_DEPOSIT", label: "Maximum Deposit (₹)" },
                  { key: "MIN_WITHDRAW", label: "Minimum Withdrawal (₹)" },
                  { key: "MAX_WITHDRAW", label: "Maximum Withdrawal (₹)" },
                  {
                    key: "MIN_PLAY_BALANCE",
                    label: "Min Balance to Play Games (₹)",
                  },
                  { key: "WIN_PROBABILITY", label: "Win Probability (%)" },
                  {
                    key: "REFERRAL_FIXED_BONUS",
                    label: "Referral Fixed Bonus (₹)",
                  },
                  {
                    key: "REFERRAL_PERCENT",
                    label: "Referral Deposit Percent (%)",
                  },
                  { key: "UPI_ID", label: "Depositer UPI ID", type: "string" },
                ].map((field) => (
                  <div key={field.key} className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-gray-500">
                      {field.label}
                    </label>
                    <input
                      type={field?.type ? field?.type :"number"}
                      value={settings[field.key] || ""}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          [field.key]:field?.type ? e.target.value: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-dark text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-bold text-gray-500">
                    Deposit QR Code Image
                  </label>
                  {settings.DEPOSIT_QR_IMAGE && (
                    <img
                      src={settings.DEPOSIT_QR_IMAGE}
                      alt="QR Code"
                      className="w-32 h-32 object-cover border border-gray-200 rounded-xl mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSettings({
                            ...settings,
                            DEPOSIT_QR_IMAGE: reader.result,
                          });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                  />
                  <p className="text-[10px] text-gray-400">
                    Selecting a new image will automatically convert and save it
                    when you click Save All Settings.
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 mt-5">
                  <button
                    onClick={handleSaveSettings}
                    disabled={actionLoading === "settings"}
                    className="w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50"
                  >
                    {actionLoading === "settings"
                      ? "Saving..."
                      : "Save All Settings"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Failed to load settings.
            </div>
          )
        ) : activeTab === "users" ? (
          loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-bold">
                    Total Signups
                  </p>
                  <p className="text-2xl font-black text-primary">
                    {users.length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center">
                  <p className="text-xs text-gray-500 font-bold">
                    Platform Balance
                  </p>
                  <p className="text-2xl font-black text-secondary">
                    ₹
                    {users
                      .reduce((acc, curr) => acc + (curr.balance || 0), 0)
                      ?.toFixed(0)}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                      <tr>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Balance</th>
                        <th className="px-4 py-3">Deposit / Withdraw</th>
                        <th className="px-4 py-3">Est. Profit/Loss</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u._id}
                          className="border-t border-gray-50 hover:bg-gray-50/50"
                        >
                          <td className="px-4 py-3">
                            <p className="font-bold text-dark">{u.username}</p>
                            <p className="text-[10px] text-gray-400">
                              {u.email}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-semibold">
                            ₹{u.balance?.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <span className="text-green-600 font-bold">
                              +₹{u.totalDeposit?.toFixed(0)}
                            </span>{" "}
                            <br />
                            <span className="text-red-500">
                              -₹{u.totalWithdraw?.toFixed(0)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold">
                            {(u.totalWin || 0) - (u.totalBet || 0) >= 0 ? (
                              <span className="text-green-600">
                                +₹
                                {(
                                  (u.totalWin || 0) - (u.totalBet || 0)
                                ).toFixed(0)}
                              </span>
                            ) : (
                              <span className="text-red-500">
                                ₹
                                {(
                                  (u.totalWin || 0) - (u.totalBet || 0)
                                ).toFixed(0)}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        ) : loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 shadow-sm mt-4">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-dark font-bold mb-1">All Caught Up</h3>
            <p className="text-gray-400 text-sm">
              No pending {activeTab} at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {transactions.map((tx) => (
              <div
                key={tx._id}
                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-50">
                  <div>
                    <span
                      className={`inline-block px-2 text-[10px] font-bold rounded-md mb-1 ${activeTab === "deposits" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}
                    >
                      {tx.type.toUpperCase()}
                    </span>
                    <h3 className="text-dark font-black text-lg">
                      ₹{tx.amount?.toFixed(2)}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-dark">
                      {tx.userId?.username}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      UID: {tx.userId?.uid}
                    </p>
                  </div>
                </div>

                <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">
                    Method:{" "}
                    <span className="font-semibold text-dark">
                      {tx.method?.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeTab === "deposits"
                      ? "UTR/Ref: "
                      : "Account Details: "}
                    <span className="font-mono font-bold text-primary break-all">
                      {tx.accountDetails || "N/A"}
                    </span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction(tx._id, "reject")}
                    disabled={actionLoading === tx._id}
                    className="flex-1 py-2.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === tx._id ? "..." : "Reject"}
                  </button>
                  <button
                    onClick={() => handleAction(tx._id, "approve")}
                    disabled={actionLoading === tx._id}
                    className="flex-1 py-2.5 bg-green-500 text-white font-bold text-sm rounded-xl shadow-md shadow-green-500/20 hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === tx._id ? "Processing..." : "Approve"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <AuthGuard>
      <AdminDashboard />
    </AuthGuard>
  );
}
