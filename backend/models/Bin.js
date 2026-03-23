const mongoose = require('mongoose');

const binSchema = new mongoose.Schema({
    binName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    assignedDriver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    cleaningPeriod: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    fillLevel: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    lastCleaned: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Bin', binSchema);
