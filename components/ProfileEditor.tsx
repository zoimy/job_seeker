import React, { useState } from 'react';
import { UserProfile, ExperienceLevel, WorkplaceType } from '../types';
import { GlassCard, GlassInput, GlassButton, GlassBadge } from './GlassUI';
import { Save, Plus, X } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

const ProfileEditor: React.FC<Props> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newSkill, setNewSkill] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Cast minSalary to number
    const finalValue = name === 'minSalary' ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, newSkill.trim()] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <GlassCard className="p-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        Edit Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Full Name</label>
            <GlassInput name="name" value={formData.name} onChange={handleChange} />
          </div>
          <div className="space-y-2">
             <label className="text-sm text-gray-300">Target Role</label>
             <GlassInput name="role" value={formData.role} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="space-y-2">
            <label className="text-sm text-gray-300">Location</label>
            <GlassInput name="location" value={formData.location} onChange={handleChange} />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Min Salary (MDL)</label>
            <div className="relative">
              <select 
                name="minSalary"
                value={formData.minSalary}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/50 backdrop-blur-sm appearance-none cursor-pointer"
              >
                <option value={0} className="bg-slate-800">Any</option>
                <option value={5000} className="bg-slate-800">From 5 000 MDL</option>
                <option value={10000} className="bg-slate-800">From 10 000 MDL</option>
                <option value={15000} className="bg-slate-800">From 15 000 MDL</option>
                <option value={20000} className="bg-slate-800">From 20 000 MDL</option>
                <option value={25000} className="bg-slate-800">From 25 000 MDL</option>
                <option value={30000} className="bg-slate-800">From 30 000 MDL</option>
                <option value={40000} className="bg-slate-800">From 40 000 MDL</option>
                <option value={50000} className="bg-slate-800">From 50 000 MDL</option>
                <option value={70000} className="bg-slate-800">From 70 000 MDL</option>
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>

           <div className="space-y-2">
            <label className="text-sm text-gray-300">Experience Level</label>
            <div className="relative">
              <select 
                name="experienceLevel" 
                value={formData.experienceLevel} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white focus:outline-none focus:border-blue-400/50 backdrop-blur-sm appearance-none cursor-pointer"
              >
                {Object.values(ExperienceLevel).map(level => (
                  <option key={level} value={level} className="bg-slate-800">{level}</option>
                ))}
              </select>
               <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Skills</label>
          <div className="flex gap-2 mb-2">
            <GlassInput 
              value={newSkill} 
              onChange={(e) => setNewSkill(e.target.value)} 
              placeholder="Add a skill (e.g. React)"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
            />
            <GlassButton type="button" onClick={handleAddSkill} variant="secondary">
              <Plus size={20} />
            </GlassButton>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-black/10 border border-white/5">
            {formData.skills.map(skill => (
              <span key={skill} className="flex items-center gap-1 bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-500/30">
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-white">
                  <X size={14} />
                </button>
              </span>
            ))}
            {formData.skills.length === 0 && <span className="text-gray-500 text-sm italic">No skills added yet</span>}
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-sm text-gray-300">Short Bio</label>
           <textarea 
             name="bio"
             value={formData.bio}
             onChange={handleChange}
             rows={3}
             className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 backdrop-blur-sm focus:outline-none focus:border-blue-400/50 transition-all duration-300"
           />
        </div>

        <div className="pt-4 flex justify-end">
          <GlassButton type="submit" variant="primary">
            <Save size={18} /> Save Profile
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
};

export default ProfileEditor;