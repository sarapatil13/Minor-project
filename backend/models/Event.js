const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['Conference', 'Hackathon', 'Workshop', 'Seminar', 'Competition', 'Webinar'],
        required: true
    },
    organizer: { type: String, required: true }, // e.g., IEEE, IISc
    date: { type: Date, required: true },
    venue: { type: String, required: true },
    teamMembers: [{ type: String }], // List of names
    outcome: {
        type: String,
        enum: ['Winner', 'Runner-up', 'Second Runner-up', 'Participated', 'Finalist'],
        default: 'Participated'
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    certificateUrl: { type: String },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
