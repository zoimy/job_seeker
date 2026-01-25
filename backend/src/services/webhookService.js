import axios from 'axios';

/**
 * WebhookNotificationService - Handles sending notifications to custom webhook endpoints
 */
class WebhookNotificationService {
  constructor() {
    this.initialized = true;
  }

  /**
   * Send vacancy notification to custom webhook
   */
  async sendVacancyNotification(webhookUrl, vacancy, matchScore) {
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not provided' };
    }

    try {
      const payload = {
        event: 'new_vacancy',
        timestamp: new Date().toISOString(),
        data: {
          vacancy: {
            id: vacancy.id,
            title: vacancy.title,
            company: vacancy.company,
            description: vacancy.description,
            location: vacancy.location,
            skills: vacancy.skills,
            experienceLevel: vacancy.experienceLevel,
            salary: {
              min: vacancy.salaryMin,
              max: vacancy.salaryMax,
              currency: vacancy.currency
            },
            workplace: vacancy.workplace,
            schedule: vacancy.schedule,
            postedAt: vacancy.postedAt,
            url: vacancy.url
          },
          matchScore: matchScore
        }
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'JobTracker-Webhook/1.0'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log(`✅ Webhook notification sent (status: ${response.status})`);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ Error sending webhook notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send multiple vacancies (batch)
   */
  async sendBatchNotification(webhookUrl, vacancies, userProfile) {
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not provided' };
    }

    try {
      const payload = {
        event: 'new_vacancies_batch',
        timestamp: new Date().toISOString(),
        data: {
          count: vacancies.length,
          userProfile: {
            role: userProfile.role,
            location: userProfile.location,
            skills: userProfile.skills
          },
          vacancies: vacancies.map(match => ({
            vacancy: {
              id: match.vacancy.id,
              title: match.vacancy.title,
              company: match.vacancy.company,
              description: match.vacancy.description,
              location: match.vacancy.location,
              skills: match.vacancy.skills,
              salary: {
                min: match.vacancy.salaryMin,
                max: match.vacancy.salaryMax,
                currency: match.vacancy.currency
              },
              url: match.vacancy.url,
              postedAt: match.vacancy.postedAt
            },
            matchScore: match.matchScore,
            breakdown: match.breakdown
          }))
        }
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'JobTracker-Webhook/1.0'
        },
        timeout: 15000 // 15 second timeout for batch
      });

      console.log(`✅ Webhook batch notification sent (${vacancies.length} vacancies, status: ${response.status})`);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ Error sending batch webhook notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test message
   */
  async sendTestMessage(webhookUrl) {
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not provided' };
    }

    try {
      const payload = {
        event: 'test',
        timestamp: new Date().toISOString(),
        message: 'Test successful! Your Job Tracker webhook integration is working correctly.',
        data: {
          test: true
        }
      };

      const response = await axios.post(webhookUrl, payload, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'JobTracker-Webhook/1.0'
        },
        timeout: 10000
      });

      console.log(`✅ Test webhook message sent (status: ${response.status})`);
      return { success: true, status: response.status };
    } catch (error) {
      console.error('❌ Error sending test webhook message:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export const webhookService = new WebhookNotificationService();
