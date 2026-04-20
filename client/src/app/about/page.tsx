"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiMessageCircle, FiInstagram, FiCopy, FiCheck, FiAlertTriangle, FiInfo, FiFileText } from "react-icons/fi";
import Link from 'next/link';

export default function About() {
  const [copied, setCopied] = useState(false);
  const usdtAddress = "0x71C3606Af445125010ac0369EE8F5013c9Eb8138";

  const handleCopy = () => {
    navigator.clipboard?.writeText(usdtAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-bg pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-secondary px-5 py-6 pt-10 sticky top-0 z-50 shadow-md">
        <h1 className="text-white text-2xl font-extrabold tracking-wide text-center">
          About Us
        </h1>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Socials & Connect */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-4">
            <FiMessageCircle className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-dark">Connect With Us</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <Link
              href="https://t.me/thegamenation0"
              target="_blank"
              className="bg-blue-50 text-blue-600 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-blue-100 transition"
            >
              <FiMessageCircle className="w-6 h-6" />
              <span className="text-xs font-bold">Telegram</span>
            </Link>

            <Link
              href="https://www.instagram.com/llama.3550810"
              target="_blank"
              className="bg-pink-50 text-pink-600 rounded-xl p-3 flex flex-col items-center justify-center gap-2 hover:bg-pink-100 transition"
            >
              <FiInstagram className="w-6 h-6" />
              <span className="text-xs font-bold">Instagram</span>
            </Link>
          </div>

          {/* USDT Address */}
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
            <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-wider">
              USDT BEP-20 Wallet
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-dark font-medium truncate break-all">
                {usdtAddress}
              </span>
              <button
                onClick={handleCopy}
                className="shrink-0 bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary/20 transition"
              >
                {copied ? (
                  <FiCheck className="w-4 h-4 text-green-500" />
                ) : (
                  <FiCopy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <FiAlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-dark">
              Important Disclaimer
            </h2>
          </div>
          <div className="space-y-3 text-xs text-gray-500 leading-relaxed">
            <p>
              This game is created for entertainment and skill-based purposes
              only. Participation is completely voluntary and at your own risk.
            </p>
            <p>
              We do not guarantee any winnings or profits. Any gain or loss that
              occurs while playing this game is solely the player’s
              responsibility.
            </p>
            <p>
              This platform is not responsible for any financial loss, mental
              stress, or any other consequences arising from the use of this
              game. Please play responsibly and with proper understanding.
            </p>
          </div>
        </motion.div>

        {/* Terms and Conditions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <FiFileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-sm font-bold text-dark">
              ✔️ Terms & Conditions
            </h2>
          </div>
          <ul className="space-y-2 text-xs text-gray-500 leading-relaxed list-disc list-inside">
            <li>This is a skill-based game only.</li>
            <li>
              Individuals under 18 years of age are not allowed to participate.
            </li>
            <li>
              Any kind of illegal or unfair activity is strictly prohibited.
            </li>
            <li>
              In case of any dispute, the platform’s decision will be final.
            </li>
          </ul>
        </motion.div>

        {/* Warning */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-red-50 border border-red-100 rounded-2xl p-5 shadow-sm text-center"
        >
          <div className="flex justify-center mb-2">
            <FiInfo className="w-6 h-6 text-red-500" />
          </div>
          <h2 className="text-sm font-bold text-red-700 mb-1">👉 Warning</h2>
          <p className="text-xs text-red-600/80 mb-3 leading-relaxed">
            This game may be addictive. Play within your limits of time and
            money.
          </p>
          <p className="text-xs font-bold text-red-700 italic">
            “Play smart – your responsibility is your own.”
          </p>
        </motion.div>
      </div>
    </div>
  );
}
