import React from 'react';

/**
 * Circular progress match badge with glow
 */
export const MatchCircle: React.FC<{ score: number, size?: number }> = ({ score, size = 52 }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let colorClass = "text-red-500";
  let glowClass = "shadow-[0_0_15px_rgba(239,68,68,0.3)]";
  
  if (score >= 80) {
    colorClass = "text-emerald-400";
    glowClass = "shadow-[0_0_20px_rgba(52,211,153,0.4)]";
  } else if (score >= 60) {
    colorClass = "text-amber-400";
    glowClass = "shadow-[0_0_20px_rgba(251,191,36,0.4)]";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Glow */}
      <div className={`absolute inset-0 rounded-full ${glowClass} opacity-50`} />
      
      <svg className="transform -rotate-90 w-full h-full drop-shadow-md" viewBox="0 0 44 44">
        {/* Background Circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          className="text-gray-700/50"
        />
        {/* Progress Circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          stroke="currentColor"
          strokeWidth="4"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-xs font-bold ${colorClass}`}>{score}</span>
      </div>
    </div>
  );
};