import React, { useEffect, useState } from 'react';
import { GlassCard, GlassButton } from '../GlassUI';
import { OnboardingProgress } from './OnboardingProgress';
import { VacancyMatch, UserProfile } from '../../types';
import { realVacancyService } from '../../services/realVacancyService';
import { Loader2, CheckCircle, Search, Building2, MapPin } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [matches, setMatches] = useState<VacancyMatch[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startScan();
  }, []);

  const startScan = async () => {
    // Simulate scanning progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { 
          return prev;
        }
        return prev + 5;
      });
    }, 200);

    try {
      // Use onboarding data directly (profile not saved to DB yet)
      if (!data.name || !data.role || !data.skills || data.skills.length < 3) {
        throw new Error('Incomplete profile data. Please go back and complete all required fields.');
      }

      // Build a temporary UserProfile for the scan
      const tempProfile: UserProfile = {
        name: data.name,
        role: data.role,
        skills: data.skills,
        experienceLevel: data.experienceLevel || 'Any' as any,
        yearsOfExperience: data.yearsOfExperience || 0,
        location: data.location || 'any',
        minSalary: data.minSalary || 0,
        perferredCurrency: 'MDL',
        preferredWorkplace: data.preferredWorkplace || [],
        preferredSchedule: data.preferredSchedule || [],
        education: data.education || 'Any' as any,
        bio: data.bio || '',
        searchPeriodDays: 7
      };

      // Simulating a delay for "AI Processing" visual effect
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Fetch real vacancies from backend
      const results = await realVacancyService.fetchRealVacancies(tempProfile);
      
      // Filter by minimum match score (60%) to show only relevant results
      const MIN_MATCH_SCORE = 60;
      const filteredMatches = results.filter(match => match.matchScore >= MIN_MATCH_SCORE);
      
      // Sort by match score (highest first)
      const sortedMatches = filteredMatches.sort((a, b) => b.matchScore - a.matchScore);
      
      // Take top 2 for onboarding display
      setMatches(sortedMatches.slice(0, 2));
      setProgress(100);
      setLoading(false);
      clearInterval(interval);

    } catch (error: any) {
      console.error('Scan error:', error);
      setError(error.message || 'Failed to fetch vacancies');
      setLoading(false);
      clearInterval(interval);
      
      setMatches([]);
      setProgress(100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8 shadow-2xl shadow-blue-900/20">
        <OnboardingProgress currentStep={5} totalSteps={6} />
        
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2 animate-in fade-in duration-300">
              {loading ? 'AI Scanning in Progress...' : matches.length > 0 ? 'Initial Matches Found!' : 'Scan Complete'}
            </h2>
            <p className="text-gray-400">
              {loading 
                ? 'We are analyzing rabota.md for vacancies that match your profile skills and preferences.' 
                : matches.length > 0
                  ? `We found ${matches.length} high-quality matches right away.`
                  : 'We configured your search. New vacancies will appear here as soon as they are posted.'
              }
            </p>
          </div>

          {/* Progress Bar or Results */}
          {loading ? (
            <div className="py-12 space-y-6 relative">
              <div className="flex justify-between text-xs font-mono text-blue-300 tracking-wider uppercase mb-1">
                <span>Analyzing Skills...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex justify-center mt-8">
                <div className="relative">
                   <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
                   <Loader2 className="animate-spin text-blue-400 relative z-10" size={48} />
                </div>
              </div>
              
              <div className="text-center text-xs text-gray-500 animate-pulse">
                Fetching latest data...
              </div>
            </div>
          ) : matches.length > 0 ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {matches.map(match => (
                <div 
                  key={match.vacancy.id}
                  className="group bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-5 hover:border-blue-500/30 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Search size={64} />
                  </div>

                  <div className="flex justify-between items-start gap-4 relative z-10">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-white mb-1 truncate">{match.vacancy.title}</h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
                         <span className="flex items-center gap-1"><Building2 size={14} className="text-purple-400"/> {match.vacancy.company}</span>
                         <span className="flex items-center gap-1"><MapPin size={14} className="text-blue-400"/> {match.vacancy.location}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {match.vacancy.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="text-xs bg-blue-500/10 text-blue-200 px-2 py-1 rounded-lg border border-blue-500/20">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className={`
                        flex flex-col items-center justify-center w-16 h-16 rounded-xl border-2 backdrop-blur-md
                        ${match.matchScore >= 80 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : ''}
                        ${match.matchScore >= 60 && match.matchScore < 80 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}
                      `}>
                        <span className="text-xl font-bold leading-none">{match.matchScore}</span>
                        <span className="text-[10px] uppercase font-bold opacity-70">% Match</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="text-center pt-2">
                <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  More vacancies waiting in Dashboard
                </p>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                 <Search size={40} className="text-gray-500" />
              </div>
              <p className="text-gray-400 max-w-sm mx-auto">
                No immediate matches found, but your personalized tracker is now active. We'll notify you the moment a matching job appears.
              </p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-4 pt-6 border-t border-white/10">
            {!loading && (
              <>
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
              </>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
