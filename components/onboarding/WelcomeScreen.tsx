import React from 'react';
import { GlassCard, GlassButton } from '../GlassUI';
import { Sparkles, Target, Bell, ArrowRight } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-4xl w-full p-8 md:p-14 relative overflow-hidden border-2 border-white/20">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px]" />

        <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
           <div className="space-y-8 text-center md:text-left">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-300 text-sm mb-6">
                   <Sparkles size={14} /> <span>AI-Powered Job Matching</span>
                 </div>
                 <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    Find Your Dream Job <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                      Without The Hassle
                    </span>
                 </h1>
                 <p className="text-lg text-blue-100/70 leading-relaxed">
                    Set up your profile once. Let our AI find the best vacancies and notify you instantly via Telegram or Email.
                 </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <GlassButton 
                  variant="primary"
                  onClick={onStart}
                  className="px-8 py-4 text-lg shadow-xl shadow-blue-500/20"
                >
                  Start Setup <ArrowRight size={20} className="ml-2" />
                </GlassButton>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                   <span>⏱ 2 min setup</span>
                </div>
              </div>
           </div>

           <div className="space-y-4">
              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Target size={24} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Smart Matching</h3>
                  <p className="text-sm text-gray-400">We analyze your skills and preferences to find only relevant positions.</p>
                </div>
              </div>

              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Bell size={24} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Instant Alerts</h3>
                  <p className="text-sm text-gray-400">Get notified the moment a matching job is posted on rabota.md.</p>
                </div>
              </div>

              <div className="p-5 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                <div className="p-3 bg-emerald-500/20 rounded-xl">
                  <Sparkles size={24} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1">Zero Noise</h3>
                  <p className="text-sm text-gray-400">Filter out irrelevant jobs. Only see what matters to you.</p>
                </div>
              </div>
           </div>
        </div>
      </GlassCard>
    </div>
  );
}
