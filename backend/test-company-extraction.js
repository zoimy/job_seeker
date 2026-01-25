import axios from 'axios';
import * as cheerio from 'cheerio';

async function testCompanyExtraction() {
  const url = 'https://www.rabota.md/ru/jobs-chisinau-developer';
  
  console.log('Fetching:', url);
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  
  const $ = cheerio.load(response.data);
  
  console.log(`Found ${$('.vacancyCardItem').length} vacancy cards\n`);
  
  // Test first 3 vacancies
  $('.vacancyCardItem').slice(0, 3).each((i, element) => {
    const $el = $(element);
    
    console.log(`\n=== Vacancy ${i + 1} ===`);
    
    // Try different selectors
    const selectors = [
      'a.company-title',
      '.company-title',
      'a[href*="/companies/"]',
      'a[href*="/company/"]'
    ];
    
    selectors.forEach(sel => {
      const found = $el.find(sel);
      console.log(`Selector "${sel}": ${found.length} matches`);
      if (found.length > 0) {
        console.log(`  Text: "${found.first().text().trim()}"`);
        console.log(`  HTML: ${found.first().html()?.substring(0, 100)}`);
      }
    });
    
    // Show the HTML of the card (first 500 chars)
    console.log(`\nCard HTML preview:`);
    console.log($el.html().substring(0, 500));
  });
}

testCompanyExtraction().catch(console.error);
