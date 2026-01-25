import React from 'react';

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  // Ensure we don't divide by zero if totalSteps is 1
  const steps = Math.max(totalSteps - 1, 1);
  const percentage = Math.round((Math.max(0, currentStep - 1) / steps) * 100);
  
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-400">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-bold text-blue-400">
          {percentage}%
        </span>
      </div>
      
      <div className="w-full h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
