import React, { useState } from 'react';
import { GlassCard, GlassButton, GlassInput } from '../GlassUI';
import { OnboardingProgress } from './OnboardingProgress';
import { UserProfile } from '../../types';
import { X, UserCircle, Briefcase, Code2 } from 'lucide-react';

interface OnboardingStep1ProfileProps {
  data: Partial<UserProfile>;
  onUpdate: (updates: Partial<UserProfile>) => void;
  onNext: () => void;
  onBack: () => void;
}

const COMMON_ROLES = [
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer',
  'Mobile Developer', 'DevOps Engineer', 'QA Engineer',
  'Product Manager', 'UI/UX Designer', 'Data Scientist'
];

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
  'Node.js', 'Python', 'Java', 'C#', 'PHP',
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud',
  'SQL', 'MongoDB', 'PostgreSQL', 'Redis'
];

export function OnboardingStep1Profile({
  data,
  onUpdate,
  onNext,
  onBack
}: OnboardingStep1ProfileProps) {
  const [skillInput, setSkillInput] = useState('');
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  
  const skills = data.skills || [];

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      onUpdate({ skills: [...skills, skill.trim()] });
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onUpdate({ skills: skills.filter(s => s !== skillToRemove) });
  };

  const isValid = () => {
    return (
      data.name && data.name.trim().length > 0 &&
      data.role && data.role.trim().length > 0 &&
      skills.length >= 3
    );
  };

  const filteredRoles = COMMON_ROLES.filter(role =>
    role.toLowerCase().includes((data.role || '').toLowerCase())
  );

  const filteredSkills = COMMON_SKILLS.filter(skill =>
    skill.toLowerCase().includes(skillInput.toLowerCase()) &&
    !skills.includes(skill)
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8 md:p-10 shadow-2xl shadow-blue-900/20">
        <OnboardingProgress currentStep={1} totalSteps={5} />
        
        <div className="space-y-8 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Yourself</h2>
            <p className="text-gray-400">We use this to match you with the right job opportunities.</p>
          </div>

          <div className="space-y-6">
            {/* Name */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                 <UserCircle size={18} className="text-blue-400" />
                 <label className="text-sm font-medium text-gray-300">Full Name</label>
              </div>
              <GlassInput
                value={data.name || ''}
                onChange={(value) => onUpdate({ name: value })}
                placeholder="e.g. Alex Johnson"
                className="w-full"
              />
            </div>

            {/* Role */}
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                 <Briefcase size={18} className="text-purple-400" />
                 <label className="text-sm font-medium text-gray-300">Target Role</label>
              </div>
              <GlassInput
                value={data.role || ''}
                onChange={(value) => {
                  onUpdate({ role: value });
                  setShowRoleSuggestions(true);
                }}
                onFocus={() => setShowRoleSuggestions(true)}
                onBlur={() => setTimeout(() => setShowRoleSuggestions(false), 200)}
                placeholder="e.g. Frontend Developer"
              />
              
              {/* Role suggestions */}
              {showRoleSuggestions && filteredRoles.length > 0 && data.role && (
                <div className="absolute z-10 w-full mt-2 bg-[#0f1535] border border-white/10 rounded-2xl shadow-xl max-h-48 overflow-y-auto backdrop-blur-xl">
                  {filteredRoles.map(role => (
                    <button
                      key={role}
                      className="w-full text-left px-5 py-3 hover:bg-white/5 text-gray-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
                      onMouseDown={() => {
                        onUpdate({ role });
                        setShowRoleSuggestions(false);
                      }}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div>
              <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                    <Code2 size={18} className="text-emerald-400" />
                    <label className="text-sm font-medium text-gray-300">Key Skills (Min 3)</label>
                 </div>
                 <span className={`text-xs ${skills.length >= 3 ? 'text-emerald-400' : 'text-amber-400'}`}>
                   {skills.length}/3 required
                 </span>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSkillSuggestions(true);
                  }}
                  onFocus={() => setShowSkillSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSkillSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill(skillInput);
                    }
                  }}
                  placeholder="Type a skill and press Enter..."
                  className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-emerald-400/40 focus:ring-4 focus:ring-emerald-400/10 transition-all duration-300"
                />
                
                {/* Skill suggestions */}
                {showSkillSuggestions && skillInput && filteredSkills.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-[#0f1535] border border-white/10 rounded-2xl shadow-xl max-h-48 overflow-y-auto backdrop-blur-xl">
                    {filteredSkills.map(skill => (
                      <button
                        key={skill}
                        className="w-full text-left px-5 py-3 hover:bg-white/5 text-gray-300 hover:text-white transition-colors border-b border-white/5 last:border-0"
                        onMouseDown={() => handleAddSkill(skill)}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                )}
              </div>

               {/* Skill chips */}
              <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
                {skills.map(skill => (
                  <div
                    key={skill}
                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm flex items-center gap-2 animate-in zoom-in-50 duration-200"
                  >
                    {skill}
                    <button
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-white hover:bg-emerald-500/20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
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
              onClick={onNext}
              disabled={!isValid()}
              className="flex-1 shadow-lg shadow-blue-500/20"
            >
              Continue
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
