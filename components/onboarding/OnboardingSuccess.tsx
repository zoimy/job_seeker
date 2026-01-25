import React from 'react';
import { GlassCard, GlassButton } from '../GlassUI';
import { CheckCircle, Sparkles, Bell, RefreshCw, Zap } from 'lucide-react';

interface OnboardingSuccessProps {
  onComplete: () => void;
  vacancyCount?: number;
}

export function OnboardingSuccess({ onComplete, vacancyCount = 0 }: OnboardingSuccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8 md:p-12 shadow-2xl shadow-emerald-900/20 border-emerald-500/20">
        <div className="text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse"></div>
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl relative z-10 border-4 border-black/20">
                <CheckCircle size={48} className="text-white drop-shadow-md" />
              </div>
              <div className="absolute -top-1 -right-1 z-20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center animate-bounce shadow-lg">
                  <Sparkles size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-4xl font-bold text-white mb-3">
              🎉 All Set!
            </h1>
            <p className="text-xl text-emerald-100/80">
              Your personal AI Job Agent is now active.
            </p>
          </div>


          {/* Completion checklist */}
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-6 space-y-3 text-left shadow-inner">
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircle size={20} className="text-emerald-500" />
              <span>Profile Optimized</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircle size={20} className="text-emerald-500" />
              <span>Notifications Activated (Instant Mode)</span>
            </div>
            <div className="flex items-center gap-3 text-emerald-200">
              <CheckCircle size={20} className="text-emerald-500" />
              <span>Manual Search Enabled</span>
            </div>
          </div>

          {/* What happens next */}
          <div className="text-left bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-md font-bold text-white flex items-center gap-2 uppercase tracking-wide">
              <Zap size={18} className="text-blue-400" />
              What To Expect
            </h3>
            
            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                  <RefreshCw size={16} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-white font-medium mb-0.5">Continuous Scanning</p>
                  <p className="text-gray-400">We check rabota.md every 2 minutes for new posts.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0 border border-pink-500/30">
                  <Sparkles size={16} className="text-pink-400" />
                </div>
                <div>
                   <p className="text-white font-medium mb-0.5">AI Filtering</p>
                   <p className="text-gray-400">We only alert you when the match score is ≥ 60%.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 border border-blue-500/30">
                  <Bell size={16} className="text-blue-400" />
                </div>
                <div>
                   <p className="text-white font-medium mb-0.5">Instant Alerts</p>
                   <p className="text-gray-400">Be the first to apply via Email or Telegram.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="pt-4">
            <GlassButton 
              variant="primary"
              onClick={onComplete}
              className="w-full md:w-auto px-10 py-4 text-lg shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-1"
            >
              🚀 Go to Dashboard
            </GlassButton>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-500">
            You can always update your preferences in the Profile tab.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
