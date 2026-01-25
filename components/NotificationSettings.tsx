import { useState, useEffect } from 'react';
import { GlassCard, GlassButton, GlassInput, GlassSelect } from './GlassUI';
import { notificationServiceClient, type NotificationPreferences } from '../services/notificationService';
import { Bell, Mail, Settings, Send, Smartphone } from 'lucide-react';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    enabled: false,
    email: '',
    emailPassword: '',
    emailService: 'gmail',
    telegramChatId: '',
    minMatchScore: 70, // Raised from 60 to 70 for better relevance
    frequency: '6h'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    setLoading(true);
    const prefs = await notificationServiceClient.getPreferences();
    setPreferences(prefs);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    // Validate
    // Validate: At least one channel must be configured if enabled
    const hasEmail = preferences.email && preferences.emailPassword;
    const hasTelegram = preferences.telegramChatId;

    if (preferences.enabled && !hasEmail && !hasTelegram) {
      setMessage({ type: 'error', text: 'At least one notification channel (Email or Telegram) is required' });
      setSaving(false);
      return;
    }

    const success = await notificationServiceClient.updatePreferences(preferences);

    if (success) {
      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } else {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    }

    setSaving(false);
  };

  const handleTestNotification = async () => {
    if (!preferences.email) {
      setMessage({ type: 'error', text: 'Enter email address first' });
      return;
    }

    setTesting(true);
    setMessage(null);

    const result = await notificationServiceClient.sendTestNotification(preferences.email);

    if (result.success) {
      setMessage({ type: 'success', text: 'Test email sent! Check your inbox.' });
    } else {
      setMessage({ type: 'error', text: `Failed: ${result.error || 'Unknown error'}` });
    }

    setTesting(false);
  };

  const handleTestTelegram = async () => {
    if (!preferences.telegramChatId) {
      setMessage({ type: 'error', text: 'Enter Telegram Chat ID first' });
      return;
    }

    setTestingTelegram(true);
    setMessage(null);

    const result = await notificationServiceClient.sendTestTelegram(preferences.telegramChatId);

    if (result.success) {
      setMessage({ type: 'success', text: 'Test Telegram sent! Check your Telegram app.' });
    } else {
      setMessage({ type: 'error', text: `Failed: ${result.error || 'Unknown error'}` });
    }

    setTestingTelegram(false);
  };

  if (loading) {
    return (
      <GlassCard className="p-8 max-w-2xl mx-auto text-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-white/10 rounded-full"></div>
          <div className="h-4 bg-white/10 rounded w-1/2"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
           <Bell className="text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" size={32} /> 
           Notification Settings
        </h1>
        <p className="text-blue-200/70">Configure how and when you want to be alerted about new job matches.</p>
      </div>

      <GlassCard className="p-8 space-y-8 shadow-2xl shadow-purple-900/20">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-500/20 rounded-lg">
               <Bell size={20} className="text-blue-300" />
             </div>
             <div>
               <h3 className="text-lg font-semibold text-white">Enable Alerts</h3>
               <p className="text-sm text-gray-400">Receive notifications for new job matches</p>
             </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.enabled}
              onChange={(e) => setPreferences({ ...preferences, enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-black/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 peer-checked:after:bg-white shadow-inner"></div>
          </label>
        </div>

        <div className="space-y-6">
           <div className="flex items-center gap-2 text-white/90 font-semibold border-b border-white/10 pb-2">
             <Mail size={18} className="text-emerald-400" /> Email Configuration
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassSelect
                label="Email Service"
                value={preferences.emailService || 'gmail'}
                onChange={(value) => setPreferences({ ...preferences, emailService: value })}
                options={[
                  { value: 'gmail', label: 'Gmail' },
                  { value: 'outlook', label: 'Outlook' },
                  { value: 'other', label: 'Other SMTP' }
                ]}
              />

              <GlassInput
                label="Email Address"
                type="email"
                value={preferences.email}
                onChange={(value) => setPreferences({ ...preferences, email: value })}
                placeholder="searcher@example.com"
              />
           </div>

           <div>
              <GlassInput
                label="App Password (Not your login password)"
                type="password"
                value={preferences.emailPassword || ''}
                onChange={(value) => setPreferences({ ...preferences, emailPassword: value })}
                placeholder="xxxx xxxx xxxx xxxx"
              />
              <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                {preferences.emailService === 'gmail' ? (
                  <>
                    <span>Use a Gmail App Password.</span>
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-0.5">
                      Generate here <Send size={10} />
                    </a>
                  </>
                ) : (
                  'Use your email app-specific password for security.'
                )}
              </div>
           </div>

           <GlassButton
             variant="secondary"
             onClick={handleTestNotification}
             disabled={testing || !preferences.email}
             className="w-full sm:w-auto"
           >
             {testing ? <span className="animate-pulse">Sending...</span> : <span className="flex items-center gap-2"><Send size={14}/> Send Test Email</span>}
           </GlassButton>
        </div>

        <div className="space-y-6 pt-2">
           <div className="flex items-center gap-2 text-white/90 font-semibold border-b border-white/10 pb-2">
             <Settings size={18} className="text-purple-400" /> Preferences
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
             <GlassSelect
                label="Scan Frequency"
                value={preferences.frequency}
                onChange={(value) => setPreferences({ ...preferences, frequency: value as any })}
                options={[
                  { value: 'instant', label: '⚡ Instant (Every 2 mins)' },
                  { value: '5min', label: 'Every 5 Minutes' },
                  { value: '1h', label: 'Every Hour' },
                  { value: '6h', label: 'Every 6 Hours' },
                  { value: '24h', label: 'Once Daily (9 AM)' }
                ]}
              />

              <div className="space-y-3 pt-1">
                <label className="block text-sm font-medium text-gray-300 flex justify-between">
                  <span>Minimum Match Score</span>
                  <span className="text-purple-400 font-bold">{preferences.minMatchScore}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={preferences.minMatchScore}
                  onChange={(e) => setPreferences({ ...preferences, minMatchScore: parseInt(e.target.value) })}
                  className="w-full h-2 bg-black/40 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
           </div>
        </div>

        <div className="space-y-6 pt-2">
           <div className="flex items-center gap-2 text-white/90 font-semibold border-b border-white/10 pb-2">
             <Smartphone size={18} className="text-blue-400" /> Telegram Push
           </div>

           <div className="bg-blue-600/10 border border-blue-500/20 rounded-xl p-4 flex gap-3">
             <div className="p-2 bg-blue-500/20 rounded-full h-fit">
                <Send size={16} className="text-blue-400" />
             </div>
             <div>
                <p className="text-sm text-blue-100 font-medium mb-1">Faster than email!</p>
                <p className="text-xs text-blue-200/70">Get instant alerts directly to your phone via our Telegram bot.</p>
             </div>
           </div>

           <div>
             <GlassInput
               label="Telegram Chat ID"
               type="text"
               value={preferences.telegramChatId || ''}
               onChange={(value) => setPreferences({ ...preferences, telegramChatId: value })}
               placeholder="e.g. 123456789"
             />
             <p className="text-xs text-gray-400 mt-2 flex gap-1">
               Open <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@userinfobot</a>, type /start to get ID.
             </p>
           </div>

           <GlassButton
             variant="secondary"
             onClick={handleTestTelegram}
             disabled={testingTelegram || !preferences.telegramChatId}
             className="w-full sm:w-auto"
           >
             {testingTelegram ? 'Sending...' : 'Send Test Telegram'}
           </GlassButton>
        </div>

        {message && (
          <div className={`p-4 rounded-xl border backdrop-blur-md animate-in slide-in-from-top-2 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' 
              : 'bg-red-500/10 border-red-500/20 text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? <div className="w-2 h-2 rounded-full bg-emerald-400" /> : <div className="w-2 h-2 rounded-full bg-red-400" />}
              {message.text}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <GlassButton
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 shadow-lg shadow-purple-900/20"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </GlassButton>
        </div>
      </GlassCard>

      <GlassCard className="p-6 opacity-80 hover:opacity-100 transition-opacity">
        <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider text-center">How Matching Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
           <div className="p-3 bg-white/5 rounded-xl">
             <div className="text-xl font-bold text-blue-400 mb-1">1</div>
             <div className="text-xs text-gray-400">Scan</div>
           </div>
           <div className="p-3 bg-white/5 rounded-xl">
             <div className="text-xl font-bold text-purple-400 mb-1">2</div>
             <div className="text-xs text-gray-400">Score</div>
           </div>
           <div className="p-3 bg-white/5 rounded-xl">
             <div className="text-xl font-bold text-emerald-400 mb-1">3</div>
             <div className="text-xs text-gray-400">Filter</div>
           </div>
           <div className="p-3 bg-white/5 rounded-xl">
             <div className="text-xl font-bold text-amber-400 mb-1">4</div>
             <div className="text-xs text-gray-400">Alert</div>
           </div>
        </div>
      </GlassCard>
    </div>
  );
}
