import express from 'express';
import Profile from '../models/Profile.js';
import { identifyUser } from '../middleware/identifyUser.js';
import { telegramService } from '../services/telegramService.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(identifyUser);

// @route   GET /api/integrations
// @desc    Get all integrations with their status
// @route   GET /api/integrations
// @desc    Get all integrations with their status
router.get('/', catchAsync(async (req, res) => {
    const profile = await Profile.findOne({ userId: req.userId });
    
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

    res.json({ 
      success: true,
      integrations
    });
}));

// @route   PUT /api/integrations/telegram
// @desc    Update Telegram integration settings
// @route   PUT /api/integrations/telegram
// @desc    Update Telegram integration settings
router.put('/telegram', catchAsync(async (req, res) => {
    const { status, connectionInfo, settings } = req.body;
    
    let profile = await Profile.findOne({ userId: req.userId });
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

    res.json({ 
      success: true,
      integration: {
        id: 'telegram',
        status: status || 'connected',
        connectionInfo,
        settings
      }
    });
}));

// @route   PUT /api/integrations/email
// @desc    Update Email integration settings
// @route   PUT /api/integrations/email
// @desc    Update Email integration settings
router.put('/email', catchAsync(async (req, res) => {
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
}));

// @route   POST /api/integrations/:id/test
// @desc    Test an integration
router.post('/:id/test', catchAsync(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    // 1. Telegram Test
    if (id === 'telegram') {
        const profile = await Profile.findOne({ userId });
        const chatId = profile?.telegramChatId;

        if (!chatId) {
            return res.status(400).json({ success: false, error: 'Connect Telegram first (Chat ID missing)' });
        }

        if (!process.env.TELEGRAM_BOT_TOKEN) {
            return res.status(500).json({ success: false, error: 'Server Telegram config missing' });
        }

        await telegramService.initialize(process.env.TELEGRAM_BOT_TOKEN);
        const result = await telegramService.sendTestMessage(chatId);
        
        if (!result.success) {
             return res.status(400).json(result);
        }
        return res.json(result);
    }

    // 2. Email Test (Mock)
    if (id === 'email') {
        return res.json({ success: true, message: 'Email test sent (mock)' });
    }

    return res.status(400).json({ success: false, error: `Testing not supported for ${id}` });
}));

export default router;
