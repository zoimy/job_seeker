import React, { useState } from 'react';
import { UserProfile, ExperienceLevel, WorkplaceType, WorkSchedule, EducationLevel } from '../types';
import { GlassCard, GlassInput, GlassButton, GlassSelect } from './GlassUI';
import { Save, Plus, X, Briefcase, Clock, User } from 'lucide-react';

interface Props {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onDelete: () => void;
}

const ProfileEditor: React.FC<Props> = ({ profile, onSave, onDelete }) => {
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [newSkill, setNewSkill] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement; 
    const { name, value } = target;
    
    const finalValue = (name === 'minSalary' || name === 'searchPeriodDays' || name === 'yearsOfExperience') ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    const finalValue = (name === 'minSalary' || name === 'searchPeriodDays' || name === 'yearsOfExperience') ? Number(value) : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleCheckboxChange = (field: 'preferredWorkplace' | 'preferredSchedule', value: string) => {
    setFormData(prev => {
      const current = prev[field] as string[];
      if (current.includes(value)) {
        return { ...prev, [field]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [field]: [...current, value] };
      }
    });
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

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone and will remove all your data.')) {
        onDelete();
    }
  };

  return (
    <GlassCard className="p-8 max-w-5xl mx-auto shadow-2xl shadow-blue-900/20">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-white/10">
        <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
          <User size={32} className="text-blue-100" />
        </div>
        <div>
           <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
           <p className="text-gray-400 text-sm mt-1">Update your professional details to get better job matches.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* Core Info */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <GlassInput 
              label="Full Name" 
              name="name" 
              value={formData.name} 
              onChange={(val) => handleChange({ target: { name: 'name', value: val } } as any)} 
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-1">
             <GlassInput 
               label="Target Role" 
               name="role" 
               value={formData.role} 
               onChange={(val) => handleChange({ target: { name: 'role', value: val } } as any)}
               placeholder="e.g. Senior Frontend Engineer" 
             />
          </div>
        </section>

        {/* Experience & Education */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90 border-l-4 border-blue-500 pl-3">Professional Background</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassSelect 
              label="Education Level"
              value={formData.education}
              onChange={(val) => handleSelectChange('education', val)}
              options={Object.values(EducationLevel).map(level => ({ value: level, label: level }))}
            />

            <GlassSelect 
              label="Experience Level"
              value={formData.experienceLevel}
              onChange={(val) => handleSelectChange('experienceLevel', val)}
              options={Object.values(ExperienceLevel).map(level => ({ value: level, label: level }))}
            />

            <GlassInput 
              label="Years of Experience"
              type="number" 
              name="yearsOfExperience" 
              value={String(formData.yearsOfExperience || 0)} 
              onChange={(val) => handleChange({ target: { name: 'yearsOfExperience', value: val } } as any)}
              placeholder="e.g. 5"
            />
          </div>
        </section>

        {/* Location & Salary */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90 border-l-4 border-emerald-500 pl-3">Location & Compensation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <GlassSelect 
               label="Preferred Location"
               value={formData.location || 'chisinau'} 
               onChange={(val) => handleSelectChange('location', val)}
               options={[
                 { value: 'chisinau', label: 'Chisinau' },
                 { value: 'balti', label: 'Balti' },
                 { value: 'remote', label: 'Remote Only' },
                 { value: 'any', label: 'Any / Relocation' }
               ]}
             />
            
              <GlassSelect 
                label="Min Salary Expectation (MDL)"
                value={String(formData.minSalary)}
                onChange={(val) => handleSelectChange('minSalary', val)}
                options={[
                  { value: '0', label: 'Any' },
                  { value: '5000', label: 'From 5,000 MDL' },
                  { value: '10000', label: 'From 10,000 MDL' },
                  { value: '15000', label: 'From 15,000 MDL' },
                  { value: '20000', label: 'From 20,000 MDL' },
                  { value: '30000', label: 'From 30,000 MDL' },
                  { value: '40000', label: 'From 40,000 MDL' },
                  { value: '50000', label: 'From 50,000 MDL' },
                  { value: '70000', label: 'From 70,000 MDL' },
                ]}
              />
          </div>
        </section>

        {/* Work Preferences (Checkboxes) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
          {/* Work Schedule */}
          <div className="space-y-5">
             <label className="text-sm font-semibold text-blue-200 flex items-center gap-2 uppercase tracking-wider">
               <Clock size={14} className="text-blue-400"/> Work Schedule
             </label>
             <div className="space-y-3">
               {Object.values(WorkSchedule).map(schedule => (
                 <label key={schedule} className="flex items-center gap-3 cursor-pointer group">
                   <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 shadow-sm ${
                     formData.preferredSchedule?.includes(schedule) 
                       ? 'bg-blue-600 border-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.3)]' 
                       : 'bg-black/20 border-white/10 group-hover:border-white/30 group-hover:bg-white/5'
                   }`}>
                     {formData.preferredSchedule?.includes(schedule) && <X size={14} className="text-white rotate-45" strokeWidth={3} />}
                   </div>
                   <input 
                     type="checkbox" 
                     className="hidden" 
                     checked={formData.preferredSchedule?.includes(schedule)}
                     onChange={() => handleCheckboxChange('preferredSchedule', schedule)}
                   />
                   <span className={`text-sm transition-colors ${formData.preferredSchedule?.includes(schedule) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{schedule}</span>
                 </label>
               ))}
             </div>
          </div>

          {/* Workplace Type */}
          <div className="space-y-5">
             <label className="text-sm font-semibold text-purple-200 flex items-center gap-2 uppercase tracking-wider">
               <Briefcase size={14} className="text-purple-400"/> Workplace Type
             </label>
             <div className="space-y-3">
               {Object.values(WorkplaceType).map(type => (
                 <label key={type} className="flex items-center gap-3 cursor-pointer group">
                   <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-300 shadow-sm ${
                     formData.preferredWorkplace?.includes(type) 
                       ? 'bg-purple-600 border-purple-500 shadow-[0_0_10px_rgba(147,51,234,0.3)]' 
                       : 'bg-black/20 border-white/10 group-hover:border-white/30 group-hover:bg-white/5'
                   }`}>
                     {formData.preferredWorkplace?.includes(type) && <X size={14} className="text-white rotate-45" strokeWidth={3} />}
                   </div>
                   <input 
                     type="checkbox" 
                     className="hidden" 
                     checked={formData.preferredWorkplace?.includes(type)}
                     onChange={() => handleCheckboxChange('preferredWorkplace', type)}
                   />
                   <span className={`text-sm transition-colors ${formData.preferredWorkplace?.includes(type) ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>{type}</span>
                 </label>
               ))}
             </div>
          </div>
        </section>

        {/* Search Period */}
        <section className="space-y-4">
           <GlassSelect 
              label="Search Period (Include jobs posted within)"
              value={String(formData.searchPeriodDays || 1)}
              onChange={(val) => handleSelectChange('searchPeriodDays', val)}
              options={[
                { value: '1', label: 'Last 24 hours' },
                { value: '3', label: 'Last 3 days' },
                { value: '7', label: 'Last 7 days' },
                { value: '14', label: 'Last 14 days' },
                { value: '30', label: 'Last 30 days' },
              ]}
            />
        </section>

        {/* Skills */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-300 ml-1">Key Skills</label>
          <div className="flex gap-3 mb-4">
            <GlassInput 
              value={newSkill} 
              onChange={(val) => setNewSkill(val)} 
              placeholder="Add a skill (e.g. React, Node.js)"
              className="flex-grow"
              onKeyDown={(e) => {
                 if(e.key === 'Enter') { 
                   e.preventDefault(); 
                   handleAddSkill(); 
                 }
              }}
            />
            <GlassButton type="button" onClick={handleAddSkill} variant="secondary" className="px-4">
              <Plus size={20} />
            </GlassButton>
          </div>
          <div className="flex flex-wrap gap-2 min-h-[60px] p-4 rounded-2xl bg-black/20 border border-white/10 shadow-inner">
            {formData.skills.map(skill => (
              <span key={skill} className="flex items-center gap-1.5 bg-blue-500/10 text-blue-200 px-3 py-1.5 rounded-xl text-sm border border-blue-500/20 group hover:border-blue-500/40 transition-colors">
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-blue-400 hover:text-white transition-colors p-0.5 rounded-full hover:bg-blue-500/20">
                  <X size={14} />
                </button>
              </span>
            ))}
            {formData.skills.length === 0 && <span className="text-gray-500 text-sm italic w-full text-center py-2">No skills added yet. Add skills to get relevant job matches.</span>}
          </div>
        </div>

        {/* Bio */}
        <div className="space-y-2">
           <label className="block text-sm font-medium text-gray-300 ml-1">Short Bio</label>
           <textarea 
             name="bio"
             value={formData.bio}
             onChange={handleChange}
             rows={4}
             className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white placeholder-gray-500 backdrop-blur-sm focus:outline-none focus:border-blue-400/40 focus:ring-4 focus:ring-blue-400/10 transition-all duration-300"
             placeholder="Briefly describe your professional background and what you are looking for..."
           />
        </div>

        <div className="pt-6 flex justify-between items-center border-t border-white/10 mt-8 sticky bottom-0 bg-[#0a0e27]/80 backdrop-blur-xl p-4 -mx-4 rounded-b-3xl">
          <button 
            type="button" 
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 transition-colors px-4 py-2 rounded-lg hover:bg-red-500/10 text-sm font-medium"
          >
            Delete Account
          </button>

          <GlassButton type="submit" variant="primary" className="px-8 shadow-lg shadow-blue-600/20">
            <Save size={18} /> Save Profile
          </GlassButton>
        </div>
      </form>
    </GlassCard>
  );
};

export default ProfileEditor;