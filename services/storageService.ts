import { workerData } from 'worker_threads';
import { UserProfile, ExperienceLevel, WorkplaceType, WorkSchedule, EducationLevel, VacancyMatch } from '../types';

const CACHE_KEY = 'vacancy_matches_cache';
const CACHE_TIMESTAMP_KEY = 'vacancy_matches_timestamp';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minutes

export const DEFAULT_PROFILE: UserProfile = {
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
};

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

  getUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/profile`, {
          headers: {
            'x-user-id': getUserId(),
          }
      });
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.profile || null;
    } catch (error) {
      console.error('Failed to load profile from backend:', error);
      return null;
    }
  },
  
  getDefaultProfile: (): UserProfile => {
      return DEFAULT_PROFILE;
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
  }
};
