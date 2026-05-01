const express = require('express');
const router = express.Router();
const Department = require('../models/Department');

// GET / - List Departments with stats
router.get('/', async (req, res) => {
    try {
        const Paper = require('../models/Paper');
        const User = require('../models/User');

        const departments = await Department.find().populate('hod', 'fullName email').sort({ name: 1 });

        // Enhance departments with real-time counts
        const enhancedDepts = await Promise.all(departments.map(async (dept) => {
            const paperCount = await Paper.countDocuments({ departmentId: dept._id, status: { $in: ['approved', 'published'] } });
            const facultyCount = await User.countDocuments({ departmentId: dept._id, role: { $in: ['faculty', 'hod'] } });

            return {
                ...dept.toObject(),
                paperCount,
                facultyCount
            };
        }));

        res.json(enhancedDepts);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /:id/faculty - Get faculty for a department
router.get('/:id/faculty', async (req, res) => {
    try {
        const User = require('../models/User');
        const faculty = await User.find({
            departmentId: req.params.id,
            role: { $in: ['faculty', 'hod'] }
        }).select('fullName email role');
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /:id - Update Department (Admin only)
router.put('/:id', async (req, res) => {
    try {
        const { name, code, description, hod, establishedYear } = req.body;
        const dept = await Department.findByIdAndUpdate(
            req.params.id,
            { name, code, description, hod: hod || null, establishedYear },
            { new: true }
        );
        res.json(dept);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST / - Create Department (Admin only)
router.post('/', async (req, res) => {
    try {
        const { name, code } = req.body;
        const dept = new Department({ name, code });
        await dept.save();
        res.status(201).json(dept);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /:id - Delete Department (Admin only)
router.delete('/:id', async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
