import React from 'react';

interface GlassProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Basic Glass Container
export const GlassCard: React.FC<GlassProps> = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white/10 dark:bg-slate-900/40 
        backdrop-blur-xl saturate-150
        border border-white/20 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] 
        rounded-2xl 
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:bg-white/15 hover:border-white/30 hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.45)]
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Primary Action Button
export const GlassButton: React.FC<GlassProps & { variant?: 'primary' | 'secondary' | 'danger', disabled?: boolean }> = ({ 
  children, 
  className = "", 
  onClick, 
  variant = 'primary',
  disabled = false
}) => {
  const baseStyles = "relative px-6 py-2.5 rounded-xl font-medium transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-500/20 border border-blue-400/30 text-blue-100 hover:bg-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    secondary: "bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 hover:border-white/20",
    danger: "bg-red-500/20 border border-red-400/30 text-red-100 hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Input Field
export const GlassInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return (
    <input 
      {...props}
      className={`
        w-full px-4 py-3 
        bg-black/20 border border-white/10 
        rounded-xl text-white placeholder-gray-400 
        backdrop-blur-sm
        focus:outline-none focus:border-blue-400/50 focus:bg-black/30 focus:ring-1 focus:ring-blue-400/30
        transition-all duration-300
        ${props.className}
      `}
    />
  );
};

// Badge
export const GlassBadge: React.FC<{ children: React.ReactNode, color?: 'blue' | 'green' | 'yellow' | 'red' }> = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500/20 text-blue-200 border-blue-400/20',
    green: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/20',
    yellow: 'bg-amber-500/20 text-amber-200 border-amber-400/20',
    red: 'bg-red-500/20 text-red-200 border-red-400/20',
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${colors[color]}`}>
      {children}
    </span>
  );
};