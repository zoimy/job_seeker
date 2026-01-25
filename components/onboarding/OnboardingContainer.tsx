import React, { useEffect } from 'react';
import { useOnboarding } from '../../hooks/useOnboarding';
import { WelcomeScreen } from './WelcomeScreen';
import { OnboardingStep1Profile } from './OnboardingStep1Profile';
import { OnboardingStep2Details } from './OnboardingStep2Details';
import { OnboardingStep3Notifications } from './OnboardingStep3Notifications';
import { OnboardingStep5Results } from './OnboardingStep5Results';
import { OnboardingSuccess } from './OnboardingSuccess';
import { storageService } from '../../services/storageService';
import { notificationServiceClient } from '../../services/notificationService';
import { integrationService } from '../../services/integrationService';
import { UserProfile, EducationLevel } from '../../types';

interface OnboardingContainerProps {
  onComplete: () => void;
}

export function OnboardingContainer({ onComplete }: OnboardingContainerProps) {
  const {
    currentStep,
    data,
    updateProfile,
    updateNotifications,
    goToNextStep,
    goToPrevStep,
    saveState,
    completeOnboarding
  } = useOnboarding();

  useEffect(() => {
    saveState();
  }, [currentStep, data]);

  const handleComplete = async () => {
    try {
      // Save profile
      const fullProfile: UserProfile = {
        name: data.profile.name || '',
        role: data.profile.role || '',
        skills: data.profile.skills || [],
        experienceLevel: data.profile.experienceLevel || 'middle',
        yearsOfExperience: 0,
        minSalary: data.profile.minSalary,
        location: data.profile.location || 'chisinau',
        preferredWorkplace: data.profile.preferredWorkplace || [],
        preferredSchedule: data.profile.preferredSchedule || [],
        searchPeriodDays: 1,
        education: 'bachelors' as EducationLevel,
        perferredCurrency: 'MDL',
        bio: ''
      };

      await storageService.saveUserProfile(fullProfile);

      // Save notification preferences
      const notificationPrefs = {
        enabled: true,
        email: data.notifications.channels.includes('email') ? data.notifications.email : '',
        emailPassword: data.notifications.channels.includes('email') ? data.notifications.emailPassword : '',
        emailService: data.notifications.channels.includes('email') ? data.notifications.emailService : 'gmail',
        telegramChatId: data.notifications.channels.includes('telegram') ? data.notifications.telegramChatId : undefined,
        minMatchScore: 70, // Raised from 60 to 70 for better relevance
        frequency: data.notifications.frequency as any
      };

      await notificationServiceClient.updatePreferences(notificationPrefs);

      // Connect integrations automatically based on selected channels
      if (data.notifications.channels.includes('telegram') && data.notifications.telegramChatId) {
        try {
          await integrationService.updateIntegration('telegram', {
            status: 'connected',
            connectionInfo: { chatId: data.notifications.telegramChatId },
            settings: { 
              frequency: data.notifications.frequency as any,
              format: 'compact'
            }
          });
        } catch (error) {
          console.error('Failed to connect Telegram integration:', error);
        }
      }

      if (data.notifications.channels.includes('email') && data.notifications.email) {
        try {
          await integrationService.updateIntegration('email', {
            status: 'connected',
            connectionInfo: { email: data.notifications.email },
            settings: {
              frequency: data.notifications.frequency as any,
              format: 'html'
            }
          });
        } catch (error) {
          console.error('Failed to connect Email integration:', error);
        }
      }



      completeOnboarding();
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Произошла ошибка при сохранении. Попробуйте еще раз.');
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background handled by global index.html but we ensure z-index context */}
      <div className="relative z-10">
        {currentStep === 0 && (
          <WelcomeScreen onStart={goToNextStep} />
        )}

        {currentStep === 1 && (
          <OnboardingStep1Profile
            data={data.profile}
            onUpdate={updateProfile}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        )}

        {currentStep === 2 && (
          <OnboardingStep2Details
            data={data.profile}
            onUpdate={updateProfile}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        )}

        {currentStep === 3 && (
          <OnboardingStep3Notifications
            data={data.notifications}
            onUpdate={updateNotifications}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        )}

        {currentStep === 4 && (
          <OnboardingStep5Results
            data={data.profile}
            onNext={goToNextStep}
            onBack={goToPrevStep}
          />
        )}

        {currentStep === 5 && (
          <OnboardingSuccess
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
