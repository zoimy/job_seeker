import { useState, useEffect } from 'react';
import { UserProfile, ExperienceLevel, WorkplaceType } from '../types';

export interface OnboardingData {
  profile: Partial<UserProfile>;
  notifications: {
    channels: ('email' | 'telegram')[];
    email: string;
    emailPassword: string;
    emailService: string;
    frequency: string;
    telegramChatId?: string;
  };
}

const STORAGE_KEY = 'onboarding-state';
const COMPLETE_KEY = 'onboarding-complete';

export function useOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    profile: {
      name: '',
      role: '',
      skills: [],
      experienceLevel: 'middle' as ExperienceLevel,
      minSalary: undefined,
      location: 'chisinau',
      preferredWorkplace: [] as WorkplaceType[],
    },
    notifications: {
      channels: ['email'],
      email: '',
      emailPassword: '',
      emailService: 'gmail',
      frequency: 'instant',
    }
  });

  // Load saved state on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed.data || data);
        setCurrentStep(parsed.step || 0);
      } catch (e) {
        console.error('Failed to load onboarding state:', e);
      }
    }
  }, []);

  // Save state whenever it changes
  const saveState = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      step: currentStep,
      data
    }));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setData(prev => ({
      ...prev,
      profile: { ...prev.profile, ...updates }
    }));
  };

  const updateNotifications = (updates: Partial<OnboardingData['notifications']>) => {
    setData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, ...updates }
    }));
  };

  const goToNextStep = () => {
    setCurrentStep(prev => prev + 1);
    saveState();
  };

  const goToPrevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    saveState();
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    saveState();
  };

  const completeOnboarding = () => {
    localStorage.setItem(COMPLETE_KEY, 'true');
    localStorage.removeItem(STORAGE_KEY);
  };

  const isOnboardingComplete = (): boolean => {
    return localStorage.getItem(COMPLETE_KEY) === 'true';
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COMPLETE_KEY);
    setCurrentStep(0);
    setData({
      profile: {
        name: '',
        role: '',
        skills: [],
        experienceLevel: 'middle' as ExperienceLevel,
        minSalary: undefined,
        location: 'chisinau',
        preferredWorkplace: [] as WorkplaceType[],
      },
      notifications: {
        channels: ['email'],
        email: '',
        emailPassword: '',
        emailService: 'gmail',
        frequency: 'instant',
      }
    });
  };

  return {
    currentStep,
    data,
    updateProfile,
    updateNotifications,
    goToNextStep,
    goToPrevStep,
    goToStep,
    saveState,
    completeOnboarding,
    isOnboardingComplete,
    resetOnboarding
  };
}

/**
 * Check if user is new by verifying backend profile existence
 * This ensures data persistence across page refreshes
 */
export async function isNewUser(): Promise<boolean> {
  // First check if onboarding was completed
  const onboardingComplete = localStorage.getItem(COMPLETE_KEY);
  if (onboardingComplete === 'true') {
    return false;
  }
  
  // Check backend for existing profile (using dynamic import to avoid circular deps)
  try {
    const { storageService } = await import('../services/storageService');
    const profile = await storageService.getUserProfile();
    
    // If profile exists in backend, user is not new
    if (profile && profile.name && profile.role) {
      // Mark onboarding as complete if we have a valid profile
      localStorage.setItem(COMPLETE_KEY, 'true');
      return false;
    }
  } catch (error) {
    console.error('Error checking user status:', error);
  }
  
  return true;
}
