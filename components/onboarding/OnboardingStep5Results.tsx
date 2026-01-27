import React from 'react';
import { GlassCard, GlassButton } from '../GlassUI';
import { OnboardingProgress } from './OnboardingProgress';
import { UserProfile } from '../../types';
import { CheckCircle, Sparkles, TrendingUp } from 'lucide-react';

interface OnboardingStep5ResultsProps {
  data: Partial<UserProfile>;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep5Results({
  data,
  onNext,
  onBack
}: OnboardingStep5ResultsProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8 shadow-2xl shadow-blue-900/20">
        <OnboardingProgress currentStep={5} totalSteps={6} />
        
        <div className="space-y-8 text-center animate-in fade-in zoom-in duration-700">
          {/* Success Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative p-6 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 rounded-full border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                <CheckCircle size={64} className="text-emerald-400" strokeWidth={2} />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-3 animate-in fade-in duration-500">
              🎉 Profile Created Successfully!
            </h2>
            <p className="text-blue-200/80 text-lg max-w-lg mx-auto leading-relaxed">
              Your intelligent job tracker is now active. Head to the dashboard to start searching for matching vacancies.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-blue-500/30 transition-all hover:bg-white/[0.07]">
              <Sparkles className="text-blue-400 mx-auto mb-2" size={24} />
              <h3 className="text-white font-semibold mb-1">AI-Powered Matching</h3>
              <p className="text-gray-400 text-sm">Smart algorithm scores every vacancy based on your profile</p>
            </div>
            <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-purple-500/30 transition-all hover:bg-white/[0.07]">
              <TrendingUp className="text-purple-400 mx-auto mb-2" size={24} />
              <h3 className="text-white font-semibold mb-1">Real-Time Updates</h3>
              <p className="text-gray-400 text-sm">Get notified instantly when new matches appear</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl border border-blue-500/20">
            <h3 className="text-white font-semibold mb-3">Your Profile Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">{data.skills?.length || 0}</div>
                <div className="text-xs text-gray-400">Skills</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-400">{data.experienceLevel || 'Any'}</div>
                <div className="text-xs text-gray-400">Level</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-400">{data.location || 'Any'}</div>
                <div className="text-xs text-gray-400">Location</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            <GlassButton
              variant="secondary"
              onClick={onBack}
              className="flex-1"
            >
              Back
            </GlassButton>
            <GlassButton
              variant="primary"
              onClick={onNext}
              className="flex-1 shadow-lg shadow-emerald-500/20"
            >
              View Dashboard →
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
