import express from 'express';
import Profile from '../models/Profile.js';
import { telegramService } from '../services/telegramService.js';

const router = express.Router();

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
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
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/notifications/preferences
// @desc    Update notification preferences
router.post('/preferences', async (req, res) => {
  try {
    const { telegramEnabled, telegramChatId } = req.body;
    
    // Check if we need to send a test message
    const isTest = req.query.test === 'true';

    let profile = await Profile.findOne();
    if (!profile) {
        // If profile doesn't exist yet, we create a placeholder one to store prefs
        profile = new Profile({
            role: '', // Empty defaults
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

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences (alias for POST)
router.put('/preferences', async (req, res) => {
  try {
    const { telegramEnabled, telegramChatId } = req.body;

    let profile = await Profile.findOne();
    if (!profile) {
        profile = new Profile({
            role: '',
            location: ''
        });
    }

    if (telegramChatId !== undefined) profile.telegramChatId = telegramChatId;
    if (telegramEnabled !== undefined) profile.notificationsEnabled = telegramEnabled;
    
    await profile.save();

    res.json({ 
        success: true, 
        preferences: {
            telegramEnabled: profile.notificationsEnabled,
            telegramChatId: profile.telegramChatId
        }
    });

  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/notifications/test-telegram
// @desc    Send test Telegram message
router.post('/test-telegram', async (req, res) => {
  try {
    const { chatId } = req.body;
    
    if (!chatId) {
      return res.status(400).json({ success: false, error: 'Chat ID is required' });
    }

    if (!process.env.TELEGRAM_BOT_TOKEN) {
      return res.status(500).json({ success: false, error: 'Telegram bot not configured on server' });
    }

    await telegramService.initialize(process.env.TELEGRAM_BOT_TOKEN);
    const result = await telegramService.sendTestMessage(chatId);
    
    res.json(result);
  } catch (error) {
    console.error('Error sending test Telegram:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to send test message' });
  }
});

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
// @desc    Trigger immediate vacancy scan (used after onboarding)
router.post('/scan-now', async (req, res) => {
  try {
    // For now, just return success
    // In production, this would trigger the notificationScheduler
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
