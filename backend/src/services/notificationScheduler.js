import schedule from 'node-cron';
import Vacancy from '../models/Vacancy.js';
import Profile from '../models/Profile.js';
import RabotaMdScraper from '../scrapers/rabotaMdScraper.js';
import { telegramService } from './telegramService.js';

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
      console.log('🔍 Checking for new vacancies for all users...');
      
      // 1. Fetch all active profiles
      const profiles = await Profile.find({ 
          notificationsEnabled: true,
          telegramChatId: { $ne: '' },
          userId: { $exists: true }
      });
      
      console.log(`👤 Found ${profiles.length} active profiles to process`);

      if (profiles.length === 0) {
          this.isRunning = false;
          return;
      }

      // Initialize Telegram Service
      if (process.env.TELEGRAM_BOT_TOKEN && !telegramService.initialized) {
        await telegramService.initialize(process.env.TELEGRAM_BOT_TOKEN);
      }

      // 2. Process each profile independently (Sequential to avoid overload)
      for (const profile of profiles) {
          try {
              await this.processProfile(profile);
              // Small delay between users to be polite to the target site and logs
              await new Promise(r => setTimeout(r, 2000));
          } catch (err) {
              console.error(`❌ Error processing profile ${profile.userId}:`, err.message);
          }
      }

    } catch (error) {
      console.error('❌ Scheduler error:', error);
    } finally {
      this.isRunning = false;
    }
  }

  async processProfile(profile) {
      console.log(`🔎 Processing profile for User: ${profile.userId} (Role: ${profile.role})`);

      // 1. Scrape
      const scrapedVacancies = await this.scraper.scrapeVacancies({
        query: profile.role || 'IT', // Fallback if empty
        location: profile.location || 'chisinau',
        searchPeriodDays: 1
      });

      console.log(`   📥 Scraped ${scrapedVacancies.length} vacancies`);

      const matchesToNotify = [];
      const vacanciesToSave = [];

      // 2. Filter and Match
      for (const v of scrapedVacancies) {
        // Find existing vacancy in DB (shared cache)
        let dbVacancy = await Vacancy.findOne({ vacancyId: v.id });

        if (dbVacancy) {
            // Check if THIS user was already notified
            const alreadyNotified = dbVacancy.notifiedUsers && dbVacancy.notifiedUsers.includes(profile.userId);
            
            if (!alreadyNotified) {
                // Calculate score
                const score = this.calculateMatchScore(v, profile);
                
                if (score >= (profile.minMatchScore || 50)) {
                    matchesToNotify.push({ vacancy: v, matchScore: score });
                    
                    // Mark user as notified in DB object
                    dbVacancy.notifiedUsers.push(profile.userId);
                    await dbVacancy.save();
                }
            }
        } else {
            // New vacancy never seen before
            const score = this.calculateMatchScore(v, profile);
            
            if (score >= (profile.minMatchScore || 50)) {
                matchesToNotify.push({ vacancy: v, matchScore: score });
                
                // Prepare new DB object
                const newVacancyData = {
                    ...v,
                    vacancyId: v.id,
                    firstSeen: new Date(),
                    notifiedUsers: [profile.userId]
                };
                
                // We save immediately to prevent race conditions if other users match same vacancy in next loop?
                // Actually safer to save immediately.
                await Vacancy.create(newVacancyData);
            } else {
                // Save it anyway as "seen" but nobody notified yet? 
                // Creating it avoids re-scraping processing logic, but maybe clutter?
                // Let's save it without notifiedUsers for now so we don't re-process it as "unknown".
                 await Vacancy.create({
                    ...v,
                    vacancyId: v.id,
                    firstSeen: new Date(),
                    notifiedUsers: []
                });
            }
        }
      }

      // 3. Send Notifications
      if (matchesToNotify.length > 0 && telegramService.initialized) {
          matchesToNotify.sort((a, b) => b.matchScore - a.matchScore); // Highest score first
          
          console.log(`   🚀 Sending ${matchesToNotify.length} notifications to Chat ID ${profile.telegramChatId}`);
          await telegramService.sendBatchNotification(profile.telegramChatId, matchesToNotify, profile);
          
          // Update profile lastScraped
          profile.lastScraped = new Date();
          await profile.save();
      }
  }

  calculateMatchScore(vacancy, profile) {
    let score = 0;
    const maxScore = 100;

    const vTitle = (vacancy.title || '').toLowerCase();
    const vDesc = (vacancy.description || '').toLowerCase();
    const pRole = (profile.role || '').toLowerCase();

    // 1. Role Match (40 pts)
    if (vTitle.includes(pRole) || pRole.includes(vTitle)) {
        score += 40;
    } else {
        const roleWords = pRole.split(' ');
        const matchCount = roleWords.filter(w => vTitle.includes(w)).length;
        if (matchCount > 0) score += (matchCount / roleWords.length) * 30;
    }

    // 2. Skills Match (30 pts)
    const pSkills = profile.skills || [];
    if (pSkills.length > 0) {
        let skillMatches = 0;
        pSkills.forEach(skill => {
            if (skill && (vDesc.includes(skill.toLowerCase()) || vTitle.includes(skill.toLowerCase()))) {
                skillMatches++;
            }
        });
        const matchRatio = Math.min(skillMatches / pSkills.length, 1);
        score += matchRatio * 30;
    }

    // 3. Location (10 pts)
    if (profile.location && vacancy.location && vacancy.location.toLowerCase().includes(profile.location.toLowerCase())) {
        score += 10;
    }

    // 4. Experience (20 pts)
    const level = (profile.experienceLevel || 'middle').toLowerCase();
    
    // Negative Check for Junior
    if (level === 'junior' && (vTitle.includes('senior') || vTitle.includes('lead'))) {
        score -= 20; // Penalize mismatch
    } else if (level === 'senior' && (vTitle.includes('junior') || vTitle.includes('trainee'))) {
        score -= 20;
    } else {
         // Bonus for match
         if (vTitle.includes(level) || vDesc.includes(level)) score += 20;
         else score += 10; // Default
    }

    return Math.max(0, Math.min(score, maxScore));
  }
}

export const notificationScheduler = new NotificationScheduler();
