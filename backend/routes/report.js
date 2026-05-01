const express = require('express');
const router = express.Router();
const Paper = require('../models/Paper');
const Event = require('../models/Event');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /annual
router.get('/annual', authMiddleware, adminOnly, async (req, res) => {
    try {
        const { year } = req.query;
        if (!year) return res.status(400).json({ message: 'Year is required' });

        const targetYear = parseInt(year);
        const startDate = new Date(`${targetYear}-01-01`);
        const endDate = new Date(`${targetYear}-12-31`);

        // Papers (using year field)
        const papers = await Paper.find({
            status: 'approved',
            year: targetYear
        }).populate('departmentId', 'name');

        // Events (using date field)
        const events = await Event.find({
            date: { $gte: startDate, $lte: endDate }
        });

        // Dept-wise counts
        const deptCounts = {};
        papers.forEach(p => {
            const deptName = p.departmentId?.name || 'Unknown';
            deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;
        });

        res.json({
            total_papers: papers.length,
            total_events: events.length,
            dept_wise_counts: deptCounts,
            papers,
            events
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
