const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
    areaName: {
        type: String,
        required: true
    },
    subAreas: [{
        type: String
    }]
});

module.exports = mongoose.model('Area', areaSchema);