import axios from 'axios';
import * as cheerio from 'cheerio';

async function testFullCard() {
  const url = 'https://www.rabota.md/ru/jobs-chisinau-developer';
  
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  
  // Get first vacancy card's full HTML
  const firstCard = $('.vacancyCardItem').first();
  
  console.log('=== FULL FIRST CARD HTML ===\n');
  console.log(firstCard.html());
}

testFullCard().catch(console.error);
