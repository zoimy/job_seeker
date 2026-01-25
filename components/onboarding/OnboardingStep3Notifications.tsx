import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from '../GlassUI';
import { OnboardingProgress } from './OnboardingProgress';
import { notificationServiceClient } from '../../services/notificationService';
import { Mail, Send, Bell, Instagram, MessageSquare, CheckCircle, Smartphone } from 'lucide-react';

interface OnboardingStep3NotificationsProps {
  data: {
    channels: ('email' | 'telegram')[];
    email: string;
    emailPassword: string;
    emailService: string;
    frequency: string;
    telegramChatId?: string;
  };
  onUpdate: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep3Notifications({
  data,
  onUpdate,
  onNext,
  onBack
}: OnboardingStep3NotificationsProps) {
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [emailResult, setEmailResult] = useState<{ success: boolean; message: string } | null>(null);
  const [telegramResult, setTelegramResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const channels = data.channels || [];
  const isEmailEnabled = channels.includes('email');
  const isTelegramEnabled = channels.includes('telegram');

  const toggleChannel = (channel: 'email' | 'telegram') => {
    let newChannels = [...channels];
    if (newChannels.includes(channel)) {
      newChannels = newChannels.filter(c => c !== channel);
    } else {
      newChannels.push(channel);
    }
    onUpdate({ channels: newChannels });
  };

  const handleTestEmail = async () => {
    if (!isEmailValid()) return;
    setTestingEmail(true);
    setEmailResult(null);
    try {
      const result = await notificationServiceClient.sendTestNotification(data.email);
      setEmailResult({
        success: result.success,
        message: result.success ? 'Success! Check your inbox.' : (result.error || 'Failed')
      });
    } catch (e: any) {
      setEmailResult({ success: false, message: e.message });
    }
    setTestingEmail(false);
  };

  const handleTestTelegram = async () => {
    if (!data.telegramChatId) return;
    setTestingTelegram(true);
    setTelegramResult(null);
    try {
      const result = await notificationServiceClient.sendTestTelegram(data.telegramChatId);
      setTelegramResult({
        success: result.success,
        message: result.success ? 'Success! Check Telegram.' : (result.error || 'Failed')
      });
    } catch (e: any) {
      setTelegramResult({ success: false, message: e.message });
    }
    setTestingTelegram(false);
  };

  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(data.email) && data.emailPassword?.length > 0;
  };

  const isTelegramValid = () => {
    return !!data.telegramChatId && data.telegramChatId.trim().length > 0;
  };

  const isValid = () => {
    // User MUST select at least one channel AND configure it properly
    const hasValidEmail = isEmailEnabled && isEmailValid();
    const hasValidTelegram = isTelegramEnabled && isTelegramValid();
    
    // Must have at least ONE valid channel configured
    return hasValidEmail || hasValidTelegram;
  };

  const handleNextWithValidation = () => {
    if(isValid()) onNext();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8 shadow-2xl shadow-blue-900/10">
        <OnboardingProgress currentStep={3} totalSteps={5} />
        
        <div className="space-y-8 mt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
              <Bell className="text-blue-400" size={24} /> Notification Setup
            </h2>
            <p className="text-gray-400">Choose how you want to be alerted about new jobs.</p>
          </div>

          {/* CHANNEL SELECTION GRID */}
          <div className="grid grid-cols-2 gap-4">
            {/* Telegram Toggle */}
            <button
              onClick={() => toggleChannel('telegram')}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${
                isTelegramEnabled
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <div className={`p-3 rounded-full transition-colors ${isTelegramEnabled ? 'bg-blue-500' : 'bg-white/10'}`}>
                <Send size={24} className="ml-0.5" />
              </div>
              <div>
                <span className="font-bold block">Telegram</span>
                <span className="text-xs opacity-70">Instant Push</span>
              </div>
              {isTelegramEnabled && <div className="absolute top-3 right-3 text-blue-400"><CheckCircle size={18} /></div>}
            </button>

            {/* Email Toggle */}
            <button
              onClick={() => toggleChannel('email')}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col items-center gap-3 relative overflow-hidden group ${
                isEmailEnabled
                  ? 'bg-purple-600/20 border-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.2)]'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/20'
              }`}
            >
               <div className={`p-3 rounded-full transition-colors ${isEmailEnabled ? 'bg-purple-500' : 'bg-white/10'}`}>
                <Mail size={24} />
              </div>
              <div>
                <span className="font-bold block">Email</span>
                <span className="text-xs opacity-70">Weekly Digest</span>
              </div>
              {isEmailEnabled && <div className="absolute top-3 right-3 text-purple-400"><CheckCircle size={18} /></div>}
            </button>
          </div>

          {/* CONFIGURATION SECTIONS */}
          <div className="space-y-6">
            
            {/* Telegram Config */}
            {isTelegramEnabled && (
              <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-500">
                <h3 className="text-blue-200 font-semibold mb-4 flex items-center gap-2">
                  <Smartphone size={18} /> Telegram Configuration
                </h3>
                
                <div className="space-y-4">
                   <div className="bg-black/20 p-4 rounded-xl text-sm text-blue-100/80 border border-white/5">
                      <p className="mb-2 font-medium">To receive messages:</p>
                      <ol className="space-y-1.5 list-decimal list-inside text-xs">
                        <li>Start your chat with <a href="https://t.me/jobsearch_md_bot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-bold">@jobsearch_md_bot</a></li>
                        <li>Click <strong>Start</strong></li>
                        <li>Get your ID from <a href="https://t.me/userinfobot" target="_blank" className="text-blue-400 hover:underline">@userinfobot</a></li>
                      </ol>
                   </div>
                   
                   <GlassInput
                    value={data.telegramChatId || ''}
                    onChange={(val) => onUpdate({ telegramChatId: val })}
                    placeholder="Paste Chat ID here (e.g. 123456789)"
                   />

                   <div className="flex gap-3 items-center">
                     <GlassButton 
                       variant="secondary" 
                       className="text-xs px-3 py-2 h-auto"
                       onClick={handleTestTelegram}
                       disabled={!data.telegramChatId || testingTelegram}
                     >
                       {testingTelegram ? 'Sending...' : 'Test Connection'}
                     </GlassButton>
                     {telegramResult && (
                       <span className={`text-xs font-medium animate-in fade-in ${telegramResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                         {telegramResult.message}
                       </span>
                     )}
                   </div>
                </div>
              </div>
            )}

            {/* Email Config */}
            {isEmailEnabled && (
              <div className="bg-purple-900/20 border border-purple-500/20 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-500">
                <h3 className="text-purple-200 font-semibold mb-4 flex items-center gap-2">
                  <Mail size={18} /> Email Configuration
                </h3>

                <div className="space-y-4">
                  <GlassSelect
                    value={data.emailService}
                    onChange={(val) => onUpdate({ emailService: val })}
                    options={[
                      { value: 'gmail', label: 'Gmail' },
                      { value: 'outlook', label: 'Outlook' },
                      { value: 'other', label: 'Other SMTP' }
                    ]}
                  />
                  
                  <GlassInput
                    value={data.email}
                    onChange={(val) => onUpdate({ email: val })}
                    placeholder="your@email.com"
                  />

                  <div>
                    <GlassInput
                      type="password"
                      value={data.emailPassword}
                      onChange={(val) => onUpdate({ emailPassword: val })}
                      placeholder="App Password"
                    />
                    {data.emailService === 'gmail' && (
                      <p className="text-[10px] text-gray-400 mt-1.5 ml-1">
                        Use an App Password, NOT your login password. <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-purple-400 hover:underline">Generate here</a>.
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 items-center">
                     <GlassButton 
                       variant="secondary" 
                       className="text-xs px-3 py-2 h-auto"
                       onClick={handleTestEmail}
                       disabled={!isEmailValid() || testingEmail}
                     >
                       {testingEmail ? 'Sending...' : 'Test Email'}
                     </GlassButton>
                     {emailResult && (
                       <span className={`text-xs font-medium animate-in fade-in ${emailResult.success ? 'text-emerald-400' : 'text-red-400'}`}>
                         {emailResult.message}
                       </span>
                     )}
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <GlassSelect
              label="Notification Frequency"
              value={data.frequency}
              onChange={(val) => onUpdate({ frequency: val })}
              options={[
                { value: 'instant', label: '⚡ Instant (Recommended)' },
                { value: '1h', label: 'Hourly' },
                { value: '24h', label: 'Daily Summary' }
              ]}
            />
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-4 border-t border-white/10">
            <GlassButton
              variant="secondary"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={handleNextWithValidation}
              disabled={!isValid()}
              className="flex-1 shadow-lg shadow-blue-500/20"
            >
              {!isValid() ? 'Choose at least 1 channel' : 'Continue'}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
