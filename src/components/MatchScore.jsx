import { motion } from "framer-motion";

export function MatchScore({ value, size = "md" }) {
  const radius = size === "lg" ? 34 : 24;
  const stroke = size === "lg" ? 8 : 6;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const box = size === "lg" ? 84 : 60;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: box, height: box }}>
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} className="-rotate-90">
        <circle cx={box / 2} cy={box / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
        <motion.circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="#2563EB"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute text-sm font-bold text-slate-950">{value}%</span>
    </div>
  );
}
