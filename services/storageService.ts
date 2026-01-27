import { workerData } from 'worker_threads';
import { UserProfile, ExperienceLevel, WorkplaceType, WorkSchedule, EducationLevel, VacancyMatch } from '../types';

const CACHE_KEY = 'vacancy_matches_cache';
const CACHE_TIMESTAMP_KEY = 'vacancy_matches_timestamp';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

// Return a fresh copy each time to avoid React state mutation issues
export const getDefaultProfile = (): UserProfile => ({
  name: "",
  role: "",
  skills: [],
  experienceLevel: ExperienceLevel.ANY,
  yearsOfExperience: 0,
  location: "",
  minSalary: 0,
  perferredCurrency: 'MDL',
  preferredWorkplace: [],
  preferredSchedule: [],
  education: EducationLevel.ANY,
  bio: "",
  searchPeriodDays: 7
});

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Helper to get or generate User ID unique to this browser
export const getUserId = (): string => {
  const STORAGE_KEY = 'job_tracker_user_id';
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
};

export const storageService = {
  saveUserProfile: async (profile: UserProfile): Promise<void> => {
    try {
      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId(),
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile to backend:', error);
      // Fallback/Error handling could be added here
    }
  },

  getUserProfile: async (retryCount = 2): Promise<UserProfile | null> => {
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(`${BASE_URL}/api/profile`, {
          headers: {
            'x-user-id': getUserId(),
          },
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(10000) // 10 second timeout
        });
        
        // If response is not OK, check the status
        if (!response.ok) {
          // 404 means no profile exists yet - this is expected for new users
          if (response.status === 404) {
            console.log('No profile found - user needs to create one');
            return null;
          }
          // Other errors (401, 403, 500, etc.) - retry
          if (attempt < retryCount) {
            console.warn(`Profile fetch failed with status ${response.status}, retrying... (${attempt + 1}/${retryCount})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
            continue;
          }
          return null;
        }
        
        const data = await response.json();
        
        // Successfully fetched profile
        if (data.profile) {
          console.log('✅ Profile loaded successfully:', data.profile.name || 'Unnamed');
          return data.profile;
        }
        
        // Profile is explicitly null in response
        return null;
        
      } catch (error: any) {
        console.error(`Failed to load profile (attempt ${attempt + 1}/${retryCount + 1}):`, error.message);
        
        // If this is not the last attempt, retry
        if (attempt < retryCount) {
          console.log(`Retrying in ${(attempt + 1)} seconds...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          continue;
        }
        
        // Last attempt failed - return null
        console.error('❌ All profile fetch attempts failed');
        return null;
      }
    }
    return null;
  },

  deleteAccount: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/api/profile`, {
        method: 'DELETE',
        headers: {
            'x-user-id': getUserId(),
        }
      });
      
      if (response.ok) {
        // Clear local storage
        localStorage.clear();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete account:', error);
      return false;
    }
  },

  cacheMatches: (matches: VacancyMatch[]): void => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(matches));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Failed to cache matches:', error);
    }
  },

  getCachedMatches: (): VacancyMatch[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (!cached || !timestamp) return null;
      
      const age = Date.now() - parseInt(timestamp);
      if (age > CACHE_DURATION) {
        // Cache expired
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        return null;
      }
      
      return JSON.parse(cached);
    } catch (error) {
      console.error('Failed to get cached matches:', error);
      return null;
    }
  },

  clearCache: (): void => {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  },

  getDefaultProfile: (): UserProfile => {
    return getDefaultProfile();
  }
};
