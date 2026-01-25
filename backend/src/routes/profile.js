import express from 'express';
import Profile from '../models/Profile.js';
import { validate, validators } from '../utils/validation.js';
import { catchAsync } from '../utils/errorHandler.js';
import { identifyUser } from '../middleware/identifyUser.js';
import { profileCreationLimiter } from '../config/security.js';

const router = express.Router();

// @route   GET /api/profile
// @desc    Get user profile (identified by x-user-id header)
// @access  Public (Invisible Auth)
router.get('/', identifyUser, catchAsync(async (req, res) => {
  const profile = await Profile.findOne({ userId: req.userId });
  
  // Return empty object if no profile yet, or default structure
  if (!profile) {
    return res.json({ profile: null });
  }

  res.json({ profile });
}));

// @route   POST /api/profile
// @desc    Update or create user profile
// @access  Public (Invisible Auth)
router.post('/', identifyUser, profileCreationLimiter, validate(validators.profile), catchAsync(async (req, res) => {
  const profileData = req.body;
  
  // Normalize data to avoid Enum validation errors
  if (profileData.preferredWorkplace && Array.isArray(profileData.preferredWorkplace)) {
      profileData.preferredWorkplace = profileData.preferredWorkplace.map(w => w.toLowerCase());
  }
  if (profileData.preferredSchedule && Array.isArray(profileData.preferredSchedule)) {
      profileData.preferredSchedule = profileData.preferredSchedule.map(w => w.toLowerCase());
  }

  const userId = req.userId;

    // Remove immutable fields if present in body
    delete profileData.userId;

    // Find and update, or create with userId
    let profile = await Profile.findOneAndUpdate(
        { userId: userId },
        { 
            $set: profileData,
            $setOnInsert: { userId: userId } // Ensure userId is set on creation
        },
        { new: true, upsert: true, runValidators: true }
    );

    res.json({ 
        success: true, 
        profile 
    });
}));

// @route   DELETE /api/profile
// @desc    Delete user profile and all data
// @access  Public (Invisible Auth)
router.delete('/', identifyUser, catchAsync(async (req, res) => {
    // Delete ONLY this user's profile
    await Profile.deleteOne({ userId: req.userId });
    
    // Optional: Clean up notifications in vacancies? 
    // Usually too expensive to iterate all vacancies. 
    // We leave the ID in 'notifiedUsers' for now, no harm.

    res.json({ success: true, message: 'Account and profile deleted' });
}));

export default router;
