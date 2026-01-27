import { getUserId } from './storageService';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export interface NotificationPreferences {
  enabled: boolean;
  email: string;
  emailPassword?: string;
  emailService?: string;
  telegramChatId?: string;
  minMatchScore: number;
  frequency: 'instant' | '5min' | '1h' | '6h' | '24h';
}

export interface NotificationStats {
  totalSeen: number;
  notified: number;
  pending: number;
  lastCleanup: string;
}

/**
 * Service for managing notification preferences and triggering notifications
 */
class NotificationServiceClient {
  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/preferences`, {
          headers: {
            'x-user-id': getUserId(),
          }
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      const prefs = data.preferences || {};
      
      return {
        enabled: prefs.telegramEnabled ?? false, // Map backend 'telegramEnabled' to frontend 'enabled'
        email: prefs.email || '',
        emailPassword: '', // Backend doesn't return this for security
        emailService: 'gmail',
        telegramChatId: prefs.telegramChatId || '',
        minMatchScore: prefs.minMatchScore || 70, 
        frequency: prefs.scanFrequency || '6h' 
      };
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return {
        enabled: false,
        email: '',
        minMatchScore: 70,
        frequency: '6h'
      };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: NotificationPreferences): Promise<boolean> {
    try {
      // Map frontend 'enabled' to backend 'telegramEnabled'
      const payload = {
        telegramEnabled: preferences.enabled,
        telegramChatId: preferences.telegramChatId,
        scanFrequency: preferences.frequency,
        minMatchScore: preferences.minMatchScore  // FIX: Add minMatchScore to save it
        // Send other fields if backend supported them, but currently it mainly syncs these two
      };

      const response = await fetch(`${BACKEND_URL}/api/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId(),
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Send test notification
   */
  async sendTestNotification(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test Telegram notification
   */
  async sendTestTelegram(chatId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/test-telegram`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId(),
        },
        body: JSON.stringify({ chatId })
      });

      return await response.json();
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Trigger manual scan
   */
  async triggerScan(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/scan`, {
        method: 'POST'
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error triggering scan:', error);
      return false;
    }
  }

  /**
   * Get notification statistics
   */
  async getStats(): Promise<NotificationStats | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/stats`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      return null;
    }
  }

  /**
   * Trigger immediate vacancy scan
   * Used after onboarding completion to find matching jobs right away
   */
  async triggerImmediateScan(): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/notifications/scan-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': getUserId(),
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Failed to trigger immediate scan:', error);
      return { success: false, error: error.message };
    }
  }
}

export const notificationServiceClient = new NotificationServiceClient();
