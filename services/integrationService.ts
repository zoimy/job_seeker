import { Integration, ServiceType, IntegrationSettings } from '../types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

/**
 * Frontend service for managing integrations with the backend API
 */
class IntegrationServiceClient {
  /**
   * Get all integrations
   */
  async getIntegrations(): Promise<Integration[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/integrations`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.integrations || [];
    } catch (error) {
      console.error('Error fetching integrations:', error);
      return [];
    }
  }

  /**
   * Get a specific integration
   */
  async getIntegration(serviceId: ServiceType): Promise<Integration | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/integrations/${serviceId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${serviceId} integration:`, error);
      return null;
    }
  }

  /**
   * Update/connect an integration
   */
  async updateIntegration(
    serviceId: ServiceType,
    updates: Partial<Integration>
  ): Promise<{ success: boolean; integration?: Integration; error?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/integrations/${serviceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: data.success, integration: data.integration };
    } catch (error: any) {
      console.error(`Error updating ${serviceId} integration:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect an integration
   */
  async disconnectIntegration(serviceId: ServiceType): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/integrations/${serviceId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error(`Error disconnecting ${serviceId} integration:`, error);
      return false;
    }
  }

  /**
   * Test an integration (send test notification)
   */
  async testIntegration(serviceId: ServiceType): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(`${BACKEND_URL}/api/integrations/${serviceId}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return await response.json();
    } catch (error: any) {
      console.error(`Error testing ${serviceId} integration:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Connect Telegram with chat ID
   */
  async connectTelegram(chatId: string, settings?: IntegrationSettings): Promise<{ success: boolean; error?: string }> {
    return this.updateIntegration('telegram', {
      status: 'connected',
      connectionInfo: { chatId },
      settings: settings || { frequency: 'instant', format: 'compact' }
    });
  }

  /**
   * Connect webhook-based service (Slack, Discord, or custom webhook)
   */
  async connectWebhookService(
    serviceId: 'slack' | 'discord' | 'webhook',
    webhookUrl: string,
    settings?: IntegrationSettings
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateIntegration(serviceId, {
      status: 'connected',
      connectionInfo: { webhookUrl },
      settings: settings || { frequency: 'instant', format: 'compact' }
    });
  }

  /**
   * Connect email
   */
  async connectEmail(email: string, settings?: IntegrationSettings): Promise<{ success: boolean; error?: string }> {
    return this.updateIntegration('email', {
      status: 'connected',
      connectionInfo: { email },
      settings: settings || { frequency: 'daily', format: 'html' }
    });
  }

  /**
   * Update integration settings
   */
  async updateSettings(serviceId: ServiceType, settings: IntegrationSettings): Promise<boolean> {
    const result = await this.updateIntegration(serviceId, { settings });
    return result.success;
  }
}

export const integrationService = new IntegrationServiceClient();
