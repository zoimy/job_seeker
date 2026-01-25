import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { GlassButton, GlassInput, GlassCard } from './GlassUI';
import { ServiceType, IntegrationSettings } from '../types';
import { X, ExternalLink, ShieldCheck, Hash } from 'lucide-react';

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
  const [chatId, setChatId] = useState(''); // For Telegram
  const [webhookUrl, setWebhookUrl] = useState(''); // For Slack, Discord, Webhook
  const [email, setEmail] = useState(''); // For Email
  
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
    // Reset form state when modal opens
    if (isOpen) {
      setChatId('');
      setWebhookUrl('');
      setEmail('');
    }
  }, [initialSettings, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    // Simulate API delay
    await new Promise(r => setTimeout(r, 600));
    
    // Build payload based on mode and service
    const payload = mode === 'connect' 
      ? { chatId, webhookUrl, email, settings }
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
            <div className="bg-blue-500/10 border border-blue-500/30 p-5 rounded-2xl text-sm text-blue-100 shadow-inner">
              <h4 className="font-bold mb-3 flex items-center gap-2 text-blue-300">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">1</span>
                Start the Bot
              </h4>
              <p className="mb-4 text-blue-200/70 leading-relaxed">Open Telegram and start a chat with our bot to initialize the secure connection.</p>
              <a href="https://t.me/JobMatcherBot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl text-white font-medium transition-all shadow-lg shadow-blue-600/20">
                <ExternalLink size={16} /> Open @JobMatcherBot
              </a>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                <span className="w-5 h-5 inline-flex rounded-full bg-white/10 items-center justify-center text-xs mr-2">2</span>
                Enter Your Chat ID
              </label>
              <GlassInput 
                placeholder="e.g. 123456789" 
                value={chatId}
                onChange={(val) => setChatId(val)}
              />
              <p className="text-xs text-gray-400 mt-1 pl-1">Get this from @userinfobot if you don't have it.</p>
            </div>
          </div>
        );
      case 'slack':
        return (
           <div className="text-center py-10">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                 <Hash size={40} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Connect Workspace</h3>
              <p className="text-gray-400 mb-8 max-w-xs mx-auto">Redirecting to Slack to authorize JobMatcher for your workspace channels.</p>
              <GlassButton className="w-full bg-[#4A154B] hover:bg-[#611f69] border-transparent text-white justify-center shadow-lg shadow-[#4A154B]/30">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg" className="w-5 h-5 mr-3" alt="Slack" />
                 Continue with Slack
              </GlassButton>
           </div>
        );
      case 'discord':
      case 'webhook':
        return (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-sm text-gray-300">
               <h4 className="font-bold text-white mb-2">Setup Instructions</h4>
               <ul className="space-y-2 list-disc list-inside text-gray-400">
                 <li>Go to Server Settings &gt; Integrations &gt; Webhooks</li>
                 <li>Create New Webhook</li>
                 <li>Copy the Webhook URL</li>
               </ul>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Webhook URL</label>
              <GlassInput 
                placeholder="https://discord.com/api/webhooks/..." 
                value={webhookUrl}
                onChange={(val) => setWebhookUrl(val)}
              />
            </div>
          </div>
        );
      default:
        return <div className="p-4 text-center text-gray-400">Configuration not available yet.</div>;
    }
  };

  const renderSettingsContent = () => {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-300 block ml-1">Notification Frequency</label>
          <div className="grid grid-cols-3 gap-3">
            {['instant', 'daily', 'weekly'].map((freq) => (
              <button
                key={freq}
                onClick={() => setSettings({...settings, frequency: freq as any})}
                className={`px-4 py-3 rounded-xl text-sm capitalize transition-all duration-300 border ${
                  settings.frequency === freq 
                  ? 'bg-blue-500/20 border-blue-400/50 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                  : 'bg-black/20 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {freq}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
           <label className="text-sm font-medium text-gray-300 block ml-1">Message Format</label>
           <div className="relative">
             <select 
                value={settings.format}
                onChange={(e) => setSettings({...settings, format: e.target.value as any})}
                className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-blue-400/50 backdrop-blur-sm appearance-none cursor-pointer"
             >
               <option value="compact" className="bg-[#0f1535]">Compact (Title + Link)</option>
               <option value="detailed" className="bg-[#0f1535]">Detailed (Full Description)</option>
               {service === 'email' && <option value="html" className="bg-[#0f1535]">HTML Rich Email</option>}
             </select>
             <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
             </div>
           </div>
        </div>

        <div className="space-y-4">
          <label className="text-sm font-medium text-gray-300 block ml-1">Include in Alerts</label>
          <div className="grid grid-cols-2 gap-4">
             {Object.entries(settings.notifyOn || {}).map(([key, val]) => (
               <label key={key} className="flex items-center gap-3 cursor-pointer group p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${val ? 'bg-blue-500 border-blue-500' : 'bg-transparent border-gray-500'}`}>
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

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0a0e27]/90 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Content */}
      <GlassCard className="w-full max-w-lg p-0 overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 shadow-2xl shadow-black/50 border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent">
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            {mode === 'connect' ? `Connect ${service.charAt(0).toUpperCase() + service.slice(1)}` : 'Settings'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {mode === 'connect' ? renderConnectContent() : renderSettingsContent()}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 flex gap-4">
           <GlassButton variant="secondary" onClick={onClose} className="flex-1">Cancel</GlassButton>
           <GlassButton 
              variant="primary" 
              onClick={handleSave} 
              className="flex-1 shadow-lg shadow-blue-500/20"
              disabled={loading || (mode === 'connect' && service === 'telegram' && chatId.length < 3) || (mode === 'connect' && ['slack', 'discord', 'webhook'].includes(service) && webhookUrl.length < 10)}
            >
             {loading ? 'Saving...' : (mode === 'connect' ? 'Connect Integration' : 'Save Changes')}
           </GlassButton>
        </div>
      </GlassCard>
    </div>,
    document.body
  );
};

export default IntegrationModal;