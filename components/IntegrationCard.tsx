import React from 'react';
import { Integration } from '../types';
import { GlassButton, GlassCard } from './GlassUI';
import { CheckCircle, AlertTriangle, Crown, Settings2, Power, Zap, ExternalLink } from 'lucide-react';

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
        return 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.1)]';
      case 'error':
        return 'border-red-500/30 bg-red-500/5 shadow-[0_0_30px_rgba(239,68,68,0.1)]';
      case 'premium':
        return 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-transparent';
      default:
        return 'border-white/10 opacity-80 hover:opacity-100 hover:border-white/30';
    }
  };

  return (
    <div className={`
      relative p-6 rounded-[24px] border backdrop-blur-xl transition-all duration-300
      hover:scale-[1.02] hover:backdrop-blur-2xl group
      flex flex-col h-full bg-white/5
      ${getStatusStyles()}
    `}>
      
      {/* Premium Badge */}
      {isPremium && (
        <div className="absolute -top-3 -right-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-amber-500/40 flex items-center gap-1 z-10 uppercase tracking-wide">
          <Crown size={12} fill="currentColor" /> PREMIUM
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="p-3.5 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-md">
          {icon}
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center gap-2">
           {status === 'connected' && <div className="bg-emerald-500/20 p-1.5 rounded-full"><CheckCircle className="text-emerald-400" size={18} /></div>}
           {status === 'error' && <div className="bg-red-500/20 p-1.5 rounded-full animate-pulse"><AlertTriangle className="text-red-400" size={18} /></div>}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-blue-300 transition-colors">{name}</h3>
      <p className="text-sm text-gray-400 mb-6 flex-grow leading-relaxed">{description}</p>

      {/* Connected Info (if active) */}
      {status === 'connected' && (
        <div className="mb-6 p-4 bg-black/30 rounded-2xl border border-white/5 text-xs text-gray-300 space-y-2 backdrop-blur-sm">
          {connectionInfo?.username && (
             <div className="flex justify-between items-center">
               <span className="text-gray-400">Account</span>
               <span className="text-emerald-300 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{connectionInfo.username}</span>
             </div>
          )}
          {connectionInfo?.email && (
             <div className="flex justify-between items-center">
               <span className="text-gray-400">Email</span>
               <span className="text-emerald-300">{connectionInfo.email}</span>
             </div>
          )}
          {lastNotification && (
            <div className="flex justify-between items-center pt-2 border-t border-white/5 mt-2">
              <span className="text-gray-400">Last alert</span>
              <span className="text-gray-300">{new Date(lastNotification).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto grid gap-2">
        {status === 'connected' ? (
          <div className="flex gap-2">
             <GlassButton onClick={onTest} variant="secondary" className="flex-1 text-xs px-2 h-10">
               <Zap size={14} className="mr-1.5" /> Test
             </GlassButton>
             <GlassButton onClick={onSettings} variant="secondary" className="flex-1 text-xs px-2 h-10">
               <Settings2 size={14} className="mr-1.5" /> Config
             </GlassButton>
             <GlassButton onClick={onDisconnect} variant="danger" className="px-3 h-10">
               <Power size={14} />
             </GlassButton>
          </div>
        ) : (
          <GlassButton 
            onClick={onConnect} 
            disabled={isPremium} 
            variant={isPremium ? 'secondary' : 'primary'}
            className="w-full justify-center group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all"
          >
             {isPremium ? (
               <span className="flex items-center gap-2"><Crown size={14} /> Unlock Feature</span>
             ) : (
               <span className="flex items-center gap-2">Connect <ExternalLink size={14} /></span>
             )}
          </GlassButton>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;