import React, { useState, useEffect } from 'react';
import { GlassButton, GlassInput, GlassCard } from './GlassUI';
import { ServiceType, IntegrationSettings } from '../types';
import { X, ExternalLink, ShieldCheck, Mail, Hash, Gamepad2, Webhook } from 'lucide-react';

interface Props {
  isOpen: boolean;
  service: ServiceType;
  mode: 'connect' | 'settings';
  initialSettings?: IntegrationSettings;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

const IntegrationModal: React.FC<Props> = ({ isOpen, service, mode, initialSettings, onClose, onSave }) => {
  const [loading, setLoading] = useState(false);
  
  // Connection Form State
  const [verificationCode, setVerificationCode] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  
  // Settings Form State
  const [settings, setSettings] = useState<IntegrationSettings>({
    frequency: 'instant',
    format: 'compact',
    notifyOn: {
      description: true,
      salary: true,
      skills: true,
      company: true
    }
  });

  useEffect(() => {
    if (initialSettings) setSettings(initialSettings);
  }, [initialSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 1000));
    
    // Build payload based on mode and service
    const payload = mode === 'connect' 
      ? { verificationCode, webhookUrl }
      : { settings };
      
    await onSave(payload);
    setLoading(false);
    onClose();
  };

  const renderConnectContent = () => {
    switch (service) {
      case 'telegram':
        return (
          <div className="space-y-6">
            <div className="bg-blue-500/20 border border-blue-500/30 p-4 rounded-xl text-sm text-blue-100">
              <h4 className="font-bold mb-2 flex items-center gap-2">Step 1: Start the Bot</h4>
              <p className="mb-3">Open Telegram and start a chat with our bot to get your verification code.</p>
              <a href="https://t.me/JobMatcherBot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white font-medium transition-colors">
                <ExternalLink size={16} /> Open @JobMatcherBot
              </a>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Step 2: Enter Verification Code</label>
              <GlassInput 
                placeholder="e.g. 123456" 
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                autoFocus
              />
            </div>
          </div>
        );
      case 'slack':
        return (
           <div className="text-center py-8">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <Hash size={32} className="text-gray-200" />
              </div>
              <p className="text-gray-300 mb-6">You will be redirected to Slack to authorize JobMatcher for your workspace.</p>
              <GlassButton className="w-full bg-[#4A154B] hover:bg-[#611f69] border-transparent text-white">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" className="w-5 h-5 mr-2" alt="Slack" />
                 Continue with Slack
              </GlassButton>
           </div>
        );
      case 'discord':
      case 'webhook':
        return (
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm text-gray-300">
               <h4 className="font-bold text-white mb-1">Instruction</h4>
               <p>1. Go to Server Settings &gt; Integrations &gt; Webhooks</p>
               <p>2. Create New Webhook and copy the URL</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Webhook URL</label>
              <GlassInput 
                placeholder="https://discord.com/api/webhooks/..." 
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
          </div>
        );
      default:
        return <div>Configuration not available yet.</div>;
    }
  };

  const renderSettingsContent = () => {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-300 block">Notification Frequency</label>
          <div className="grid grid-cols-3 gap-2">
            {['instant', 'daily', 'weekly'].map((freq) => (
              <button
                key={freq}
                onClick={() => setSettings({...settings, frequency: freq as any})}
                className={`px-3 py-2 rounded-lg text-sm border capitalize transition-all ${
                  settings.frequency === freq 
                  ? 'bg-blue-500/30 border-blue-400 text-blue-100' 
                  : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/5'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-sm text-gray-300 block">Message Format</label>
           <select 
              value={settings.format}
              onChange={(e) => setSettings({...settings, format: e.target.value as any})}
              className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/50 backdrop-blur-sm appearance-none"
           >
             <option value="compact" className="bg-slate-800">Compact (Title + Link)</option>
             <option value="detailed" className="bg-slate-800">Detailed (Full Description)</option>
             {service === 'email' && <option value="html" className="bg-slate-800">HTML Rich Email</option>}
           </select>
        </div>

        <div className="space-y-3">
          <label className="text-sm text-gray-300 block">Include in Alerts</label>
          <div className="grid grid-cols-2 gap-3">
             {Object.entries(settings.notifyOn || {}).map(([key, val]) => (
               <label key={key} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${val ? 'bg-blue-500 border-blue-400' : 'bg-transparent border-gray-500'}`}>
                    {val && <ShieldCheck size={12} className="text-white" />}
                  </div>
                  <input 
                    type="checkbox" 
                    className="hidden" 
                    checked={val} 
                    onChange={() => setSettings({
                      ...settings, 
                      notifyOn: {...settings.notifyOn, [key]: !val}
                    })}
                  />
                  <span className="text-gray-300 text-sm capitalize group-hover:text-white transition-colors">{key}</span>
               </label>
             ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <GlassCard className="w-full max-w-md p-0 overflow-hidden relative z-10 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {mode === 'connect' ? `Connect ${service.charAt(0).toUpperCase() + service.slice(1)}` : 'Settings'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6">
          {mode === 'connect' ? renderConnectContent() : renderSettingsContent()}
        </div>

        <div className="p-6 pt-0 flex gap-3">
           <GlassButton variant="secondary" onClick={onClose} className="flex-1">Cancel</GlassButton>
           <GlassButton 
              variant="primary" 
              onClick={handleSave} 
              className="flex-1"
              disabled={loading || (mode === 'connect' && service === 'telegram' && verificationCode.length < 3)}
            >
             {loading ? 'Saving...' : (mode === 'connect' ? 'Connect' : 'Save Changes')}
           </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};

export default IntegrationModal;