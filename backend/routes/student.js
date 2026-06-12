const express = require('express');
const router = express.Router();
const { getStudentDashboard } = require('../controllers/recController');

// GET /api/student/:studentId/dashboard
router.get('/:studentId/dashboard', getStudentDashboard);

module.exports = router;
