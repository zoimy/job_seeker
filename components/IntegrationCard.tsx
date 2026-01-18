import React from 'react';
import { Integration, ServiceType } from '../types';
import { GlassButton } from './GlassUI';
import { CheckCircle, AlertTriangle, Crown, Settings2, Power, Zap } from 'lucide-react';

interface Props {
  integration: Integration;
  icon: React.ReactNode;
  onConnect: () => void;
  onDisconnect: () => void;
  onSettings: () => void;
  onTest: () => void;
}

const IntegrationCard: React.FC<Props> = ({ integration, icon, onConnect, onDisconnect, onSettings, onTest }) => {
  const { name, description, status, isPremium, lastNotification, connectionInfo } = integration;

  // Visual state styling
  const getStatusStyles = () => {
    switch (status) {
      case 'connected':
        return 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_20px_rgba(16,185,129,0.1)]';
      case 'error':
        return 'border-red-500/30 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
      case 'premium':
        return 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent';
      default:
        return 'border-white/20 border-dashed opacity-80 hover:opacity-100 hover:border-white/40';
    }
  };

  return (
    <div className={`
      relative p-6 rounded-[20px] border backdrop-blur-xl transition-all duration-300
      hover:scale-[1.02] hover:backdrop-blur-2xl
      flex flex-col h-full
      ${getStatusStyles()}
    `}>
      
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 z-10">
          <Crown size={12} fill="currentColor" /> PREMIUM
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white/10 rounded-2xl border border-white/10 shadow-inner">
          {icon}
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
           {status === 'connected' && <CheckCircle className="text-emerald-400" size={20} />}
           {status === 'error' && <AlertTriangle className="text-red-400" size={20} />}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
      <p className="text-sm text-gray-400 mb-4 flex-grow">{description}</p>

      {/* Connected Info (if active) */}
      {status === 'connected' && (
        <div className="mb-4 p-3 bg-black/20 rounded-xl border border-white/5 text-xs text-gray-300 space-y-1">
          {connectionInfo?.username && (
             <div className="flex justify-between">
               <span>Account:</span>
               <span className="text-emerald-300 font-mono">{connectionInfo.username}</span>
             </div>
          )}
          {connectionInfo?.email && (
             <div className="flex justify-between">
               <span>Email:</span>
               <span className="text-emerald-300">{connectionInfo.email}</span>
             </div>
          )}
          {lastNotification && (
            <div className="flex justify-between pt-1 border-t border-white/5 mt-1">
              <span>Last alert:</span>
              <span className="text-gray-400">{lastNotification.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto grid gap-2">
        {status === 'connected' ? (
          <div className="flex gap-2">
             <GlassButton onClick={onTest} variant="secondary" className="flex-1 text-xs px-2">
               <Zap size={14} /> Test
             </GlassButton>
             <GlassButton onClick={onSettings} variant="secondary" className="flex-1 text-xs px-2">
               <Settings2 size={14} /> Config
             </GlassButton>
             <GlassButton onClick={onDisconnect} variant="danger" className="px-3">
               <Power size={14} />
             </GlassButton>
          </div>
        ) : (
          <GlassButton 
            onClick={onConnect} 
            disabled={isPremium} // Mock logic for premium lock
            variant={isPremium ? 'secondary' : 'primary'}
            className="w-full"
          >
             {isPremium ? 'Unlock Feature' : 'Connect'}
          </GlassButton>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;