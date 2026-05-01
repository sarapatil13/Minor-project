const express = require('express');
const router = express.Router();
const Paper = require('../models/Paper');
const Notification = require('../models/Notification');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// GET /stats - Admin Dashboard Stats
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        // Allow simplified access for demo/faculty too, but ideally strictly RBAC
        if (user.role !== 'admin' && user.role !== 'faculty') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const Event = require('../models/Event');
        const events = await Event.find({});
        let totalParticipants = 0;
        events.forEach(ev => {
            if (ev.participants) totalParticipants += ev.participants.length;
        });

        const stats = {
            total: await Paper.countDocuments({}),
            approved: await Paper.countDocuments({ status: { $in: ['approved', 'published'] } }),
            pending: await Paper.countDocuments({ status: { $regex: /^pending/ } }), // Matches pending_faculty, pending_admin, etc.
            rejected: await Paper.countDocuments({ status: 'rejected' }),
            totalParticipants
        };

        // Papers per Department
        const papers = await Paper.find({ status: { $in: ['approved', 'published'] } }).populate('departmentId', 'name');
        const deptCounts = {};
        const yearlyCounts = {};
        const typeCounts = {};

        papers.forEach(p => {
            const deptName = p.departmentId ? p.departmentId.name : 'Unassigned';
            deptCounts[deptName] = (deptCounts[deptName] || 0) + 1;

            const year = p.year || new Date(p.createdAt).getFullYear();
            yearlyCounts[year] = (yearlyCounts[year] || 0) + 1;

            const type = p.type || 'Other';
            typeCounts[type] = (typeCounts[type] || 0) + 1;
        });

        stats.papersPerDept = Object.keys(deptCounts).map(key => ({
            name: key,
            count: deptCounts[key]
        }));

        stats.papersPerYear = Object.keys(yearlyCounts).sort().map(year => ({
            year,
            count: yearlyCounts[year]
        }));

        stats.papersByType = Object.keys(typeCounts).map(type => ({
            name: type,
            value: typeCounts[type]
        }));

        res.json(stats);
    } catch (err) {
        console.error("Stats Error:", err);
        res.status(500).json({ message: 'Server error retrieving stats' });
    }
});

// GET /pending-papers - Admin and Faculty
router.get('/pending-papers', authMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        let query = { status: 'pending' };

        // Faculty can only see papers from their department
        if (user.role === 'faculty') {
            query.departmentId = user.departmentId;
        } else if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const papers = await Paper.find(query)
            .populate('submittedBy', 'fullName email')
            .populate('departmentId', 'name')
            .sort({ createdAt: -1 });
        res.json(papers);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /approve-paper/:id - Admin and Faculty
router.patch('/approve-paper/:id', authMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        const paper = await Paper.findById(req.params.id).populate('departmentId');
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        // Faculty can only approve papers from their department
        if (user.role === 'faculty') {
            if (!paper.departmentId || paper.departmentId._id.toString() !== user.departmentId.toString()) {
                return res.status(403).json({ message: 'You can only approve papers from your department' });
            }
        } else if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        paper.status = 'approved';
        await paper.save();

        // Create Notification
        const notification = new Notification({
            userId: paper.submittedBy,
            type: 'paper_status',
            title: 'Paper Approved',
            body: `Your paper "${paper.title}" has been approved.`,
        });
        await notification.save();

        res.json({ message: 'Paper approved', paper });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /reject-paper/:id - Admin and Faculty
router.patch('/reject-paper/:id', authMiddleware, async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        const paper = await Paper.findById(req.params.id).populate('departmentId');
        if (!paper) {
            return res.status(404).json({ message: 'Paper not found' });
        }

        // Faculty can only reject papers from their department
        if (user.role === 'faculty') {
            if (!paper.departmentId || paper.departmentId._id.toString() !== user.departmentId.toString()) {
                return res.status(403).json({ message: 'You can only reject papers from your department' });
            }
        } else if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        paper.status = 'rejected';
        await paper.save();

        // Create Notification
        const notification = new Notification({
            userId: paper.submittedBy,
            type: 'paper_status',
            title: 'Paper Rejected',
            body: `Your paper "${paper.title}" has been rejected.`,
        });
        await notification.save();

        res.json({ message: 'Paper rejected', paper });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /users - List all users (Admin only)
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
    try {
        const User = require('../models/User');
        const users = await User.find().populate('departmentId', 'name code').select('-passwordHash');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH /user/:id - Update user role/department (Admin only)
router.patch('/user/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        const User = require('../models/User');
        const { role, departmentId } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, departmentId: departmentId || null },
            { new: true }
        ).populate('departmentId', 'name code');

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

