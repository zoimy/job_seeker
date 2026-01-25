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
        bg-white/5 backdrop-blur-[40px] 
        border border-white/15 
        rounded-3xl 
        shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Primary Action Button
export const GlassButton: React.FC<GlassProps & { variant?: 'primary' | 'secondary' | 'danger', disabled?: boolean, type?: 'button' | 'submit' | 'reset' }> = ({ 
  children, 
  className = "", 
  onClick, 
  variant = 'primary',
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = "relative px-6 py-3 rounded-2xl font-medium transition-all duration-300 backdrop-blur-md flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]";
  
  const variants = {
    primary: `
      bg-gradient-to-r from-blue-600/30 to-blue-500/30 
      border border-blue-400/30 text-white 
      shadow-[0_4px_20px_rgba(59,130,246,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]
      hover:from-blue-600/40 hover:to-blue-500/40 
      hover:shadow-[0_8px_30px_rgba(59,130,246,0.3)]
      hover:border-blue-400/50
    `,
    secondary: `
      bg-white/5 border border-white/10 text-gray-200 
      hover:bg-white/10 hover:border-white/20
      shadow-[0_2px_10px_rgba(0,0,0,0.1)]
    `,
    danger: `
      bg-gradient-to-r from-red-600/20 to-red-500/20 
      border border-red-400/30 text-red-100 
      hover:from-red-600/30 hover:to-red-500/30
      hover:shadow-[0_8px_30px_rgba(239,68,68,0.2)]
      hover:border-red-400/50
    `
  };

  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// Input Field with Label
interface GlassInputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  className = '',
  required = false
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          {label} {required && <span className="text-red-400">*</span>}
        </label>
      )}
      <input 
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="
          w-full px-5 py-3.5
          bg-black/30 backdrop-blur-sm
          border border-white/10 
          rounded-2xl text-white placeholder-gray-500 
          focus:outline-none focus:border-blue-400/40 focus:bg-black/40 
          focus:ring-4 focus:ring-blue-400/10
          transition-all duration-300
        "
      />
    </div>
  );
};

// Select Dropdown with Label
interface GlassSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}

export const GlassSelect: React.FC<GlassSelectProps> = ({ 
  label, 
  value, 
  onChange, 
  options,
  className = ''
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2 ml-1">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full px-5 py-3.5
          bg-black/30 backdrop-blur-sm
          border border-white/10 
          rounded-2xl text-white 
          focus:outline-none focus:border-blue-400/40 focus:bg-black/40 
          focus:ring-4 focus:ring-blue-400/10
          transition-all duration-300
          cursor-pointer appearance-none
        "
        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em`, paddingRight: `2.5rem` }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#0f1535] text-white py-2">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Badge
export const GlassBadge: React.FC<{ children: React.ReactNode, color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' }> = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-200 border-blue-400/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    green: 'bg-emerald-500/10 text-emerald-200 border-emerald-400/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
    yellow: 'bg-amber-500/10 text-amber-200 border-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    red: 'bg-red-500/10 text-red-200 border-red-400/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    purple: 'bg-purple-500/10 text-purple-200 border-purple-400/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
  };

  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full border backdrop-blur-md ${colors[color]}`}>
      {children}
    </span>
  );
};