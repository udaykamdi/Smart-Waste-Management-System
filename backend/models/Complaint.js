const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.Mixed, // Allow both ObjectId and string
        ref: 'User',
        required: true
    },
    bin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bin',
        required: false
    },
    suggestedBin: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    resolvedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Complaint', complaintSchema);
