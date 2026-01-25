import express from 'express';
import Profile from '../models/Profile.js';
import { telegramService } from '../services/telegramService.js';
import { notificationScheduler } from '../services/notificationScheduler.js';
import { validate, validators } from '../utils/validation.js';
import { catchAsync } from '../utils/errorHandler.js';
import { identifyUser } from '../middleware/identifyUser.js';

const router = express.Router();

// Helper to get or create profile
const getOrCreateProfile = async () => {
    let profile = await Profile.findOne();
    if (!profile) {
        profile = new Profile({
            role: '', 
            location: ''
        });
    }
    return profile;
};

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
router.get('/preferences', identifyUser, catchAsync(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.userId });
    
    // Return default preferences if no profile exists
    if (!profile) {
      return res.json({
        preferences: {
            telegramEnabled: false,
            emailEnabled: false,
            browserEnabled: false,
            minMatchScore: 60,
            telegramChatId: ''
        }
      });
    }

    res.json({
      preferences: {
        telegramEnabled: profile.notificationsEnabled !== false, // Default to true if undefined
        emailEnabled: false, // Not implemented yet
        browserEnabled: false, // Not implemented yet
        minMatchScore: 60, // Could be stored in DB too
        telegramChatId: profile.telegramChatId || ''
      }
    });
}));

// Handle preference updates (shared logic)
const updatePreferences = catchAsync(async (req, res) => {
    const { telegramEnabled, telegramChatId } = req.body;
    
    // Check if we need to send a test message
    const isTest = req.query.test === 'true';

    // Find or create profile for this user
    let profile = await Profile.findOne({ userId: req.userId });
    
    if (!profile) {
        // Should generally exist if they are exploring settings, but create if mostly empty
        profile = new Profile({ 
            userId: req.userId,
            role: '', 
            location: '' 
        });
    }

    // Update fields
    if (telegramChatId !== undefined) profile.telegramChatId = telegramChatId;
    if (telegramEnabled !== undefined) profile.notificationsEnabled = telegramEnabled;
    
    await profile.save();

    // Handle Test Message
    if (isTest && telegramChatId) {
        if (!process.env.TELEGRAM_BOT_TOKEN) {
            return res.status(400).json({ success: false, error: 'Bot token not configured on server' });
        }
        
        await telegramService.initialize(process.env.TELEGRAM_BOT_TOKEN);
        const result = await telegramService.sendTestMessage(telegramChatId);
        
        if (!result.success) {
            return res.status(400).json(result);
        }
    }

    res.json({ 
        success: true, 
        preferences: {
            telegramEnabled: profile.notificationsEnabled,
            telegramChatId: profile.telegramChatId
        }
    });
});

// @route   POST /api/notifications/preferences
// @desc    Update notification preferences
router.post('/preferences', identifyUser, validate(validators.preferences), updatePreferences);

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences (alias for POST)
router.put('/preferences', identifyUser, validate(validators.preferences), updatePreferences);

// @route   POST /api/notifications/test-telegram
// @desc    Send test Telegram message
router.post('/test-telegram', catchAsync(async (req, res) => {
    const { chatId } = req.body;
    
    if (!chatId) {
      // Manual validation fallback for this specific check if strict validation not used
       return res.status(400).json({ success: false, error: 'Chat ID is required' });
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ success: false, error: 'Telegram bot not configured on server' });
    }

    await telegramService.initialize(process.env.TELEGRAM_BOT_TOKEN);
    const result = await telegramService.sendTestMessage(chatId);
    
    res.json(result);
}));

// @route   POST /api/notifications/test
// @desc    Send test email notification
router.post('/test', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    // Email functionality not implemented yet
    // For now, return a mock success
    res.json({ 
      success: true, 
      message: 'Email test not yet implemented. Coming soon!' 
    });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send test email' });
  }
});

// @route   POST /api/notifications/scan-now
// @desc    Trigger immediate vacancy scan
router.post('/scan-now', identifyUser, async (req, res) => {
  try {
    // Trigger the scan asynchronously (don't wait for it to finish)
    // We pass the specific userId to valid it creates logs correctly, 
    // though the scheduler currently scans ALL users. 
    // Optimization: In future, pass req.userId to scan ONLY this user.
    notificationScheduler.checkNewVacancies().catch(err => console.error(err));

    res.json({ 
      success: true,
      message: 'Scan started. You will receive notifications as matches are found.'
    });
  } catch (error) {
    console.error('Error triggering scan:', error);
    res.status(500).json({ success: false, error: 'Failed to trigger scan' });
  }
});

export default router;
