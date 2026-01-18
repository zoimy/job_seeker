import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import VacancyCard from './components/VacancyCard';
import ProfileEditor from './components/ProfileEditor';
import IntegrationsPage from './components/IntegrationsPage';
import { GlassButton, GlassCard } from './components/GlassUI';
import { VacancyMatch, UserProfile, ExperienceLevel, WorkplaceType } from './types';
import { generateSimulatedMatches } from './services/geminiService';
import { RefreshCw, Sparkles, Filter } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'integrations'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<VacancyMatch[]>([]);
  
  // Initial User State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Alex Dev",
    role: "Frontend Developer",
    skills: ["React", "TypeScript", "Tailwind CSS", "Node.js"],
    experienceLevel: ExperienceLevel.SENIOR,
    location: "Chisinau",
    minSalary: 20000,
    preferredWorkplace: [WorkplaceType.REMOTE, WorkplaceType.HYBRID],
    bio: "Passionate developer looking for challenging UI/UX projects."
  });

  // Load initial matches on mount
  useEffect(() => {
    handleGenerateMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const handleGenerateMatches = async () => {
    setLoading(true);
    // Add artificial delay for "AI Thinking" visualization if mock, or wait for API
    const data = await generateSimulatedMatches(userProfile);
    setMatches(data);
    setLoading(false);
  };

  const handleProfileSave = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    setCurrentView('dashboard');
    // Regenerate matches based on new profile
    handleGenerateMatches();
  };

  return (
    <div className="min-h-screen text-gray-100 pb-20">
      <Navigation currentView={currentView} setView={setCurrentView} />

      <main className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Hello, {userProfile.name.split(' ')[0]} 👋
                </h1>
                <p className="text-gray-300">
                  We found <span className="text-blue-300 font-bold">{matches.length}</span> new vacancies matching your profile.
                </p>
              </div>
              <div className="flex gap-3">
                 <GlassButton onClick={() => console.log('Filter')} variant="secondary">
                   <Filter size={18} /> Filters
                 </GlassButton>
                 <GlassButton onClick={handleGenerateMatches} disabled={loading}>
                   {loading ? (
                     <RefreshCw size={18} className="animate-spin" />
                   ) : (
                     <Sparkles size={18} />
                   )}
                   {loading ? 'Scanning...' : 'AI Scan'}
                 </GlassButton>
              </div>
            </div>

            {/* Matches Grid */}
            {loading ? (
               // Loading Skeleton
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[1,2,3].map(i => (
                   <GlassCard key={i} className="h-64 animate-pulse flex flex-col justify-between p-6">
                      <div className="space-y-3">
                        <div className="h-6 bg-white/10 rounded w-3/4"></div>
                        <div className="h-4 bg-white/5 rounded w-1/2"></div>
                      </div>
                      <div className="h-20 bg-white/5 rounded"></div>
                   </GlassCard>
                 ))}
               </div>
            ) : matches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                  <VacancyCard key={match.vacancy.id} match={match} />
                ))}
              </div>
            ) : (
              <GlassCard className="p-12 text-center">
                 <p className="text-gray-400">No matches found. Try updating your profile or skills.</p>
              </GlassCard>
            )}
          </div>
        )}

        {/* PROFILE VIEW */}
        {currentView === 'profile' && (
          <ProfileEditor profile={userProfile} onSave={handleProfileSave} />
        )}

        {/* INTEGRATIONS VIEW */}
        {currentView === 'integrations' && (
          <IntegrationsPage />
        )}

      </main>
    </div>
  );
};

export default App;