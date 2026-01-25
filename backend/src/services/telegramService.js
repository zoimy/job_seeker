import TelegramBot from 'node-telegram-bot-api';

/**
 * TelegramNotificationService - Handles sending notifications via Telegram Bot
 */
class TelegramNotificationService {
  constructor() {
    this.bot = null;
    this.initialized = false;
  }

  /**
   * Initialize Telegram Bot
   */
  async initialize(token) {
    if (!token) {
      console.warn('⚠️  Telegram bot token not provided');
      return false;
    }

    try {
      this.bot = new TelegramBot(token, { polling: false });
      
      // Test bot
      const me = await this.bot.getMe();
      console.log(`✅ Telegram Bot initialized: @${me.username}`);
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize Telegram bot:', error.message);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Send vacancy notification to user
   */
  async sendVacancyNotification(chatId, vacancy, matchScore) {
    if (!this.initialized || !this.bot) {
      console.warn('Telegram bot not initialized, skipping');
      return { success: false, error: 'Bot not initialized' };
    }

    try {
      const emoji = matchScore >= 80 ? '🔥' : matchScore >= 60 ? '🎯' : '📌';
      
      // Build salary string
      let salaryStr = '';
      if (vacancy.salaryMin) {
        const salaryPart = `${vacancy.salaryMin}${vacancy.salaryMax ? `-${vacancy.salaryMax}` : '+'} ${vacancy.currency || ''}`;
        salaryStr = `\n💰 ${salaryPart}`;
      }
      
      // Build skills string
      let skillsStr = '';
      if (vacancy.skills && vacancy.skills.length > 0) {
        const skillsList = vacancy.skills.slice(0, 5).join(', ');
        skillsStr = `✅ <b>Навыки:</b> ${skillsList}`;
      }
      
      const message = `
${emoji} <b>Новая Вакансия!</b> (Match: <b>${matchScore}%</b>)

💼 <b>${vacancy.title}</b>
🏢 ${vacancy.company}
📍 ${vacancy.location || 'N/A'}${salaryStr}

${skillsStr}

<a href="${vacancy.url}">🔗 Открыть вакансию</a>
      `.trim();

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [[
            { text: '🔗 Открыть вакансию', url: vacancy.url }
          ]]
        }
      });

      console.log(`✅ Telegram notification sent to chat ${chatId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending Telegram message:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send multiple vacancies (batch)
   */
  async sendBatchNotification(chatId, vacancies, userProfile) {
    if (!this.initialized || !this.bot) {
      return { success: false, error: 'Bot not initialized' };
    }

    try {
      const topVacancies = vacancies.slice(0, 5);
      
      let message = `🎯 <b>Найдено ${vacancies.length} новых вакансий!</b>\n\n`;
      
      topVacancies.forEach((match, index) => {
        const v = match.vacancy;
        message += `${index + 1}. <b>${v.title}</b> (${match.matchScore}%)\n`;
        message += `   🏢 ${v.company}\n`;
        message += `   <a href="${v.url}">Подробнее</a>\n\n`;
      });

      if (vacancies.length > 5) {
        message += `<i>...и еще ${vacancies.length - 5} вакансий</i>\n`;
      }

      await this.bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      });

      console.log(`✅ Telegram batch notification sent (${vacancies.length} vacancies)`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending batch Telegram notification:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send test message
   */
  async sendTestMessage(chatId) {
    if (!this.initialized || !this.bot) {
      return { success: false, error: 'Bot not initialized' };
    }

    try {
      await this.bot.sendMessage(chatId, 
        '✅ <b>Тест успешен!</b>\n\nВаши уведомления о вакансиях настроены правильно. Вы будете получать сообщения о новых вакансиях здесь.',
        { parse_mode: 'HTML' }
      );
      console.log(`✅ Test Telegram sent to chat ${chatId}`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error sending test Telegram:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export const telegramService = new TelegramNotificationService();
