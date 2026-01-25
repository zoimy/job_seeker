import React from 'react';
import { VacancyMatch } from '../types';
import { GlassCard, GlassBadge, GlassButton } from './GlassUI';
import { MatchCircle } from './MatchVisuals';
import { MapPin, Building2, Wallet, CalendarDays, ExternalLink, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  match: VacancyMatch;
}

const VacancyCard: React.FC<Props> = ({ match }) => {
  const { vacancy, matchScore, breakdown } = match;

  return (
    <GlassCard className="h-full flex flex-col p-6 group relative overflow-hidden">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      
      <div className="flex justify-between items-start mb-5 relative z-10">
        <div className="flex-1 pr-4">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors line-clamp-2 leading-tight">
            {vacancy.title}
          </h3>
          <div className="flex items-center text-blue-200/70 text-sm gap-2">
            <Building2 size={15} className="text-blue-400" />
            <span className="font-medium">{vacancy.company}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <MatchCircle score={matchScore} />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-5 relative z-10">
        <GlassBadge color="blue">{vacancy.workplace}</GlassBadge>
        <GlassBadge color="purple">{vacancy.experienceLevel}</GlassBadge>
        {vacancy.currency && (
           <GlassBadge color="yellow">{vacancy.currency}</GlassBadge>
        )}
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 text-sm text-gray-300 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <MapPin size={14} />
          </div>
          <span className="truncate">{vacancy.location}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet size={14} />
          </div>
          <span className="truncate font-medium text-emerald-100">
            {vacancy.salaryMin ? `${vacancy.salaryMin}` : 'Neg.'} 
            {vacancy.salaryMax ? ` - ${vacancy.salaryMax}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2.5 col-span-2">
          <div className="p-1.5 rounded-lg bg-slate-500/10 text-slate-400">
            <CalendarDays size={14} />
          </div>
          <span>Posted {new Date(vacancy.postedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Skills Match Mini Visualization */}
      <div className="mb-6 space-y-2.5 relative z-10">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Skill Match</div>
          <div className="text-xs text-gray-500">{breakdown.skillsMatch.length} of {breakdown.skillsMatch.length + breakdown.missingSkills.length}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {breakdown.skillsMatch.slice(0, 3).map(skill => (
            <span key={skill} className="flex items-center gap-1.5 text-xs text-emerald-200 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 shadow-sm shadow-emerald-900/10">
              <CheckCircle2 size={10} className="text-emerald-400" /> {skill}
            </span>
          ))}
          {breakdown.missingSkills.slice(0, 1).map(skill => (
            <span key={skill} className="flex items-center gap-1.5 text-xs text-red-200 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20 opacity-75">
              <XCircle size={10} className="text-red-400" /> {skill}
            </span>
          ))}
          {(breakdown.skillsMatch.length + breakdown.missingSkills.length) > 4 && (
            <span className="text-xs text-gray-500 py-1 px-1">+{(breakdown.skillsMatch.length + breakdown.missingSkills.length) - 4}</span>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-5 border-t border-white/10 flex gap-3 relative z-10">
         <GlassButton 
           className="flex-1 text-sm shadow-lg shadow-blue-900/20" 
           variant="primary"
           disabled={!vacancy.url}
           onClick={() => vacancy.url && window.open(vacancy.url, '_blank')}
         >
            Apply Now
         </GlassButton>
         <GlassButton 
           className="px-3" 
           variant="secondary"
           disabled={!vacancy.url}
           onClick={() => vacancy.url && window.open(vacancy.url, '_blank')}
         >
            <ExternalLink size={18} />
         </GlassButton>
      </div>
    </GlassCard>
  );
};

export default VacancyCard;