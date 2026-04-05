'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { spinnerAPI } from '@/services/api';
import AuthGuard from '@/components/AuthGuard';
import Header from '@/components/Header';
import { motion } from 'framer-motion';

const SEGMENTS = [
  { display: '₹0-10', color: '#FF6B35' },
  { display: '₹5', color: '#FFD700' },
  { display: '₹10', color: '#FF4D4D' },
  { display: '₹500', color: '#00C851' },
  { display: 'Nothing', color: '#999999' },
  { display: '₹20', color: '#FF6B35' },
  { display: '₹30', color: '#FFD700' },
  { display: '₹50', color: '#FF4D4D' },
];

function SpinnerContent() {
  const { user, updateUser } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [history, setHistory] = useState([]);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef(null);

  useEffect(() => {
    if (user) {
      spinnerAPI.getStatus().then(res => setStatus(res.data)).catch(() => {});
      spinnerAPI.getHistory().then(res => setHistory(res.data.history || [])).catch(() => {});
    }
  }, [user]);

  const handleSpin = async () => {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    try {
      const res = await spinnerAPI.spin();
      const { segmentIndex, displayReward, actualReward, balance } = res.data;

      const segmentAngle = 360 / SEGMENTS.length;
      const targetAngle = 360 - (segmentIndex * segmentAngle) - (segmentAngle / 2);
      const totalRotation = rotation + 1800 + targetAngle;

      setRotation(totalRotation);

      setTimeout(() => {
        setResult({ displayReward, actualReward });
        updateUser({ balance });
        setSpinning(false);
        spinnerAPI.getStatus().then(r => setStatus(r.data)).catch(() => {});
        spinnerAPI.getHistory().then(r => setHistory(r.data.history || [])).catch(() => {});
      }, 4000);
    } catch (err) {
      setResult({ error: err.response?.data?.error || 'Spin failed' });
      setSpinning(false);
    }
  };

  const canSpin = status?.canSpin !== false;
  const freeSpins = status?.freeTrialSpinsLeft || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-500 via-orange-500 to-amber-500 pb-20">
      <Header title="Invite Wheel" className="!bg-transparent [&_h1]:text-white [&_button]:text-white [&_svg]:text-white" showBack={true} />

      {/* Amount Display */}
      <div className="text-center mt-4 px-4">
        <p className="text-white/70 text-sm">my amount</p>
        <p className="text-white text-4xl font-extrabold mt-1">₹{user.balance?.toFixed(2)}</p>
        <button className="mt-3 px-8 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-dark font-bold rounded-full shadow-lg text-sm">
          CASH OUT
        </button>
      </div>

      {/* Wheel */}
      <div className="flex justify-center mt-8 relative">
        <div className="relative w-72 h-72">
          {/* Decorative light dots */}
          <div className="absolute inset-0 rounded-full border-8 border-red-800/50">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className={`absolute w-2.5 h-2.5 rounded-full ${spinning ? 'animate-pulse' : ''}`}
                style={{
                  background: i % 2 === 0 ? '#FFD700' : '#FFFFFF',
                  left: `${50 + 46 * Math.cos((i * 18 - 90) * Math.PI / 180)}%`,
                  top: `${50 + 46 * Math.sin((i * 18 - 90) * Math.PI / 180)}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
          </div>

          {/* Wheel SVG */}
          <div
            ref={wheelRef}
            className="absolute inset-4 rounded-full overflow-hidden shadow-2xl"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning ? 'transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
            }}
          >
            <svg viewBox="0 0 200 200" className="w-full h-full">
              {SEGMENTS.map((seg, i) => {
                const angle = 360 / SEGMENTS.length;
                const startAngle = i * angle - 90;
                const endAngle = startAngle + angle;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const x1 = 100 + 100 * Math.cos(startRad);
                const y1 = 100 + 100 * Math.sin(startRad);
                const x2 = 100 + 100 * Math.cos(endRad);
                const y2 = 100 + 100 * Math.sin(endRad);
                const midRad = ((startAngle + endAngle) / 2 * Math.PI) / 180;
                const textX = 100 + 65 * Math.cos(midRad);
                const textY = 100 + 65 * Math.sin(midRad);
                const textAngle = (startAngle + endAngle) / 2 + 90;

                return (
                  <g key={i}>
                    <path
                      d={`M100,100 L${x1},${y1} A100,100 0 0,1 ${x2},${y2} Z`}
                      fill={i % 2 === 0 ? '#FFF3E0' : '#FFE0B2'}
                      stroke="#E0A000"
                      strokeWidth="0.5"
                    />
                    <text
                      x={textX}
                      y={textY}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                      fontSize="8"
                      fontWeight="bold"
                      fill="#333"
                    >
                      {seg.display}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Center button */}
          <button
            onClick={handleSpin}
            disabled={spinning || !canSpin}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-gradient-to-b from-red-500 to-red-700 shadow-xl flex flex-col items-center justify-center z-10 disabled:opacity-60 transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-white text-xs font-bold">X{freeSpins}</span>
            <span className="text-white text-[8px]">FREE SPIN</span>
          </button>

          {/* Pointer/arrow at top */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-20">
            <div className="w-0 h-0 border-l-10 border-r-10 border-t-16 border-l-transparent border-r-transparent border-t-red-800" />
          </div>
        </div>
      </div>

      {/* Result Display */}
      {result && !result.error && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-4 mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center"
        >
          <p className="text-white font-bold text-lg">
            {result.actualReward > 0 ? `🎉 You won ₹${result.actualReward}!` : '😅 Better luck next time!'}
          </p>
          <p className="text-white/70 text-xs mt-1">Wheel showed: {result.displayReward}</p>
        </motion.div>
      )}

      {result?.error && (
        <div className="mx-4 mt-4 bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
          <p className="text-white font-medium text-sm">{result.error}</p>
        </div>
      )}

      {/* Invite Button */}
      <div className="px-4 mt-6">
        <button className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-dark font-bold rounded-full shadow-lg text-sm tracking-wide">
          INVITE FRIENDS TO GET SPIN
        </button>
        <p className="text-center text-white/70 text-xs mt-2">
          Only ₹20.25 left to get prize ₹500.00
        </p>
      </div>

      {/* Spin History */}
      <div className="px-4 mt-6 mb-4">
        <h3 className="text-white font-bold text-sm mb-2">Record</h3>
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden">
          {history.length === 0 ? (
            <p className="text-white/50 text-sm text-center py-6">No spin records yet</p>
          ) : (
            history.slice(0, 10).map((item, idx) => (
              <div key={idx} className={`flex items-center justify-between px-4 py-3 ${idx < history.length - 1 ? 'border-b border-white/10' : ''}`}>
                <div>
                  <p className="text-white text-sm font-medium">{item.displayReward}</p>
                  <p className="text-white/50 text-[10px]">{new Date(item.createdAt).toLocaleString()}</p>
                </div>
                <span className={`font-bold text-sm ${item.reward > 0 ? 'text-green-400' : 'text-white/40'}`}>
                  +₹{item.reward}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function SpinnerPage() {
  return (
    <AuthGuard>
      <SpinnerContent />
    </AuthGuard>
  );
}
