import express from 'express';
import RabotaMdScraper from '../scrapers/rabotaMdScraper.js';
import { validate, validators } from '../utils/validation.js';
import { scrapeLimiter } from '../config/security.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();
const scraper = new RabotaMdScraper();

/**
 * POST /api/scrape/rabota-md
 * Scrape jobs from rabota.md
 */
router.post('/rabota-md', scrapeLimiter, validate(validators.scrape), catchAsync(async (req, res) => {
  const { query, location, searchPeriodDays } = req.body;
  
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
}));

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
