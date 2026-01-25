import express from 'express';
import Profile from '../models/Profile.js';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile
// @access  Public (for MVP)
router.get('/', async (req, res) => {
  try {
    let profile = await Profile.findOne();
    
    // Return empty object if no profile yet, or default structure
    if (!profile) {
      return res.json({ profile: null });
    }

    res.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   POST /api/profile
// @desc    Update or create user profile
// @access  Public
router.post('/', async (req, res) => {
  try {
    const profileData = req.body;

    // Use findOneAndUpdate with upsert: true to maintain a single profile
    // The query is empty {} to find ANY document (assuming singleton)
    // If multiple exist, this updates the first one found.
    // If none exist, it creates one.
    
    // However, if we want to ensure only ONE document ever, we can use a fixed ID or check count.
    // For MVP, simple findOneAndUpdate is fine.
    
    let profile = await Profile.findOne();
    
    if (profile) {
        // Update existing
        profile = await Profile.findByIdAndUpdate(
            profile._id, 
            { $set: profileData }, 
            { new: true }
        );
    } else {
        // Create new
        profile = await Profile.create(profileData);
    }

    res.json({ 
        success: true, 
        profile 
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// @route   DELETE /api/profile
// @desc    Delete user profile and all data
// @access  Public
router.delete('/', async (req, res) => {
  try {
    // Delete Profile
    await Profile.deleteMany({});
    
    // Dynamic import to avoid circular dependency if not careful, 
    // or just import Vacancy model at top.
    const Vacancy = (await import('../models/Vacancy.js')).default;
    await Vacancy.deleteMany({});

    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

export default router;
