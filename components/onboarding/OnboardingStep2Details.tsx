import React from 'react';
import { GlassCard, GlassButton, GlassSelect, GlassInput } from '../GlassUI';
import { OnboardingProgress } from './OnboardingProgress';
import { UserProfile, ExperienceLevel, WorkplaceType, WorkSchedule } from '../../types';
import { Briefcase, MapPin, DollarSign, Building, Clock, CheckCircle } from 'lucide-react';

interface OnboardingStep2DetailsProps {
  data: Partial<UserProfile>;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingStep2Details({
  data,
  onUpdate,
  onNext,
  onBack
}: OnboardingStep2DetailsProps) {
  const handleNext = () => {
    if (isValid()) {
      onNext();
    }
  };

  const isValid = () => {
    return data.experienceLevel && data.location;
  };

  const toggleWorkplace = (workplace: WorkplaceType) => {
    const current = data.preferredWorkplace || [];
    if (current.includes(workplace)) {
      onUpdate({ preferredWorkplace: current.filter(w => w !== workplace) });
    } else {
      onUpdate({ preferredWorkplace: [...current, workplace] });
    }
  };

  const toggleSchedule = (schedule: WorkSchedule) => {
    const current = data.preferredSchedule || [];
    if (current.includes(schedule)) {
      onUpdate({ preferredSchedule: current.filter(s => s !== schedule) });
    } else {
      onUpdate({ preferredSchedule: [...current, schedule] });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8 md:p-10 shadow-2xl shadow-purple-900/20">
        <OnboardingProgress currentStep={2} totalSteps={5} />
        
        <div className="space-y-8 mt-8">
          <div className="text-center">
             <h2 className="text-2xl font-bold text-white mb-2">Refine Your Preferences</h2>
             <p className="text-gray-400">Help us filter vacancies to match your seniority and expectations.</p>
          </div>

          <div className="space-y-6">
            {/* Experience Level */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <Briefcase size={18} className="text-blue-400" />
                 <label className="text-sm font-medium text-gray-300">Experience Level</label>
              </div>
              <GlassSelect
                value={data.experienceLevel || 'Any'}
                onChange={(value) => onUpdate({ experienceLevel: value as ExperienceLevel })}
                options={[
                  { value: 'Any', label: 'Any (All Levels)' },
                  { value: 'Intern', label: 'Intern (Starting Out)' },
                  { value: 'Junior', label: 'Junior (1-2 years)' },
                  { value: 'Middle', label: 'Middle (2-5 years)' },
                  { value: 'Senior', label: 'Senior (5+ years)' },
                  { value: 'Lead', label: 'Lead / Principal' }
                ]}
              />
            </div>

            {/* Min Salary */}
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <DollarSign size={18} className="text-emerald-400" />
                 <label className="text-sm font-medium text-gray-300">Min Salary (MDL, Optional)</label>
              </div>
              <GlassInput
                type="number"
                value={data.minSalary?.toString() || ''}
                onChange={(value) => onUpdate({ minSalary: value ? parseInt(value) : undefined })}
                placeholder="e.g. 25000"
              />
            </div>

            {/* Location */}
             <div>
               <div className="flex items-center gap-2 mb-2">
                 <MapPin size={18} className="text-amber-400" />
                 <label className="text-sm font-medium text-gray-300">Preferred Location</label>
              </div>
              <GlassSelect
                value={data.location || 'chisinau'}
                onChange={(value) => onUpdate({ location: value })}
                options={[
                  { value: 'chisinau', label: 'Chisinau' },
                  { value: 'balti', label: 'Balti' },
                  { value: 'remote', label: 'Remote Only' },
                  { value: 'any', label: 'Any / Relocation' }
                ]}
              />
            </div>

            {/* Workplace preference */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <Building size={18} className="text-pink-400" />
                 <label className="text-sm font-medium text-gray-300">Work Mode (Select multiple)</label>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                {([WorkplaceType.OFFICE, WorkplaceType.REMOTE, WorkplaceType.HYBRID]).map(workplace => {
                   const isSelected = (data.preferredWorkplace || []).includes(workplace);
                   return (
                    <button
                      key={workplace}
                      onClick={() => toggleWorkplace(workplace)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-300 flex flex-col items-center justify-center gap-1 relative ${
                        isSelected
                          ? 'border-purple-500 bg-purple-500/20 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-purple-400">
                          <CheckCircle size={16} />
                        </div>
                      )}
                      <span className="text-lg">
                        {workplace === WorkplaceType.OFFICE && '🏢'}
                        {workplace === WorkplaceType.REMOTE && '🏠'}
                        {workplace === WorkplaceType.HYBRID && '🔄'}
                      </span>
                      <span className="text-sm font-medium capitalize">{workplace}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Work Schedule */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                 <Clock size={18} className="text-cyan-400" />
                 <label className="text-sm font-medium text-gray-300">Work Schedule (Select multiple)</label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {Object.values(WorkSchedule).map(schedule => {
                   const isSelected = (data.preferredSchedule || []).includes(schedule);
                   return (
                    <button
                      key={schedule}
                      onClick={() => toggleSchedule(schedule)}
                      className={`px-4 py-3 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 relative ${
                        isSelected
                          ? 'border-cyan-500 bg-cyan-500/20 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 text-cyan-400">
                          <CheckCircle size={16} />
                        </div>
                      )}
                      <span className="text-sm font-medium">{schedule}</span>
                    </button>
                  );
                })}
              </div>
            </div>
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
              onClick={handleNext}
              disabled={!isValid()}
              className="flex-1 shadow-lg shadow-purple-500/20"
            >
              Continue
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
