import axios from 'axios';
import * as cheerio from 'cheerio';
import crypto from 'crypto';

/**
 * Scraper for rabota.md website
 * Fetches real job vacancies from rabota.md
 */
export class RabotaMdScraper {
  constructor() {
    this.baseUrl = 'https://www.rabota.md';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1'
    };
  }

  /**
   * Main scraping function
   */
  async scrapeVacancies(params) {
    const { query, location = 'chisinau', searchPeriodDays = 1 } = params;
    
    try {
      // Build search URL
      // Build search URL
      const searchQuery = query.replace(/\s+/g, '-');
      const baseUrl = `${this.baseUrl}/ru/jobs-${location}`;
      const url = searchQuery ? `${baseUrl}-${searchQuery}` : baseUrl;
      
      console.log(`Scraping: ${url}`);
      
      // Fetch page
      const response = await axios.get(url, { 
        headers: this.headers,
        timeout: 10000 
      });
      
      const $ = cheerio.load(response.data);
      const vacancies = [];
      
      // Parse vacancy listings
      // rabota.md uses class "vacancyCardItem" for vacancy cards
      console.log(`Found ${$('.vacancyCardItem').length} items on page`);

      $('.vacancyCardItem').each((i, element) => {
        try {
          const $el = $(element);
          
          // Helper for safer extraction
          const safeExtract = (fn, name) => {
             try { return fn(); } 
             catch (e) { console.error(`Failed to extract ${name}: ${e.message}`); return ''; }
          };

          // Extract data with multiple selector fallbacks
          const title = safeExtract(() => this.extractText($el, [
            '.vacancyShowPopup',
            'a.text-primary',
            'h2 a',
            'h3 a',
            '.title a',
            'a'
          ]), 'title');
          
          // Extract company - first try data attribute, then fallback to text
          const company = safeExtract(() => {
            const companyFromData = $el.find('[data-vacancycompany]').attr('data-vacancycompany');
            if (companyFromData) return companyFromData.trim();
            
            return this.extractText($el, [
              'a.company-title',
              '.company-title',
              'a[href*="/companies/"]',
              '.companyName'
            ]);
          }, 'company');
          
          const salary = this.extractText($el, [
            '.salaryTop',
            '.salary',
            '.wage',
            '[class*="salary"]',
            '[class*="wage"]'
          ]);
          
          const location = this.extractText($el, [
            '.cityItem',
            '.location',
            '.city',
            '[class*="location"]',
            '[class*="city"]'
          ]);
          
          const description = this.extractText($el, [
            '.vacancyDescription',
            '.description',
            '.job-description',
            '.vacancy-description',
            'p'
          ]);
          
          let postedDate = this.extractText($el, [
            '.dateCreated',
            '.posted-date',
            '.date',
            'time',
            '[class*="date"]'
          ]);

          // Fallback: Check if description contains date info (common on rabota.md)
          if (!postedDate || postedDate.length < 5) {
             const descText = description.toLowerCase();
             if (descText.includes('актуализировано') || descText.includes('updated') || descText.includes('actualizat')) {
                postedDate = description; // Use description as it contains the date
             }
          }
          
          const link = this.extractLink($el, [
            '.vacancyShowPopup',
            'a.text-primary',
            'a[href*="/vacancy/"]',
            'a[href*="/job/"]',
            '.title a',
            'h2 a',
            'h3 a',
            'a'
          ]);
          
          // Only add if we have at least a title
          if (title) {
            try {
              const vacancy = {
                id: this.generateId(title, company, i, link),
                title: title.trim(),
                company: company || 'Not specified',
                description: description || '',
                salary: this.parseSalary(salary),
                location: location || 'Chisinau',
                postedAt: this.parseDate(postedDate),
                url: (link && link.startsWith('http')) ? link : (link ? `${this.baseUrl}${link}` : url),
                source: 'rabota.md'
              };
              
              // Filter by date if within search period
              if (this.isWithinPeriod(vacancy.postedAt, searchPeriodDays)) {
                vacancies.push(vacancy);
              }
            } catch (innerErr) {
               console.error(`Error generating vacancy object for ${title}:`, innerErr);
            }
          }
        } catch (err) {
          console.error('Error parsing vacancy item:', err.message);
        }
      });
      
      console.log(`Found ${vacancies.length} vacancies on list page`);
      
      // Fetch full details for each vacancy (limit concurrency)
      console.log('Fetching full details for vacancies...');
      const detailedVacancies = [];
      const batchSize = 3; // Process 3 at a time to be polite
      
      for (let i = 0; i < vacancies.length; i += batchSize) {
        const batch = vacancies.slice(i, i + batchSize);
        const results = await Promise.all(batch.map(async (vacancy) => {
          try {
            const details = await this.fetchVacancyDetails(vacancy.url);
            return { ...vacancy, ...details };
          } catch (err) {
            console.error(`Failed to fetch details for ${vacancy.url}:`, err.message);
            return vacancy; // Return basic info if fetch fails
          }
        }));
        detailedVacancies.push(...results);
        
        // Small delay between batches
        if (i + batchSize < vacancies.length) {
            await new Promise(r => setTimeout(r, 500));
        }
      }

      return detailedVacancies;
      
    } catch (error) {
      console.error('Scraping error:', error.message);
      throw new Error(`Failed to scrape rabota.md: ${error.message}`);
    }
  }

  /**
   * Fetch full details from vacancy page
   */
  async fetchVacancyDetails(url) {
    try {
        const response = await axios.get(url, { 
            headers: this.headers,
            timeout: 10000 
        });
        const $ = cheerio.load(response.data);
        const $body = $('body');
        
        // Extract full description
        // Rabota.md detail page description selectors
        let description = this.extractText($body, [
            '.vacancy-description',
            '.d_content', 
            '.full-description',
            '#description',
            '.description',
            '.job-description',
            '.vacancy-body',
            '.details-content'
        ]);

        // Fallback: If description is empty, use the entire body text
        // This is a "nuclear option" to ensure we don't miss content, 
        // even if it includes navigation/footer noise.
        if (!description || description.length < 50) {
            description = $body.text().trim().replace(/\s+/g, ' ');
        }
        
        // Extract location if not present or generic
        
        // Extract location if not present or generic
        const location = this.extractText($body, [
            '.vacancy-city',
            '.city',
             '.region'
        ]);

        return {
            description: description || '',
            // If location was "Chisinau" default, maybe detail has specific
            // But we keep list location if detail fails
        };

    } catch (error) {
        console.warn(`Could not fetch details for ${url}: ${error.message}`);
        return {};
    }
  }
  
  /**
   * Extract text using multiple selector fallbacks
   */
  extractText($el, selectors) {
    for (const selector of selectors) {
      const text = $el.find(selector).first().text().trim();
      if (text) return text;
    }
    return '';
  }
  
  /**
   * Extract link using multiple selector fallbacks
   */
  extractLink($el, selectors) {
    for (const selector of selectors) {
      const href = $el.find(selector).first().attr('href');
      if (href) return href;
    }
    return '';
  }
  
  /**
   * Parse salary string to object
   */
  parseSalary(salaryText) {
    if (!salaryText) return { min: null, max: null, currency: 'MDL' };
    
    // Extract numbers from salary text
    const numbers = salaryText.match(/\d+/g);
    if (!numbers || numbers.length === 0) {
      return { min: null, max: null, currency: 'MDL' };
    }
    
    const currency = salaryText.includes('€') ? 'EUR' 
                   : salaryText.includes('$') ? 'USD'
                   : 'MDL';
    
    if (numbers.length === 1) {
      return { min: parseInt(numbers[0]), max: parseInt(numbers[0]), currency };
    } else {
      return { 
        min: parseInt(numbers[0]), 
        max: parseInt(numbers[1]), 
        currency 
      };
    }
  }
  
  /**
   * Parse date string to ISO format
   */
  parseDate(dateText) {
    if (!dateText) return new Date().toISOString();
    
    const now = new Date();
    const text = dateText.toLowerCase();
    
    // Check for "Updated: X minutes/hours ago" patterns (Russian/Romanian/English)
    if (
      text.includes('минут') || text.includes('minute') || 
      text.includes('secund') || text.includes('секунд') ||
      text.includes('час') || text.includes('hour') || text.includes('ore') ||
      text.includes('now') || text.includes('сейчас') || text.includes('acum')
    ) {
      return now.toISOString();
    }
    
    if (text.includes('сегодня') || text.includes('today') || text.includes('azi')) {
      return now.toISOString();
    }
    
    if (text.includes('вчера') || text.includes('yesterday') || text.includes('ieri')) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.toISOString();
    }
    
    // Check for "X days ago"
    const daysMatch = text.match(/(\d+)\s*(дн|day|zi)/i);
    if (daysMatch) {
      const daysAgo = parseInt(daysMatch[1]);
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      return date.toISOString();
    }
    
    // If we find specific date format like DD.MM.YYYY
    const dateMatch = text.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1; // Months are 0-indexed
      const year = parseInt(dateMatch[3]);
      return new Date(year, month, day).toISOString();
    }
    
    // Default to now if we can't parse, so we don't miss potential matches
    return now.toISOString();
  }
  
  /**
   * Check if date is within the search period
   */
  isWithinPeriod(dateString, days) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= days;
  }
  
  /**
   * Generate unique ID for vacancy (STABLE across multiple scrapes)
   * Uses MD5 hash of normalized title + company
   */
  generateId(title, company, index, url) {
    // Use crypto for stable hashing
    
    // Normalize and combine key fields
    // We intentionally avoid URL as it may have tracking params
    const normalizedTitle = (title || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCompany = (company || '').trim().toLowerCase().replace(/\s+/g, ' ');
    
    // Create stable identifier
    const uniqueString = `${normalizedTitle}|${normalizedCompany}`;
    
    // Generate MD5 hash (first 16 chars for readability)
    return crypto.createHash('md5')
      .update(uniqueString)
      .digest('hex')
      .substring(0, 16);
  }
  
  /**
   * Legacy - no longer used
   */
  hashString(str) {
    return crypto.createHash('md5').update(str).digest('hex').substring(0, 16);
  }
}

export default RabotaMdScraper;
