import schedule from 'node-cron';
import Vacancy from '../models/Vacancy.js';
import Profile from '../models/Profile.js';
import RabotaMdScraper from '../scrapers/rabotaMdScraper.js';
import { telegramService } from './telegramService.js';
import { notificationService } from './notificationService.js';

class NotificationScheduler {
  constructor() {
    this.scraper = new RabotaMdScraper();
    this.isRunning = false;
  }

  start() {
    // Run every hour
    schedule.schedule('0 * * * *', () => {
      this.checkNewVacancies();
    });
    console.log('⏰ Notification scheduler started (hourly)');
    
    // Initial run
    this.checkNewVacancies();
  }

  async checkNewVacancies() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    try {
      console.log('🔍 Checking for new vacancies...');
      
      // Get user profile
      const profile = await Profile.findOne();
      if (!profile || !profile.role) {
        console.log('⚠️ No profile found, skipping scrape');
        this.isRunning = false;
        return;
      }

      // Initialize services if needed
      if (process.env.TELEGRAM_BOT_TOKEN && !telegramService.initialized) {
        await telegramService.initialize(process.env.TELEGRAM_BOT_TOKEN);
      }

      // 1. Scrape
      const vacancies = await this.scraper.scrapeVacancies({
        query: profile.role,
        location: profile.location || 'chisinau',
        searchPeriodDays: 1
      });

      console.log(`📥 Scraped ${vacancies.length} vacancies`);

      // 2. Filter new vacancies (check against DB)
      const newVacancies = [];
      const matches = [];

      for (const v of vacancies) {
        // Check if exists
        const exists = await Vacancy.findOne({ vacancyId: v.id });
        
        if (!exists) {
            // Calculate Match Score
            const score = this.calculateMatchScore(v, profile);
            v.matchScore = score;
            
            // If passes threshold (e.g., 50%)
            if (score >= 50) {
                 matches.push(v);
                 newVacancies.push({
                     vacancyId: v.id,
                     firstSeen: new Date(),
                     notified: false
                 });
            }
        }
      }

      console.log(`🎯 Found ${matches.length} new matches`);

      // 3. Notify
      if (matches.length > 0) {
          // Sort by score
          matches.sort((a, b) => b.matchScore - a.matchScore);

          // Telegram
          if (profile.telegramChatId && telegramService.initialized) {
              await telegramService.sendBatchNotification(profile.telegramChatId, matches, profile);
              
              // Mark as notified in memory (to be saved)
              for (const nv of newVacancies) {
                 nv.notified = true;
                 nv.notifiedAt = new Date();
              }
          }

          // Email (implement if needed, similar to above)
      }

      // 4. Save to DB
      if (newVacancies.length > 0) {
          await Vacancy.insertMany(newVacancies);
          console.log(`💾 Saved ${newVacancies.length} new vacancies to history`);
      }

    } catch (error) {
      console.error('❌ Scheduler error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  calculateMatchScore(vacancy, profile) {
    let score = 0;
    const maxScore = 100;

    const vTitle = vacancy.title.toLowerCase();
    const vDesc = vacancy.description.toLowerCase();
    const pRole = profile.role.toLowerCase();

    // 1. Role Match (40 pts)
    if (vTitle.includes(pRole) || pRole.includes(vTitle)) {
        score += 40;
    } else {
        // partial match
        const roleWords = pRole.split(' ');
        const matchCount = roleWords.filter(w => vTitle.includes(w)).length;
        if (matchCount > 0) score += (matchCount / roleWords.length) * 30;
    }

    // 2. Skills Match (30 pts)
    const pSkills = profile.skills.map(s => s.toLowerCase());
    if (pSkills.length > 0) {
        let skillMatches = 0;
        pSkills.forEach(skill => {
            if (vDesc.includes(skill) || vTitle.includes(skill)) {
                skillMatches++;
            }
        });
        const matchRatio = Math.min(skillMatches / pSkills.length, 1);
        score += matchRatio * 30;
    }

    // 3. Location (10 pts)
    if (vacancy.location.toLowerCase().includes(profile.location.toLowerCase())) {
        score += 10;
    }

    // 4. Experience (20 pts)
    // Simple heuristic: check for keywords based on user level
    const level = profile.experienceLevel || 'middle';
    if (level === 'senior' && (vTitle.includes('senior') || vDesc.includes('senior'))) score += 20;
    else if (level === 'middle' && !vTitle.includes('senior') && !vTitle.includes('junior')) score += 20;
    else if (level === 'junior' && (vTitle.includes('junior') || vTitle.includes('trainee'))) score += 20;
    else score += 10; // Default partial credit

    return Math.min(score, maxScore);
  }
}

export const notificationScheduler = new NotificationScheduler();
