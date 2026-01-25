import RabotaMdScraper from './src/scrapers/rabotaMdScraper.js';
import { telegramService } from './src/services/telegramService.js';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  console.log('Testing scraper and notifications...\n');
  
  // Test scraper
  const scraper = new RabotaMdScraper();
  console.log('1. Testing scraper...');
  const vacancies = await scraper.scrapeVacancies({
    query: 'developer',
    location: 'chisinau',
    searchPeriodDays: 1
  });
  console.log(`   Found ${vacancies.length} vacancies`);
  
  if (vacancies.length > 0) {
    console.log(`   First vacancy: ${vacancies[0].title} at ${vacancies[0].company}`);
  }
  
  // Test Telegram
  console.log('\n2. Testing Telegram bot...');
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (token) {
    await telegramService.initialize(token);
    
    if (vacancies.length > 0) {
      console.log('   Sending test notification...');
      const result = await telegramService.sendVacancyNotification(
        '655209387',
        vacancies[0],
        75
      );
      console.log(`   Result:`, result);
    }
  } else {
    console.log('   No token found');
  }
}

test().catch(console.error);
