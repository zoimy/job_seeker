import schedule from 'node-cron';
import Vacancy from '../models/Vacancy.js';
import Profile from '../models/Profile.js';
import RabotaMdScraper from '../scrapers/rabotaMdScraper.js';
import { telegramService } from './telegramService.js';
import { analyzeSkillMatch } from '../utils/skillTaxonomy.js';

class NotificationScheduler {
  constructor() {
    this.scraper = new RabotaMdScraper();
    this.isRunning = false;
    this.lastCheckTime = null;
  }

  start() {
    // Run every 2 minutes (closest to "instant")
    // Use overlappingSchedule: false to prevent missed execution warnings
    schedule.schedule('*/2 * * * *', () => {
      if (!this.isRunning) {
        this.checkNewVacancies();
      } else {
        console.log('⏭️  Skipping scan - previous scan still running');
      }
    });
    console.log('⏰ Notification scheduler started (every 2 mins)');
    
    // Initial run (async, non-blocking)
    setTimeout(() => this.checkNewVacancies(), 1000);
  }

  async checkNewVacancies() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastCheckTime = new Date().toISOString();
    
    try {
      // 1. Fetch all active profiles
      const profiles = await Profile.find({ 
          notificationsEnabled: true,
          telegramChatId: { $ne: '' },
          userId: { $exists: true }
      });
      
      const now = Date.now();
      const profilesToScan = profiles.filter(p => {
        // Calculate cooldown
        const lastScraped = p.lastScraped ? new Date(p.lastScraped).getTime() : 0;
        let cooldownMs = 1000 * 60 * 60 * 6; // Default 6h

        switch(p.scanFrequency) {
            case 'instant': cooldownMs = 1000 * 60 * 2; break; // 2 min
            case '5min': cooldownMs = 1000 * 60 * 5; break;
            case '1h': cooldownMs = 1000 * 60 * 60; break;
            case '6h': cooldownMs = 1000 * 60 * 60 * 6; break;
            case '24h': cooldownMs = 1000 * 60 * 60 * 24; break;
        }

        const diff = now - lastScraped;
        const isDue = diff >= cooldownMs;

        if (!isDue) {
             const minutesLeft = Math.ceil((cooldownMs - diff) / 60000);
             if (minutesLeft > 0) {
                 // Only log if significant wait, to avoid spamming immediate retries logs
                 // Or log everything for now to help user debug
                 console.log(`   ⏳ User ${p.userId} (${p.role}) skipped. Freq: ${p.scanFrequency}. Next scan in ~${minutesLeft} mins.`);
             }
        }

        return isDue;
      });

      console.log(`🔍 Scanner awake. Found ${profiles.length} total profiles, ${profilesToScan.length} due for scan.`);

      if (profilesToScan.length === 0) {
          this.isRunning = false;
          return;
      }

      // Initialize Telegram Service
      if (process.env.TELEGRAM_BOT_TOKEN && !telegramService.initialized) {
        await telegramService.initialize(process.env.TELEGRAM_BOT_TOKEN);
      }

      // 2. Process only due profiles
      for (const profile of profilesToScan) {
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
            // Check existing notifications
            let shouldNotify = true;
            const now = Date.now();
            const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

            // 1. Check legacy array (if strict "never again") - Optional, we can ignore this if we want re-notify
            // But user said "only through a month". Assuming legacy data is "recent".
            // Let's migrate legacy: If in notifiedUsers but not in log, assume sent "recently" (skip for now to avoid spam)
            const inLegacy = dbVacancy.notifiedUsers && dbVacancy.notifiedUsers.includes(profile.userId);
            
            // 2. Check new log
            const logEntry = dbVacancy.notificationLog.find(l => l.userId === profile.userId);
            
            if (logEntry) {
                const timeSince = now - new Date(logEntry.sentAt).getTime();
                if (timeSince < ONE_MONTH) {
                    shouldNotify = false; // Seen less than a month ago
                }
            } else if (inLegacy) {
                shouldNotify = false; // Legacy suppression (assume valid)
            }
            
            if (shouldNotify) {
                // Calculate score
                const score = this.calculateMatchScore(v, profile);
                
                if (score >= (profile.minMatchScore || 50)) {
                    matchesToNotify.push({ vacancy: v, matchScore: score });
                    
                    // Update Log
                    if (logEntry) {
                        logEntry.sentAt = new Date(); // Update timestamp
                    } else {
                        dbVacancy.notificationLog.push({ userId: profile.userId, sentAt: new Date() });
                    }
                    // Keep legacy sync for safety
                    if (!inLegacy) dbVacancy.notifiedUsers.push(profile.userId);
                    
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
                    notifiedUsers: [profile.userId],
                    notificationLog: [{ userId: profile.userId, sentAt: new Date() }]
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
    const vFullText = `${vTitle} ${vDesc}`;
    const pRole = (profile.role || '').toLowerCase();
    const pSkills = profile.skills || [];

    // 1. SKILLS MATCH (50 points) - MOST IMPORTANT
    let skillScore = 0;
    let skillAnalysis = { matched: [], incompatible: [], matchRatio: 0 };
    
    if (pSkills.length > 0) {
      skillAnalysis = analyzeSkillMatch(pSkills, vFullText);
      const { matched, incompatible, matchRatio } = skillAnalysis;
      
      // Base skill score from match ratio
      skillScore = matchRatio * 50;
      
      // CRITICAL: If NO skills match at all, instant fail
      if (matched.length === 0) {
        return 0; // Zero compatibility
      }
      
      // PENALTY: Incompatible tech stacks (e.g., React profile vs PHP vacancy)
      if (incompatible.length > 0) {
        const penalty = Math.min(incompatible.length * 15, 40); // Heavy penalty
        skillScore -= penalty;
        
        // If more incompatibilities than matches, likely wrong stack
        if (incompatible.length >= matched.length) {
          skillScore = Math.max(skillScore - 20, 0);
        }
      }
      
      // BONUS: High skill overlap (>=60% match)
      if (matchRatio >= 0.6) {
        skillScore += 10;
      }
    } else {
      // No skills defined - give minimal score to allow any vacancy
      skillScore = 25;
    }
    
    score += Math.max(0, skillScore);

    // 2. ROLE MATCH (30 points)
    let roleScore = 0;
    
    if (pRole) {
      // Exact or strong match
      if (vTitle.includes(pRole)) {
        roleScore = 30;
      } else if (pRole.includes(vTitle) && vTitle.length > 3) {
        roleScore = 25;
      } else {
        // Partial word match
        const roleWords = pRole.split(' ').filter(w => w.length > 2);
        const matchedWords = roleWords.filter(w => vTitle.includes(w) || vDesc.includes(w));
        
        if (matchedWords.length > 0) {
          roleScore = (matchedWords.length / roleWords.length) * 20;
        }
      }
      
      // PENALTY: Level mismatch for junior/senior
      const level = (profile.experienceLevel || '').toLowerCase();
      if (level === 'junior' && (vTitle.includes('senior') || vTitle.includes('lead') || vTitle.includes('principal'))) {
        roleScore -= 15;
      } else if ((level === 'senior' || level === 'lead') && (vTitle.includes('junior') || vTitle.includes('trainee') || vTitle.includes('intern'))) {
        roleScore -= 15;
      }
    }
    
    score += Math.max(0, roleScore);

    // 3. LOCATION (10 points)
    if (profile.location && vacancy.location) {
      const pLoc = profile.location.toLowerCase();
      const vLoc = vacancy.location.toLowerCase();
      
      if (vLoc.includes(pLoc) || pLoc.includes(vLoc)) {
        score += 10;
      } else if (vLoc.includes('remote') || vLoc.includes('anywhere')) {
        score += 5; // Remote is flexible
      }
    }

    // 4. EXPERIENCE LEVEL (10 points)
    const level = (profile.experienceLevel || '').toLowerCase();
    const years = profile.yearsOfExperience || 0;
    
    if (level && level !== 'any') {
      // Exact level match
      if (vTitle.includes(level) || vDesc.includes(level)) {
        score += 10;
      } 
      // Years of experience alignment
      else if (years > 0) {
        if ((years >= 5 && (vTitle.includes('senior') || vDesc.includes('senior'))) ||
            (years < 2 && (vTitle.includes('junior') || vDesc.includes('junior'))) ||
            (years >= 2 && years < 5 && (vTitle.includes('middle') || vDesc.includes('mid-level')))) {
          score += 7;
        } else {
          score += 3; // Partial credit
        }
      }
    }

    // FINAL ADJUSTMENTS
    // Ensure score is within bounds
    score = Math.max(0, Math.min(score, maxScore));
    
    // Round to integer for cleaner display
    return Math.round(score);
  }
}

export const notificationScheduler = new NotificationScheduler();
