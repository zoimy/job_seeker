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
    <GlassCard className="h-full flex flex-col p-6 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">
            {vacancy.title}
          </h3>
          <div className="flex items-center text-gray-300 text-sm gap-2">
            <Building2 size={14} />
            <span>{vacancy.company}</span>
          </div>
        </div>
        <MatchCircle score={matchScore} />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <GlassBadge color="blue">{vacancy.workplace}</GlassBadge>
        <GlassBadge color="green">{vacancy.experienceLevel}</GlassBadge>
        {vacancy.currency && (
           <GlassBadge color="yellow">{vacancy.currency}</GlassBadge>
        )}
      </div>

      {/* Key Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6 text-sm text-gray-300">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-400" />
          <span>{vacancy.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Wallet size={16} className="text-emerald-400" />
          <span>
            {vacancy.salaryMin ? `${vacancy.salaryMin}` : 'Neg.'} 
            {vacancy.salaryMax ? ` - ${vacancy.salaryMax}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-amber-400" />
          <span>{new Date(vacancy.postedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Description Snippet */}
      <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-grow">
        {vacancy.description}
      </p>

      {/* Skills Match Mini Visualization */}
      <div className="mb-6 space-y-2">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Skills</div>
        <div className="flex flex-wrap gap-2">
          {breakdown.skillsMatch.slice(0, 3).map(skill => (
            <span key={skill} className="flex items-center gap-1 text-xs text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <CheckCircle2 size={10} /> {skill}
            </span>
          ))}
          {breakdown.missingSkills.slice(0, 2).map(skill => (
            <span key={skill} className="flex items-center gap-1 text-xs text-red-300 bg-red-500/10 px-2 py-1 rounded-md border border-red-500/20">
              <XCircle size={10} /> {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto pt-4 border-t border-white/10 flex gap-3">
         <GlassButton className="flex-1 text-sm" variant="primary">
            Apply Now
         </GlassButton>
         <GlassButton className="px-3" variant="secondary">
            <ExternalLink size={18} />
         </GlassButton>
      </div>
    </GlassCard>
  );
};

export default VacancyCard;