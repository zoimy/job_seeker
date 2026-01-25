import express from 'express';
import RabotaMdScraper from '../scrapers/rabotaMdScraper.js';

const router = express.Router();
const scraper = new RabotaMdScraper();

/**
 * POST /api/scrape/rabota-md
 * Scrape jobs from rabota.md
 */
router.post('/rabota-md', async (req, res) => {
  try {
    const { query, location, searchPeriodDays } = req.body;
    
    // Validate input
    if (!query) {
      return res.status(400).json({ 
        error: 'Query is required',
        success: false 
      });
    }
    
    console.log(`Scraping request: query="${query}", location="${location}", period=${searchPeriodDays}`);
    
    // Scrape vacancies
    const vacancies = await scraper.scrapeVacancies({
      query,
      location: location || 'chisinau',
      searchPeriodDays: searchPeriodDays || 1
    });
    
    res.json({
      success: true,
      count: vacancies.length,
      vacancies,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /api/scrape/test
 * Test endpoint
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Scraper API is running',
    timestamp: new Date().toISOString()
  });
});

export default router;
