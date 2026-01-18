import React from 'react';

export const MatchCircle: React.FC<{ score: number, size?: number }> = ({ score, size = 60 }) => {
  const radius = (size - 8) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;
  
  // Color based on score
  let strokeColor = "stroke-red-500";
  let shadowColor = "drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]";
  
  if (score >= 80) {
    strokeColor = "stroke-emerald-400";
    shadowColor = "drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]";
  } else if (score >= 50) {
    strokeColor = "stroke-amber-400";
    shadowColor = "drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]";
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background Circle */}
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-white/10"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          className={`${strokeColor} ${shadowColor} transition-all duration-1000 ease-out`}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white">{score}%</span>
      </div>
    </div>
  );
};