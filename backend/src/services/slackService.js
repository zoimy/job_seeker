import axios from 'axios';

/**
 * SlackNotificationService - Handles sending notifications via Slack Webhook
 */
class SlackNotificationService {
  constructor() {
    this.initialized = true; // No special initialization needed for webhooks
  }

  /**
   * Send vacancy notification to Slack channel
   */
  async sendVacancyNotification(webhookUrl, vacancy, matchScore) {
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not provided' };
    }

    try {
      const emoji = matchScore >= 80 ? '🔥' : matchScore >= 60 ? '🎯' : '📌';
      
      const message = {
        text: `${emoji} New Job Match: ${vacancy.title}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${emoji} ${vacancy.title}`,
              emoji: true
            }
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Company:*\n${vacancy.company}`
              },
              {
                type: 'mrkdwn',
                text: `*Match Score:*\n${matchScore}%`
              },
              {
                type: 'mrkdwn',
                text: `*Location:*\n${vacancy.location}`
              },
              {
                type: 'mrkdwn',
                text: vacancy.salaryMin 
                  ? `*Salary:*\n${vacancy.salaryMin}${vacancy.salaryMax ? `-${vacancy.salaryMax}` : '+'} ${vacancy.currency}`
                  : '*Salary:*\nNot specified'
              }
            ]
          }
        ]
      };

      // Add skills if available
      if (vacancy.skills && vacancy.skills.length > 0) {
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Skills:* ${vacancy.skills.slice(0, 5).join(', ')}`
          }
        });
      }

      // Add button to view vacancy
      if (vacancy.url) {
        message.blocks.push({
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: '🔗 View Vacancy',
                emoji: true
              },
              url: vacancy.url,
              style: 'primary'
            }
          ]
        });
      }

      await axios.post(webhookUrl, message);
      
      console.log('✅ Slack notification sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending Slack message:', error.message);
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
      const topVacancies = vacancies.slice(0, 5);
      
      const message = {
        text: `🎯 ${vacancies.length} New Job Matches Found!`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🎯 ${vacancies.length} New Job Matches!`,
              emoji: true
            }
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `We found *${vacancies.length}* new job${vacancies.length > 1 ? 's' : ''} matching your profile.`
            }
          },
          {
            type: 'divider'
          }
        ]
      };

      // Add top vacancies
      topVacancies.forEach((match, index) => {
        const v = match.vacancy;
        message.blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${index + 1}. ${v.title}* (${match.matchScore}%)\n🏢 ${v.company}${v.url ? `\n<${v.url}|View Details →>` : ''}`
          }
        });
      });

      if (vacancies.length > 5) {
        message.blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `_...and ${vacancies.length - 5} more vacancies_`
            }
          ]
        });
      }

      await axios.post(webhookUrl, message);
      
      console.log(`✅ Slack batch notification sent (${vacancies.length} vacancies)`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending batch Slack notification:', error.message);
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
      const message = {
        text: '✅ Test Successful!',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '*✅ Test Successful!*\n\nYour Job Tracker Slack integration is working correctly. You will receive notifications here when new job vacancies matching your profile are found.'
            }
          }
        ]
      };

      await axios.post(webhookUrl, message);
      
      console.log('✅ Test Slack message sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending test Slack message:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export const slackService = new SlackNotificationService();
