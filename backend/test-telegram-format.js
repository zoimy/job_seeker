import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';

dotenv.config();

function escapeMarkdown(text) {
  if (!text) return '';
  return text.replace(/[_*[\]()~`>#+|={}.!-]/g, (s) => `\\${s}`);
}

async function test() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const bot = new TelegramBot(token, { polling: false });
  
  const vacancy = {
    title: 'Senior PHP Developer (2500 USD)',
    company: '+56',
    location: 'Chisinau',
    salaryMin: 2500,
    salaryMax: null,
    currency: 'USD',
    skills: ['PHP', 'MySQL'],
    url: 'https://example.com'
  };
  
  const matchScore = 75;
  const emoji = '🎯';
  
  let salaryStr = '';
  if (vacancy.salaryMin) {
    const salaryPart = `${vacancy.salaryMin}${vacancy.salaryMax ? `-${vacancy.salaryMax}` : '+'} ${vacancy.currency || ''}`;
    salaryStr = `\\n💰 ${escapeMarkdown(salaryPart)}`;
  }
  
  let skillsStr = '';
  if (vacancy.skills && vacancy.skills.length > 0) {
    const skillsList = vacancy.skills.slice(0, 5).join(', ');
    skillsStr = `✅ *Навыки:* ${escapeMarkdown(skillsList)}`;
  }
  
  const message = `
${emoji} *Новая Вакансия\\\\!* \\(Match: *${matchScore}%*\\)

💼 *${escapeMarkdown(vacancy.title)}*
🏢 ${escapeMarkdown(vacancy.company)}
📍 ${escapeMarkdown(vacancy.location || 'N/A')}${salaryStr}

${skillsStr}

[🔗 Открыть вакансию](${vacancy.url})
  `.trim();
  
  console.log('MESSAGE TO SEND:');
  console.log(message);
  console.log('\\n===================\\n');
  
  try {
    await bot.sendMessage('655209387', message, {
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: true
    });
    console.log('✅ SUCCESS');
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }
  
  process.exit(0);
}

test();
