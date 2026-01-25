import express from 'express';
import Profile from '../models/Profile.js';

const router = express.Router();

// @route   GET /api/integrations
// @desc    Get all integrations with their status
router.get('/', async (req, res) => {
  try {
    const profile = await Profile.findOne();
    
    const integrations = [
      {
        id: 'telegram',
        name: 'Telegram',
        description: 'Receive instant job notifications via Telegram',
        status: profile?.telegramChatId ? 'connected' : 'disconnected',
        isPremium: false,
        connectionInfo: profile?.telegramChatId ? { chatId: profile.telegramChatId } : undefined,
        settings: {
          frequency: 'instant',
          format: 'compact'
        }
      },
      {
        id: 'email',
        name: 'Email',
        description: 'Get weekly job digests in your inbox',
        status: 'disconnected',
        isPremium: false,
        connectionInfo: undefined,
        settings: {
          frequency: 'weekly',
          format: 'html'
        }
      },
      {
        id: 'slack',
        name: 'Slack',
        description: 'Post new jobs to your Slack workspace',
        status: 'premium',
        isPremium: true
      },
      {
        id: 'discord',
        name: 'Discord',
        description: 'Send notifications to your Discord server',
        status: 'premium',
        isPremium: true
      },
      {
        id: 'whatsapp',
        name: 'WhatsApp',
        description: 'Get job alerts on WhatsApp',
        status: 'premium',
        isPremium: true
      }
    ];

    res.json({ 
      success: true,
      integrations
    });

  } catch (error) {
    console.error('Error fetching integrations:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/integrations/telegram
// @desc    Update Telegram integration settings
router.put('/telegram', async (req, res) => {
  try {
    const { status, connectionInfo, settings } = req.body;
    
    let profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({ success: false, error: 'Profile not found' });
    }

    // Store Telegram settings in profile
    if (connectionInfo?.chatId) {
      profile.telegramChatId = connectionInfo.chatId;
    }
    
    if (status === 'connected') {
      profile.notificationsEnabled = true;
    }

    await profile.save();

    res.json({ 
      success: true,
      integration: {
        id: 'telegram',
        status: status || 'connected',
        connectionInfo,
        settings
      }
    });

  } catch (error) {
    console.error('Error updating Telegram integration:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   PUT /api/integrations/email
// @desc    Update Email integration settings
router.put('/email', async (req, res) => {
  try {
    const { status, connectionInfo, settings } = req.body;
    
    // Email not fully implemented yet, but accept the data
    res.json({ 
      success: true,
      integration: {
        id: 'email',
        status: status || 'connected',
        connectionInfo,
        settings
      }
    });

  } catch (error) {
    console.error('Error updating Email integration:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

export default router;
