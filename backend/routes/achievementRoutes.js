const express = require('express');
const router = express.Router();
const {
  createAchievement,
  getAllAchievements,
  getAchievementById,
  getAchievementsByUSN,
  updateAchievement,
  deleteAchievement,
  approveAchievement,
  rejectAchievement,
  getDashboardStats,
} = require('../controllers/achievementController');

// Public routes
router.get('/', getAllAchievements);
router.get('/stats/dashboard', getDashboardStats);
router.get('/:id', getAchievementById);
router.get('/usn/:usn', getAchievementsByUSN);

// Private routes (require authentication)
router.post('/', createAchievement);
router.put('/:id', updateAchievement);
router.delete('/:id', deleteAchievement);

// Admin routes (approval system)
router.put('/:id/approve', approveAchievement);
router.put('/:id/reject', rejectAchievement);

module.exports = router;
