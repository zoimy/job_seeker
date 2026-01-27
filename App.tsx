import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import VacancyCard from './components/VacancyCard';
import ProfileEditor from './components/ProfileEditor';
import IntegrationsPage from './components/IntegrationsPage';
import { NotificationSettings } from './components/NotificationSettings';
import { OnboardingContainer } from './components/onboarding/OnboardingContainer';
import { GlassButton, GlassCard } from './components/GlassUI';
import { VacancyMatch, UserProfile } from './types';
import { generateSimulatedMatches } from './services/geminiService';
import { RefreshCw, Sparkles, Filter } from 'lucide-react';
import { isNewUser } from './hooks/useOnboarding';
import { storageService } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'profile' | 'integrations' | 'notifications'>('dashboard');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<VacancyMatch[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [checkingUser, setCheckingUser] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // Initial User State
  const [userProfile, setUserProfile] = useState<UserProfile>(() => storageService.getDefaultProfile());
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  // Check if user is new on mount
  useEffect(() => {
    const checkUserStatus = async () => {
      const isNew = await isNewUser();
      setShowOnboarding(isNew);
      setCheckingUser(false);
    };
    
    checkUserStatus();
  }, []);

  // Load initial profile and matches on mount
  useEffect(() => {
    if (checkingUser) return;
    if (showOnboarding) return;

    const initApp = async () => {
      setLoading(true);
      console.log('🔄 Initializing app and loading profile...');
      
      try {
        // 1. Load Profile with retry logic
        const storedProfile = await storageService.getUserProfile();
        
        if (storedProfile) {
          console.log('✅ Profile loaded from backend:', storedProfile.name || 'Unnamed');
          setUserProfile(storedProfile);
          setIsProfileLoaded(true);
        } else {
          console.warn('⚠️ No profile found - using default profile');
          // Only set default if explicitly no profile exists
          // Don't overwrite existing profile if API failed
          setUserProfile(prev => {
            // If we already have a profile with data, keep it
            if (prev.name || prev.role || prev.skills.length > 0) {
              console.log('📌 Keeping existing profile in state (API returned null but profile exists in state)');
              return prev;
            }
            return storageService.getDefaultProfile();
          });
          setIsProfileLoaded(false);
        }

        // 2. Load cached matches if exist
        const cachedMatches = await storageService.getCachedMatches();
        if (cachedMatches && cachedMatches.length > 0) {
          setMatches(cachedMatches);
        }
      } catch (error) {
        console.error('❌ Error in initApp:', error);
        // Don't reset profile on error - keep what we have
      } finally {
        setLoading(false);
      }
    };

    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnboarding, checkingUser]); 

  const handleManualSearch = async () => {
    if (!userProfile) return;
    
    setLoading(true);
    setSearchError(null);
    
    try {
      // Use real vacancy service instead of simulated delay
      const data = await generateSimulatedMatches(userProfile);
      // Sort by match score (Highest first)
      const sortedData = data.sort((a, b) => b.matchScore - a.matchScore);
      
      setMatches(sortedData);
      
      // Cache results
      await storageService.cacheMatches(sortedData);
      
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to fetch vacancies. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    await storageService.saveUserProfile(newProfile);
    setCurrentView('dashboard');
    // We do NOT auto-regenerate matches anymore
    // User must click search manually
  };

  return (
    <>
      {/* Show loading while checking user status */}
      {checkingUser && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
            <p className="text-blue-200 font-medium tracking-wide animate-pulse">Initializing...</p>
          </div>
        </div>
      )}

      {/* Show Onboarding for new users */}
      {!checkingUser && showOnboarding && (
        <OnboardingContainer
          onComplete={async () => {
            setShowOnboarding(false);
            console.log('✅ Onboarding completed, reloading profile...');
            // Reload profile after onboarding but DO NOT scan
            const storedProfile = await storageService.getUserProfile();
            if (storedProfile) {
              console.log('✅ Profile reloaded after onboarding:', storedProfile.name);
              setUserProfile(storedProfile);
              setIsProfileLoaded(true);
            } else {
              console.error('⚠️ Failed to load profile after onboarding');
            }
          }}
        />
      )}

      {/* Main App */}
      {!checkingUser && !showOnboarding && (
        <div className="min-h-screen text-gray-100 pb-20">
          <Navigation currentView={currentView} setView={setCurrentView} />

          <main className="max-w-7xl mx-auto px-4 mt-28 md:mt-32">
        
            {/* DASHBOARD VIEW */}
            {currentView === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">
                
                {matches.length > 0 ? (
                  <>
                    {/* Header Section with Results */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-md">
                          Hello, {userProfile?.name?.split(' ')[0] || 'there'} 👋
                        </h1>
                        <p className="text-blue-200/80 text-lg">
                          Displaying <span className="text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-lg border border-blue-500/20">{matches.length}</span> cached vacancies.
                        </p>
                      </div>
                      <div className="flex gap-3">
                         <GlassButton onClick={() => console.log('Filter')} variant="secondary">
                           <Filter size={18} /> Filters
                         </GlassButton>
                         <GlassButton onClick={handleManualSearch} disabled={loading} variant="primary">
                           {loading ? (
                             <RefreshCw size={18} className="animate-spin" />
                           ) : (
                             <RefreshCw size={18} />
                           )}
                           {loading ? 'Refreshing...' : 'Refresh Results'}
                         </GlassButton>
                      </div>
                    </div>

                    {/* Matches Grid or Loading Skeleton */}
                    {loading ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {[1,2,3].map(i => (
                           <GlassCard key={i} className="h-72 animate-pulse flex flex-col justify-between p-6 bg-white/5">
                              <div className="space-y-4">
                                <div className="h-7 bg-white/10 rounded-lg w-3/4"></div>
                                <div className="h-4 bg-white/5 rounded-lg w-1/2"></div>
                                <div className="flex gap-2 pt-2">
                                   <div className="h-6 w-16 bg-white/5 rounded-full"></div>
                                   <div className="h-6 w-16 bg-white/5 rounded-full"></div>
                                </div>
                              </div>
                              <div className="h-24 bg-black/20 rounded-xl mt-4"></div>
                           </GlassCard>
                         ))}
                       </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {matches.map((match, index) => (
                          <VacancyCard key={`${match.vacancy.id}-${index}`} match={match} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  /* EMPTY STATE with Manual Search Button */
                  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in zoom-in duration-700">
                    <div className="text-center space-y-4 max-w-2xl mx-auto">
                      <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto ring-4 ring-blue-500/20 mb-6 relative">
                         <div className="absolute inset-0 bg-blue-400/20 rounded-full animate-ping opacity-30"></div>
                         <Sparkles size={48} className="text-blue-400" />
                      </div>
                      
                      <h2 className="text-4xl font-bold text-white tracking-tight">
                        Ready to Find Your Dream Job?
                      </h2>
                      <p className="text-xl text-blue-200/70 max-w-lg mx-auto leading-relaxed">
                        Click the button below to inspect <span className="text-white font-semibold">rabota.md</span> for the latest vacancies matching your profile.
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      <GlassButton
                        variant="primary"
                        onClick={handleManualSearch}
                        disabled={loading}
                        className="px-10 py-5 text-xl shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 active:scale-95 border-blue-400/50"
                      >
                        {loading ? (
                          <>
                            <RefreshCw size={24} className="mr-3 animate-spin" />
                            Scanning Job Boards...
                          </>
                        ) : (
                          <>
                            <Sparkles size={24} className="mr-3" />
                            Start Job Search
                          </>
                        )}
                      </GlassButton>
                      
                      {searchError && (
                        <div className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 animate-in slide-in-from-top-2">
                          {searchError}
                        </div>
                      )}
                      
                      {loading && (
                        <p className="text-sm text-gray-500 animate-pulse">
                          This usually takes about 3-5 seconds...
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PROFILE VIEW */}
            {currentView === 'profile' && (
              <ProfileEditor 
                profile={userProfile} 
                onSave={handleProfileSave}
                onDelete={async () => {
                  setLoading(true);
                  const success = await storageService.deleteAccount();
                  if (success) {
                    console.log('🗑️ Account deleted, resetting to onboarding');
                    setShowOnboarding(true);
                    setUserProfile(storageService.getDefaultProfile());
                    setCurrentView('dashboard');
                    window.location.reload(); // Force full reload to reset all state
                  }
                  setLoading(false);
                }} 
              />
            )}

            {/* INTEGRATIONS VIEW */}
            {currentView === 'integrations' && (
              <IntegrationsPage />
            )}

            {/* NOTIFICATIONS VIEW */}
            {currentView === 'notifications' && (
              <NotificationSettings />
            )}

          </main>
        </div>
      )}
    </>
  );
};

export default App;