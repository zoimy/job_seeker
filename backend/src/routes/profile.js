import express from 'express';
import Profile from '../models/Profile.js';
import { validate, validators } from '../utils/validation.js';
import { catchAsync } from '../utils/errorHandler.js';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile
// @access  Public (for MVP)
router.get('/', catchAsync(async (req, res) => {
  let profile = await Profile.findOne();
  
  // Return empty object if no profile yet, or default structure
  if (!profile) {
    return res.json({ profile: null });
  }

  res.json({ profile });
}));

// @route   POST /api/profile
// @desc    Update or create user profile
// @access  Public
router.post('/', validate(validators.profile), catchAsync(async (req, res) => {
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
            { new: true, runValidators: true } // Added runValidators
        );
    } else {
        // Create new
        profile = await Profile.create(profileData);
    }

    res.json({ 
        success: true, 
        profile 
    });
}));

// @route   DELETE /api/profile
// @desc    Delete user profile and all data
// @access  Public
router.delete('/', catchAsync(async (req, res) => {
    // Delete Profile
    await Profile.deleteMany({});
    
    // Dynamic import to avoid circular dependency if not careful, 
    // or just import Vacancy model at top.
    const Vacancy = (await import('../models/Vacancy.js')).default;
    await Vacancy.deleteMany({});

    res.json({ success: true, message: 'Account deleted' });
}));

export default router;
