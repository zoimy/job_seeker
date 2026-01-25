import axios from 'axios';

/**
 * DiscordNotificationService - Handles sending notifications via Discord Webhook
 */
class DiscordNotificationService {
  constructor() {
    this.initialized = true; // No special initialization needed for webhooks
  }

  /**
   * Send vacancy notification to Discord channel
   */
  async sendVacancyNotification(webhookUrl, vacancy, matchScore) {
    if (!webhookUrl) {
      return { success: false, error: 'Webhook URL not provided' };
    }

    try {
      const emoji = matchScore >= 80 ? '🔥' : matchScore >= 60 ? '🎯' : '📌';
      
      // Choose embed color based on match score
      const color = matchScore >= 80 ? 0x10b981 : matchScore >= 60 ? 0x7c3aed : 0x3b82f6;
      
      const embed = {
        title: `${emoji} ${vacancy.title}`,
        description: vacancy.description?.substring(0, 200) + '...' || 'No description available',
        color: color,
        fields: [
          {
            name: '🏢 Company',
            value: vacancy.company,
            inline: true
          },
          {
            name: '📍 Location',
            value: vacancy.location,
            inline: true
          },
          {
            name: '🎯 Match Score',
            value: `${matchScore}%`,
            inline: true
          }
        ],
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Job Tracker'
        }
      };

      // Add salary field if available
      if (vacancy.salaryMin) {
        embed.fields.push({
          name: '💰 Salary',
          value: `${vacancy.salaryMin}${vacancy.salaryMax ? `-${vacancy.salaryMax}` : '+'} ${vacancy.currency}`,
          inline: true
        });
      }

      // Add skills field if available
      if (vacancy.skills && vacancy.skills.length > 0) {
        embed.fields.push({
          name: '✅ Skills',
          value: vacancy.skills.slice(0, 5).join(', '),
          inline: false
        });
      }

      // Add URL if available
      if (vacancy.url) {
        embed.url = vacancy.url;
      }

      const message = {
        content: `${emoji} **New Job Match Found!**`,
        embeds: [embed]
      };

      await axios.post(webhookUrl, message);
      
      console.log('✅ Discord notification sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending Discord message:', error.message);
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
      
      const embeds = [{
        title: `🎯 ${vacancies.length} New Job Matches Found!`,
        description: `We found **${vacancies.length}** new job${vacancies.length > 1 ? 's' : ''} matching your profile.`,
        color: 0x7c3aed,
        timestamp: new Date().toISOString(),
        footer: {
          text: 'Job Tracker'
        }
      }];

      // Add embeds for top vacancies
      topVacancies.forEach((match, index) => {
        const v = match.vacancy;
        embeds.push({
          title: `${index + 1}. ${v.title}`,
          description: v.url || '',
          color: 0x3b82f6,
          fields: [
            {
              name: '🏢 Company',
              value: v.company,
              inline: true
            },
            {
              name: '🎯 Match',
              value: `${match.matchScore}%`,
              inline: true
            }
          ]
        });
      });

      if (vacancies.length > 5) {
        embeds.push({
          description: `_...and ${vacancies.length - 5} more vacancies in your Job Tracker dashboard_`,
          color: 0x6b7280
        });
      }

      const message = {
        content: '🎯 **New Job Matches!**',
        embeds: embeds.slice(0, 10) // Discord limit is 10 embeds per message
      };

      await axios.post(webhookUrl, message);
      
      console.log(`✅ Discord batch notification sent (${vacancies.length} vacancies)`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending batch Discord notification:', error.message);
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
        content: '✅ **Test Successful!**',
        embeds: [{
          title: '✅ Job Tracker Integration Test',
          description: 'Your Discord integration is working correctly. You will receive notifications here when new job vacancies matching your profile are found.',
          color: 0x10b981,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Job Tracker'
          }
        }]
      };

      await axios.post(webhookUrl, message);
      
      console.log('✅ Test Discord message sent');
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending test Discord message:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export const discordService = new DiscordNotificationService();
